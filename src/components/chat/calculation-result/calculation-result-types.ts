import { type CalculationData } from '@/components/chat/chat-container/chat-container-types';

export interface CalculationResultProps {
  data: CalculationData;
  onNewCalculation: () => void;
}
