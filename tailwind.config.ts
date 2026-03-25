import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "fundo-pai": "#ede9e1",
        "fundo-crianca": "#f5f2ec",
        "texto-principal": "#1a1714",
        "texto-secundario": "#a09080",
        "roxo-tint": "#a78bfa",
        "roxo-texto": "#534ab7",
        "roxo-card": "#2a2250",
        "verde-tint": "#4ade80",
        "verde-texto": "#2d5c3a",
        "verde-card": "#1e3d28",
        "azul-tint": "#60a5fa",
        "azul-texto": "#185fa5",
        "azul-card": "#0f1a2e",
        "rosa-tint": "#f472b6",
        "rosa-texto": "#993556",
        "rosa-card": "#3d1a2e",
        "amarelo-tint": "#facc15",
        "amarelo-texto": "#854f0b",
        "amarelo-card": "#2a1f0a",
      },
      fontFamily: {
        editorial: ["Cormorant Garamond", "serif"],
        ui: ["Nunito", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
export default config;
