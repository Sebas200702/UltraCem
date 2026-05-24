import type {
  Calculation,
  CalculationInput,
  Message,
  RecommendationOutput,
} from "@/types/database.types";

export type {
  Calculation,
  CalculationInput,
  Message,
  RecommendationOutput,
};

export interface ConversationContext {
  conversationId: string;
  messageHistory: Message[];
  extractedData: Partial<CalculationInput>;
}

export interface NLPResponse {
  reply: string;
  intent:
    | "greeting"
    | "dimension_extraction"
    | "confirmation"
    | "calculation"
    | "unknown";
  extractedData?: Partial<CalculationInput>;
  isReadyForCalculation: boolean;
}
