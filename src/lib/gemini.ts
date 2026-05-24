import { NLPService, type ConversationContext, type NLPResponse } from '@/domains/conversation';
import type { ChatMessage, Message } from '@/types';

export function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
}

function toMessageHistory(messages: ChatMessage[]): Message[] {
  const timestamp = new Date().toISOString();

  return messages.map((message, index) => ({
    id: `legacy-message-${index}`,
    conversation_id: 'legacy-conversation',
    role: message.role,
    content: message.content,
    extracted_data: {},
    created_at: message.createdAt ?? timestamp,
  }));
}

export async function chatWithVanesa(
  messages: ChatMessage[],
  message: string
): Promise<NLPResponse> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required');
  }

  const nlpService = new NLPService(apiKey);
  const context: ConversationContext = {
    conversationId: 'legacy-conversation',
    messageHistory: toMessageHistory(messages),
    extractedData: {},
  };

  return nlpService.processMessage(message, context);
}
