import { NextRequest, NextResponse } from 'next/server';
import { chatWithVanesa } from '@/lib/gemini';
import type { ChatMessage } from '@/types';

function isMissingGeminiKeyError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /GEMINI_API_KEY|GOOGLE_API_KEY/.test(error.message)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages?: ChatMessage[];
      message?: string;
    };

    if (typeof body.message !== 'string' || body.message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Mensaje requerido',
          },
        },
        { status: 400 }
      );
    }

    const result = await chatWithVanesa(Array.isArray(body.messages) ? body.messages : [], body.message);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (isMissingGeminiKeyError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EXTERNAL_API_ERROR',
            message:
              'Configura GEMINI_API_KEY (o GOOGLE_API_KEY) en .env.local para usar el chat.',
          },
        },
        { status: 503 }
      );
    }

    console.error('Error en /api/chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NLP_ERROR',
          message: 'Error procesando el mensaje',
        },
      },
      { status: 500 }
    );
  }
}
