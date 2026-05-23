import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ultracem: {
          blue: {
            DEFAULT: "#004F9F",
            dark: "#003A75",
            light: "#3372B2",
          },
          yellow: {
            DEFAULT: "#FDB813",
            dark: "#D09404",
            light: "#FEC642",
          },
          green: {
            DEFAULT: "#16A34A",
            dark: "#14532D",
            light: "#4ADE80",
          }
        }
      },
    },
  },
  plugins: [],
};
export default config;
