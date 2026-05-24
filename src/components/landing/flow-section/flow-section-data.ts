import { type FlowExample } from '@/components/landing/flow-section/flow-section-types';

export const flowExamples: FlowExample[] = [
  {
    tag: "Estructura de concreto",
    message: '"Voy a hacer una placa de 5x4 metros de 12 cm de espesor"',
    rows: [
      { icon: "Obra", label: "Cemento UltraCem", value: "~13 sacos (50 kg)" },
      { icon: "Grava", label: "Grava", value: "~0.46 m3" },
      { icon: "Arena", label: "Arena", value: "~0.23 m3" },
      { icon: "Agua", label: "Agua", value: "~148 litros" },
    ],
    savingHtml:
      "Usando dosificacion exacta ahorras <strong>aprox. $85.000</strong> frente al metodo a ojo, y <strong>~12 kg menos de CO2</strong> que con cemento generico.",
  },
  {
    tag: "Mamposteria",
    message:
      '"Voy a levantar un muro en bloque de 20, 3 metros de alto por 6 metros de largo"',
    rows: [
      { icon: "Bloque", label: "Bloques", value: "~285 unidades" },
      { icon: "Pega", label: "Pegante UltraCem", value: "~8 sacos" },
      { icon: "Arena", label: "Arena de pega", value: "~0.18 m3" },
      { icon: "Agua", label: "Agua", value: "~64 litros" },
    ],
    savingHtml:
      "Desperdicio reducido al <strong>2%</strong> con receta UltraCem. Ahorras <strong>~$42.000</strong> vs metodo empirico.",
  },
  {
    tag: "Acabados",
    message:
      '"Necesito revocar 3 paredes de 2.4 m de alto por 4 metros de ancho"',
    rows: [
      { icon: "Mezcla", label: "Mezcla Lista UltraCem", value: "~11 sacos" },
      { icon: "Agua", label: "Agua", value: "~88 litros" },
      { icon: "Rinde", label: "Rendimiento", value: "~2.9 m2 por saco" },
      { icon: "Esp.", label: "Espesor", value: "15 mm recomendado" },
    ],
    savingHtml:
      "La Mezcla Lista te ahorra mezclar en obra. <strong>Paneta y estuca el mismo dia</strong>, hasta un <strong>30% mas rapido</strong>.",
  },
];
