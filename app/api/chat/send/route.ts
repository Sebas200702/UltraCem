import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { NLPService, hasRequiredDimensions, type ConversationContext } from '@/domains/conversation/nlp.service';
import { getGeminiApiKey } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import { chatRateLimiter, enforceRateLimit } from '@/lib/rate-limiter';
import { detectRegion, type ColombianRegion } from '@/domains/region/region.service';
import { getStandardsService, mapToApplied } from '@/domains/standards/standards.service';
import { fastClassify } from '@/domains/agents/fast-classifier';
import { tryFastExtract } from '@/domains/conversation/fast-extract';
import type { ChatSendResponse, Message, MessageRole } from '@/types';

const chatSendSchema = z.object({
  conversationId: z.string().uuid('Debe ser un UUID válido').nullable().optional(),
  message: z.string().trim().min(1, 'Mensaje requerido'),
  userId: z.string().uuid('Debe ser un UUID válido').optional(),
  stream: z.boolean().optional().default(false),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toHistoryMessage(message: {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  extracted_data: unknown;
  created_at: Date;
}): Message {
  return {
    id: message.id,
    conversation_id: message.conversation_id,
    role: message.role as MessageRole,
    content: message.content,
    extracted_data: isRecord(message.extracted_data) ? message.extracted_data : {},
    created_at: message.created_at.toISOString(),
  };
}

const ENCODER = new TextEncoder();
const METADATA_DELIMITER = '\n\n___METADATA___\n';

export async function POST(request: NextRequest) {
  const rateLimitResponse = await enforceRateLimit(request, chatRateLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  const parsedBody = chatSendSchema.safeParse(await request.json().catch(() => null));

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Revisa el mensaje y vuelve a intentarlo.',
          details: parsedBody.error.issues,
        },
      },
      { status: 400 }
    );
  }

  const { conversationId, message, userId, stream: wantsStream } = parsedBody.data;
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EXTERNAL_API_ERROR',
          message: 'Configura GEMINI_API_KEY (o GOOGLE_API_KEY) para habilitar el chat.',
        },
      },
      { status: 503 }
    );
  }

  try {
    // local, synchronous work first (no I/O)
    const regionResult = detectRegion(message);
    const region: ColombianRegion | null = regionResult.region;
    const regionConfidence = regionResult.confidence;
    const classification = fastClassify(message);

    const nlpService = new NLPService(apiKey);
    const standardsService = getStandardsService(prisma);

    // standards retrieval doesn't depend on the conversation, so kick it off in
    // parallel with the conversation lookup to shave a DB round-trip.
    const standardsPromise = standardsService.retrieveStandards(
      classification.structureType,
      region,
      message
    );

    const conversation = conversationId
      ? await prisma.conversation.findUnique({ where: { id: conversationId } })
      : await prisma.conversation.create({
          data: {
            user_id: userId ?? null,
            status: 'active',
            metadata: {},
          },
        });

    if (!conversation) {
      // make sure the in-flight standards query doesn't dangle
      void standardsPromise.catch(() => undefined);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'La conversación no existe.',
          },
        },
        { status: 404 }
      );
    }

    // these two are independent (history vs. user-message insert) and both only
    // need conversation.id, so run them in parallel with standards.
    const [previousMessages, userMessageRecord, standards] = await Promise.all([
      conversationId
        ? prisma.message.findMany({
            where: { conversation_id: conversation.id },
            orderBy: { created_at: 'asc' },
          })
        : Promise.resolve([] as Awaited<ReturnType<typeof prisma.message.findMany>>),
      prisma.message.create({
        data: {
          conversation_id: conversation.id,
          role: 'user',
          content: message,
          extracted_data: {},
        },
      }),
      standardsPromise,
    ]);

    const conversationMetadata = isRecord(conversation.metadata) ? conversation.metadata : {};
    const currentExtractedData = isRecord(conversationMetadata.lastExtractedData)
      ? conversationMetadata.lastExtractedData
      : {};

    const context: ConversationContext = {
      conversationId: conversation.id,
      messageHistory: previousMessages.map(toHistoryMessage),
      extractedData: currentExtractedData,
      region,
      regionConfidence,
      standards: standards as ConversationContext['standards'],
    };

    const standardsApplied = standards.map(mapToApplied);

    if (!wantsStream) {
      // Non-streaming fallback (original behavior)
      const response = await nlpService.processMessage(message, context);

      const assistantMessage = await prisma.message.create({
        data: {
          conversation_id: conversation.id,
          role: 'assistant',
          content: response.reply,
          extracted_data: JSON.parse(JSON.stringify(response.extractedData ?? {})),
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          metadata: JSON.parse(JSON.stringify({
            ...conversationMetadata,
            lastExtractedData: response.extractedData ?? {},
            lastIntent: response.intent,
            lastMessageId: userMessageRecord.id,
            lastAssistantMessageId: assistantMessage.id,
            detectedRegion: region,
            regionConfidence,
            fastPath: classification.intent !== 'needs_gemini',
          })),
        },
      });

      const isReadyForCalculation =
        response.isReadyForCalculation || hasRequiredDimensions(response.extractedData);

      const data: ChatSendResponse = {
        conversationId: conversation.id,
        messageId: userMessageRecord.id,
        reply: response.reply,
        isReadyForCalculation,
        extractedData: response.extractedData,
        detectedRegion: region,
        standardsApplied,
        warnings: response.warnings?.map(w => ({ type: w.type, message: w.message, severity: w.severity })),
      };

      return NextResponse.json({ success: true, data });
    }

    // Streaming: deliver the natural-language reply first, then extract structured
    // data (fast local path or one Gemini call). Running both in parallel doubled
    // API load and could truncate replies when thinking tokens ate the budget.
    const stream = new ReadableStream({
      async start(controller) {
        let fullReply = '';

        try {
          const generator = nlpService.generateReplyStream(message, context);

          for await (const chunk of generator) {
            fullReply += chunk;
            controller.enqueue(ENCODER.encode(chunk));
          }
        } catch (streamErr) {
          console.error('Reply stream error:', streamErr);
          controller.enqueue(ENCODER.encode(FALLBACK_REPLY));
          fullReply = FALLBACK_REPLY;
        }

        const fastExtracted = tryFastExtract(message, currentExtractedData, region);
        const extracted = fastExtracted ?? await nlpService.extractData(message, context).catch((extractErr) => {
          console.error('Extract data error:', extractErr);
          return {
            reply: '',
            intent: 'unknown' as const,
            isReadyForCalculation: false,
            warnings: [],
          };
        });

        try {
          const assistantMessage = await prisma.message.create({
            data: {
              conversation_id: conversation.id,
              role: 'assistant',
              content: fullReply || extracted.reply || FALLBACK_REPLY,
              extracted_data: JSON.parse(JSON.stringify(extracted.extractedData ?? {})),
            },
          });

          await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              metadata: JSON.parse(JSON.stringify({
                ...conversationMetadata,
                lastExtractedData: extracted.extractedData ?? {},
                lastIntent: extracted.intent,
                lastMessageId: userMessageRecord.id,
                lastAssistantMessageId: assistantMessage.id,
                detectedRegion: region,
                regionConfidence,
                fastPath: classification.intent !== 'needs_gemini',
              })),
            },
          });
        } catch (dbErr) {
          console.error('DB persist after stream:', dbErr);
        }

        const isReadyForCalculation =
          (extracted.isReadyForCalculation || hasRequiredDimensions(extracted.extractedData)) ?? false;

        const metadata: ChatSendResponse = {
          conversationId: conversation.id,
          messageId: userMessageRecord.id,
          reply: fullReply || extracted.reply || FALLBACK_REPLY,
          isReadyForCalculation,
          extractedData: extracted.extractedData,
          detectedRegion: region,
          standardsApplied,
          warnings: extracted.warnings?.map((w) => ({ type: w.type, message: w.message, severity: w.severity })),
        };

        controller.enqueue(ENCODER.encode(METADATA_DELIMITER + JSON.stringify(metadata)));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        // disable proxy buffering (nginx, cloudflare) so chunks reach the client immediately
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Error en /api/chat/send:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NLP_ERROR',
          message: 'No fue posible procesar tu mensaje.',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
      },
      { status: 500 }
    );
  }
}

const FALLBACK_REPLY = 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías repetirlo?';
