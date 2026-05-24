import type { Config } from "tailwindcss";
import { ultracemThemeExtend } from './src/lib/design-tokens';

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: ultracemThemeExtend,
  },
  plugins: [],
};

export default config;
