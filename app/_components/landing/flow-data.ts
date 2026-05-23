export interface FlowExample {
  tag: string;
  message: string;
  rows: { icon: string; label: string; value: string }[];
  savingHtml: string;
}

export const flowExamples: FlowExample[] = [
  {
    tag: "Estructura de concreto",
    message: '"Voy a hacer una placa de 5×4 metros de 12 cm de espesor"',
    rows: [
      { icon: "🏗️", label: "Cemento UltraCem", value: "~13 sacos (50 kg)" },
      { icon: "🪨", label: "Grava", value: "~0.46 m³" },
      { icon: "🪣", label: "Arena", value: "~0.23 m³" },
      { icon: "💧", label: "Agua", value: "~148 litros" },
    ],
    savingHtml:
      'Usando dosificación exacta ahorras <strong>aprox. $85.000</strong> frente al método a ojo, y <strong>~12 kg menos de CO₂</strong> que con cemento genérico.',
  },
  {
    tag: "Mampostería",
    message:
      '"Voy a levantar un muro en bloque de 20, 3 metros de alto por 6 metros de largo"',
    rows: [
      { icon: "🧱", label: "Bloques", value: "~285 unidades" },
      { icon: "🏗️", label: "Pegante UltraCem", value: "~8 sacos" },
      { icon: "🪣", label: "Arena de pega", value: "~0.18 m³" },
      { icon: "💧", label: "Agua", value: "~64 litros" },
    ],
    savingHtml:
      'Desperdicio reducido al <strong>2%</strong> con receta UltraCem. Ahorras <strong>~$42.000</strong> vs método empírico.',
  },
  {
    tag: "Acabados",
    message:
      '"Necesito revocar 3 paredes de 2.4 m de alto por 4 metros de ancho"',
    rows: [
      { icon: "🏗️", label: "Mezcla Lista UltraCem", value: "~11 sacos" },
      { icon: "💧", label: "Agua", value: "~88 litros" },
      { icon: "🪣", label: "Rendimiento", value: "~2.9 m² por saco" },
      { icon: "📐", label: "Espesor", value: "15 mm recomendado" },
    ],
    savingHtml:
      'La Mezcla Lista te ahorra mezclar en obra. <strong>Pañeta y estuca el mismo día</strong> — hasta un <strong>30% más rápido</strong>.',
  },
];
