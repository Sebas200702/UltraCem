import { useState } from "react";
import { flowExamples } from '@/components/landing/flow-section/flow-section-data';

export function useFlowSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return {
    activeIndex,
    active: flowExamples[activeIndex],
    flowExamples,
    setActiveIndex,
  };
}
