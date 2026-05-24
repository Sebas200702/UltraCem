import type { CalculationInput, Materials, MessageRole, RecommendationOutput } from '@/types/database.types';

export * from '@/types/database.types';

export interface ChatMessage {
  role: MessageRole;
  content: string;
  createdAt?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ChatSendRequest {
  conversationId?: string;
  message: string;
  userId?: string;
}

export interface ChatSendResponse {
  conversationId: string;
  messageId: string;
  reply: string;
  isReadyForCalculation: boolean;
  extractedData?: Partial<CalculationInput>;
}

export interface CalculateRequest {
  conversationId: string;
  structureType: CalculationInput['structureType'];
  dimensions: CalculationInput['dimensions'];
  resistancePsi?: number;
}

export interface CalculateResponse {
  calculation: {
    id: string;
    volume_m3: number;
    materials: Materials;
  };
  recommendation: RecommendationOutput;
  summaryMessage: string;
}
