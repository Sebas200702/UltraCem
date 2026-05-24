import type { CalculationInput, Materials, MessageRole, RecommendationOutput } from './database.types';

export * from './database.types';

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

export interface AppliedStandard {
  code: string;
  title: string;
  implication: string;
  sourceUrl: string;
  officialSource: string;
  articleRef?: string | null;
  verbatim: boolean;
}

export interface ChatSendResponse {
  conversationId: string;
  messageId: string;
  reply: string;
  isReadyForCalculation: boolean;
  extractedData?: Partial<CalculationInput>;
  detectedRegion?: string | null;
  standardsApplied?: AppliedStandard[];
  warnings?: Array<{ type: string; message: string; severity: string }>;
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
  region?: string | null;
  regionLabel?: string;
  standardsApplied?: AppliedStandard[];
  formulaUsed?: string;
  wasteFactor?: number;
  warnings?: Array<{ type: string; message: string; severity: string }>;
}
