/**
 * UltraCem design tokens.
 * Source of truth: docs/foundations.md, section 3.
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

type FontSizeConfig = [
  string,
  {
    lineHeight: string;
    letterSpacing?: string;
    fontWeight: string;
  },
];

export const ultracemFontSize: Record<string, FontSizeConfig> = {
  display: [
    "3rem",
    { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" },
  ],
  h1: ["1.875rem", { lineHeight: "1.2", fontWeight: "600" }],
  h2: ["1.5rem", { lineHeight: "1.25", fontWeight: "600" }],
  h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "500" }],
  body: ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
  "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
  caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
  button: [
    "0.875rem",
    { lineHeight: "1", letterSpacing: "0.02em", fontWeight: "600" },
  ],
};

export const ultracemThemeExtend = {
  colors: {
    ultracem: ultracemColors,
  },
  fontFamily: {
    sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
  },
  fontSize: ultracemFontSize,
  borderRadius: {
    "uc-button": "16px",
    "uc-card": "25px",
    "uc-input": "16px",
  },
  boxShadow: {
    "uc-card":
      "0 1px 3px rgba(0, 62, 120, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06)",
    "uc-modal": "0 8px 24px rgba(0, 36, 67, 0.15)",
  },
  maxWidth: {
    "uc-container": "1140px",
  },
  spacing: {
    "uc-widget": "20px",
  },
  ringColor: {
    "uc-focus": ultracemColors.yellow.bright,
  },
  animation: {
    "slide-in-right":
      "slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "slide-in-left":
      "slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
    "pulse-mechanical": "pulse-mechanical 1.4s ease-in-out infinite",
  },
  keyframes: {
    "slide-in-right": {
      from: { opacity: "0", transform: "translateX(24px) scale(0.96)" },
      to: { opacity: "1", transform: "translateX(0) scale(1)" },
    },
    "slide-in-left": {
      from: { opacity: "0", transform: "translateX(-24px) scale(0.96)" },
      to: { opacity: "1", transform: "translateX(0) scale(1)" },
    },
    "fade-in-up": {
      from: { opacity: "0", transform: "translateY(16px)" },
      to: { opacity: "1", transform: "translateY(0)" },
    },
    "pulse-mechanical": {
      "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "0.4" },
      "50%": { transform: "translateY(-4px) scale(1.15)", opacity: "1" },
    },
  },
};
