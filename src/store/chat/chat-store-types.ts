export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isCalculation?: boolean;
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

export interface CalculationMeta {
  formulaUsed?: string;
  wasteFactor?: number;
  region?: string | null;
  regionLabel?: string;
  standardsApplied?: AppliedStandard[];
  warnings?: Array<{ type: string; message: string; severity: string }>;
}

export interface ChatState {
  conversationId: string | null;
  messages: Message[];
  extractedData: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
  currentCalculation: {
    id: string;
    volume_m3: number;
    materials: {
      cement_bags_50kg: number;
      sand_m3: number;
      gravel_m3?: number;
      water_liters: number;
    };
  } | null;
  currentRecommendation: {
    product: {
      id: string;
      name: string;
      sku: string;
      price_per_bag_cop: number;
      datasheet_url: string | null;
    };
    quantity_bags: number;
    estimated_cost_cop: number;
    savings_cop: number;
    co2_saved_kg: number;
    justification: {
      technical_reason: string;
      economic_reason: string;
      environmental_reason?: string;
    };
  } | null;
  calculationMeta: CalculationMeta | null;
  region: string | null;
  standardsApplied: AppliedStandard[];
  warnings: Array<{ type: string; message: string; severity: string }>;
  sendMessage: (content: string) => Promise<void>;
  performCalculation: () => Promise<void>;
  extractFromVoice: (content: string) => Promise<void>;
  startNewConversation: () => void;
  loadConversation: (id: string) => Promise<void>;
  resetChat: () => void;
}