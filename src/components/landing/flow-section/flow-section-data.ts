import { type FlowExample } from '@/components/landing/flow-section/flow-section-types';

export const flowExamples: FlowExample[] = [
  {
    tag: "Estructura de concreto",
    message: '"Voy a hacer una placa de 5x4 metros de 12 cm de espesor"',
    rows: [
      { icon: "Obra", label: "Cemento UltraCem", value: "~13 sacos (50 kg)" },
      { icon: "Grava", label: "Grava", value: "~0.46 m³" },
      { icon: "Arena", label: "Arena", value: "~0.23 m³" },
      { icon: "Agua", label: "Agua", value: "~148 litros" },
    ],
    savingHtml:
      "Usando dosificación exacta ahorras <strong>aprox. $85.000</strong> frente al método a ojo, y <strong>~12 kg menos de CO₂</strong> que con cemento genérico.",
  },
  {
    tag: "Mampostería",
    message:
      '"Voy a levantar un muro en bloque de 20, 3 metros de alto por 6 metros de largo"',
    rows: [
      { icon: "Bloque", label: "Bloques", value: "~285 unidades" },
      { icon: "Pega", label: "Pegante UltraCem", value: "~8 sacos" },
      { icon: "Arena", label: "Arena de pega", value: "~0.18 m³" },
      { icon: "Agua", label: "Agua", value: "~64 litros" },
    ],
    savingHtml:
      "Desperdicio reducido al <strong>2%</strong> con receta UltraCem. Ahorras <strong>~$42.000</strong> vs método empírico.",
  },
  {
    tag: "Acabados",
    message:
      '"Necesito revocar 3 paredes de 2.4 m de alto por 4 metros de ancho"',
    rows: [
      { icon: "Mezcla", label: "Mezcla Lista UltraCem", value: "~11 sacos" },
      { icon: "Agua", label: "Agua", value: "~88 litros" },
      { icon: "Rinde", label: "Rendimiento", value: "~2.9 m² por saco" },
      { icon: "Esp.", label: "Espesor", value: "15 mm recomendado" },
    ],
    savingHtml:
      "La Mezcla Lista te ahorra mezclar en obra. <strong>Pañeta y estuca el mismo día</strong>, hasta un <strong>30% más rápido</strong>.",
  },
];
