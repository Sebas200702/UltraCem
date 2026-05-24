import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { NLPService, type ConversationContext } from '@/domains/conversation/nlp.service';
import { getGeminiApiKey } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';
import type { ChatSendResponse, Message, MessageRole } from '@/types';



const chatSendSchema = z.object({
  conversationId: z.uuid('Debe ser un UUID válido').optional(),
  message: z.string().trim().min(1, 'Mensaje requerido'),
  userId: z.uuid('Debe ser un UUID válido').optional(),
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

export async function POST(request: NextRequest) {
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

  const { conversationId, message, userId } = parsedBody.data;
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

    const previousMessages = conversationId
      ? await prisma.message.findMany({
          where: { conversation_id: conversation.id },
          orderBy: { created_at: 'asc' },
        })
      : [];

    const conversationMetadata = isRecord(conversation.metadata) ? conversation.metadata : {};
    const currentExtractedData = isRecord(conversationMetadata.lastExtractedData)
      ? conversationMetadata.lastExtractedData
      : {};

    const userMessage = await prisma.message.create({
      data: {
        conversation_id: conversation.id,
        role: 'user',
        content: message,
        extracted_data: {},
      },
    });

    const nlpService = new NLPService(apiKey);
    const context: ConversationContext = {
      conversationId: conversation.id,
      messageHistory: previousMessages.map(toHistoryMessage),
      extractedData: currentExtractedData,
    };

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
          lastMessageId: userMessage.id,
          lastAssistantMessageId: assistantMessage.id,
        })),
      },
    });

    const data: ChatSendResponse = {
      conversationId: conversation.id,
      messageId: userMessage.id,
      reply: response.reply,
      isReadyForCalculation: response.isReadyForCalculation,
      extractedData: response.extractedData,
    };

    return NextResponse.json({
      success: true,
      data,
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
