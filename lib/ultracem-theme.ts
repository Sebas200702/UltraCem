/**
 * UltraCem design tokens — source: foundations.md (auditoría ultracem.co, mayo 2026)
 * @see foundations.md
 */

export const ultracemColors = {
  blue: {
    DEFAULT: "#003E78",
    dark: "#022443",
    light: "#1A5A9E",
  },
  yellow: {
    DEFAULT: "#FFCA00",
    bright: "#FFDA05",
    hover: "#E8C204",
  },
  green: {
    DEFAULT: "#23A455",
    light: "#61CE70",
    success: "#12B76A",
  },
  gray: {
    900: "#393939",
    600: "#7A7A7A",
    500: "#54595F",
    100: "#F2F4F7",
    50: "#F9FAFB",
  },
  surface: {
    DEFAULT: "#FFFFFF",
    off: "#FCFCFC",
    muted: "#F9FAFB",
    subtle: "#F2F4F7",
  },
  border: {
    DEFAULT: "#D0D5DD",
  },
  gold: "#CEA261",
  purple: "#302489",
  error: "#F04438",
};

export const ultracemFontFamily = {
  sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
};

type FontSizeConfig = [
  string,
  {
    lineHeight: string;
    letterSpacing?: string;
    fontWeight: string;
  },
];

export const ultracemFontSize: Record<string, FontSizeConfig> = {
  display: ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
  h1: ["1.875rem", { lineHeight: "1.2", fontWeight: "600" }],
  h2: ["1.5rem", { lineHeight: "1.25", fontWeight: "600" }],
  h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "500" }],
  body: ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
  "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
  caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
  button: ["0.875rem", { lineHeight: "1", letterSpacing: "0.02em", fontWeight: "600" }],
};

export const ultracemBorderRadius = {
  button: "16px",
  card: "25px",
  input: "16px",
} as const;

export const ultracemBoxShadow = {
  card: "0 1px 3px rgba(0, 62, 120, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06)",
  modal: "0 8px 24px rgba(0, 36, 67, 0.15)",
} as const;

export const ultracemMaxWidth = {
  container: "1140px",
} as const;

export const ultracemSpacing = {
  widget: "20px",
} as const;

/** Tailwind `theme.extend` object */
export const ultracemThemeExtend = {
  colors: {
    ultracem: ultracemColors,
  },
  fontFamily: ultracemFontFamily,
  fontSize: ultracemFontSize,
  borderRadius: {
    "uc-button": ultracemBorderRadius.button,
    "uc-card": ultracemBorderRadius.card,
    "uc-input": ultracemBorderRadius.input,
  },
  boxShadow: {
    "uc-card": ultracemBoxShadow.card,
    "uc-modal": ultracemBoxShadow.modal,
  },
  maxWidth: {
    "uc-container": ultracemMaxWidth.container,
  },
  spacing: {
    "uc-widget": ultracemSpacing.widget,
  },
  ringColor: {
    "uc-focus": ultracemColors.yellow.bright,
  },
};
