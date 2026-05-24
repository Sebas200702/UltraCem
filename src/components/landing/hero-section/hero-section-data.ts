export interface HeroKpi {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
}

export const HERO_KPIS: ReadonlyArray<HeroKpi> = [
  {
    label: "Calculo",
    value: "< 90s",
    detail: "De la idea al resultado",
  },
  {
    label: "Estructuras",
    value: "4",
    detail: "Placa, muro, columna, revoque",
  },
  {
    label: "Sin costo",
    value: "100%",
    detail: "Acceso libre y abierto",
  },
];
