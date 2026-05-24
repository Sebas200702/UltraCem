import type {
  Calculation,
  CalculationInput,
  Message,
  RecommendationOutput,
  SafetyWarning,
} from "@/types/database.types";
import type { RetrievedStandard } from "@/domains/standards/standards.service";

export type {
  Calculation,
  CalculationInput,
  Message,
  RecommendationOutput,
  RetrievedStandard,
  SafetyWarning,
};

export interface ConversationContext {
  conversationId: string;
  messageHistory: Message[];
  extractedData: Partial<CalculationInput>;
  region?: string | null;
  regionConfidence?: number;
  standards?: RetrievedStandard[];
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
  warnings?: SafetyWarning[];
}
