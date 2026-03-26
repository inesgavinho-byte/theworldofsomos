export type Dimensao = "naturalista" | "identitaria" | "logica" | "social" | "emocional" | "artistica";

export interface DimensaoConfig {
  nome: string;
  cor: string;          // tint
  corTexto: string;     // texto
  corCard: string;      // card background (dark)
  slug: string;
}

export const DIMENSOES: Record<Dimensao, DimensaoConfig> = {
  naturalista: {
    nome: "Naturalista",
    cor: "#4ade80",
    corTexto: "#2d5c3a",
    corCard: "#1e3d28",
    slug: "naturalista",
  },
  identitaria: {
    nome: "Identitária",
    cor: "#a78bfa",
    corTexto: "#534ab7",
    corCard: "#2a2250",
    slug: "identitaria",
  },
  logica: {
    nome: "Lógica",
    cor: "#60a5fa",
    corTexto: "#185fa5",
    corCard: "#0f1a2e",
    slug: "logica",
  },
  social: {
    nome: "Social",
    cor: "#facc15",
    corTexto: "#854f0b",
    corCard: "#2a1f0a",
    slug: "social",
  },
  emocional: {
    nome: "Emocional",
    cor: "#facc15",
    corTexto: "#854f0b",
    corCard: "#2a1f0a",
    slug: "emocional",
  },
  artistica: {
    nome: "Artística",
    cor: "#f472b6",
    corTexto: "#993556",
    corCard: "#3d1a2e",
    slug: "artistica",
  },
};

// Map lesson slugs to dimensão
export const SLUG_DIMENSAO: Record<string, Dimensao> = {
  "floresta-tropical": "naturalista",
  "cerebro-incrivel": "identitaria",
  "sistema-solar": "logica",
  "a-zona-certa": "identitaria",
  "cerebro-desafios": "identitaria",
  "o-proposito": "emocional",
  "como-aprender": "logica",
  "palavras-que-voam": "artistica",
  "o-mapa-dos-numeros": "logica",
  "a-vida-secreta-das-plantas": "naturalista",
  "a-aventura-em-ingles": "artistica",
  "os-descobrimentos": "social",
};

export function getDimensaoBySlug(slug: string): DimensaoConfig {
  const dimensao = SLUG_DIMENSAO[slug];
  if (dimensao && DIMENSOES[dimensao]) return DIMENSOES[dimensao];
  return DIMENSOES.identitaria;
}

// SVG icons per dimensão (line style, no emojis)
export function getDimensaoSVG(dimensao: Dimensao, size = 32): string {
  const svgs: Record<Dimensao, string> = {
    naturalista: `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 28C16 28 4 20 4 12C4 7.58 7.58 4 12 4C13.8 4 15.46 4.6 16.8 5.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M16 28C16 28 28 20 28 12C28 7.58 24.42 4 20 4C18.2 4 16.54 4.6 15.2 5.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="16" y1="8" x2="16" y2="28" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    identitaria: `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="12" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M6 26C6 21.58 10.48 18 16 18C21.52 18 26 21.58 26 26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    logica: `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="18" y="4" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="4" y="18" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M23 18V14M19 23H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    social: `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/><circle cx="22" cy="12" r="4" stroke="currentColor" stroke-width="1.5"/><path d="M4 26C4 22.13 6.69 19 10 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M28 26C28 22.13 25.31 19 22 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M14 26C14 22.13 16 19 16 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    emocional: `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 27L5.5 16.5C3.5 14.5 3.5 11.5 5.5 9.5C7.5 7.5 10.5 7.5 12.5 9.5L16 13L19.5 9.5C21.5 7.5 24.5 7.5 26.5 9.5C28.5 11.5 28.5 14.5 26.5 16.5L16 27Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    artistica: `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 24L14 10L20 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="24" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/></svg>`,
  };
  return svgs[dimensao] ?? svgs.identitaria;
}
