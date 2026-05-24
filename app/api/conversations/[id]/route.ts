import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El ID de la conversación es requerido.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
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

    const messages = await prisma.message.findMany({
      where: { conversation_id: id },
      orderBy: { created_at: 'asc' },
    });

    const calculations = await prisma.calculation.findMany({
      where: { conversation_id: id },
      orderBy: { created_at: 'desc' },
    });

    const mappedMessages = messages.map((msg) => ({
      ...msg,
      extracted_data: isRecord(msg.extracted_data) ? msg.extracted_data : {},
      created_at: msg.created_at.toISOString(),
    }));

    const mappedCalculations = calculations.map((calc) => ({
      ...calc,
      volume_m3: calc.volume_m3 ? Number(calc.volume_m3) : null,
      materials: isRecord(calc.materials) ? calc.materials : {},
      dimensions: isRecord(calc.dimensions) ? calc.dimensions : {},
      created_at: calc.created_at.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        conversation: {
          ...conversation,
          metadata: isRecord(conversation.metadata) ? conversation.metadata : {},
          created_at: conversation.created_at.toISOString(),
          updated_at: conversation.updated_at.toISOString(),
        },
        messages: mappedMessages,
        calculations: mappedCalculations,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/conversations/[id]:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al obtener la conversación.',
          details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        },
      },
      { status: 500 }
    );
  }
}
