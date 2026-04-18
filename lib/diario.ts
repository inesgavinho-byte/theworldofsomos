export type TipoDiario =
  | "decisao"
  | "ideia"
  | "aprendizagem"
  | "evolucao"
  | "alerta"
  | "sessao";

export type AutorDiario = "claude" | "ines";

export interface ReferenciaDiario {
  tipo: string;
  label: string;
  url?: string;
}

export interface EntradaDiario {
  id: string;
  tipo: TipoDiario;
  titulo: string;
  contexto: string | null;
  conteudo: string;
  implicacoes: string | null;
  referencias: ReferenciaDiario[];
  tags: string[];
  autor: AutorDiario;
  created_at: string;
  updated_at: string;
}

export const TIPOS_DIARIO: TipoDiario[] = [
  "decisao",
  "ideia",
  "aprendizagem",
  "evolucao",
  "alerta",
  "sessao",
];

export const TIPO_LABELS: Record<TipoDiario, string> = {
  decisao: "Decisão",
  ideia: "Ideia",
  aprendizagem: "Aprendizagem",
  evolucao: "Evolução",
  alerta: "Alerta",
  sessao: "Sessão",
};

export const TIPO_CORES: Record<
  TipoDiario,
  { bg: string; cor: string; borda: string }
> = {
  decisao: {
    bg: "rgba(167,139,250,0.14)",
    cor: "#6d49c9",
    borda: "rgba(167,139,250,0.45)",
  },
  ideia: {
    bg: "rgba(250,204,21,0.14)",
    cor: "#8a6510",
    borda: "rgba(250,204,21,0.45)",
  },
  aprendizagem: {
    bg: "rgba(74,222,128,0.14)",
    cor: "#2d6a41",
    borda: "rgba(74,222,128,0.45)",
  },
  evolucao: {
    bg: "rgba(96,165,250,0.14)",
    cor: "#1f4fa8",
    borda: "rgba(96,165,250,0.45)",
  },
  alerta: {
    bg: "rgba(244,114,182,0.14)",
    cor: "#9d174d",
    borda: "rgba(244,114,182,0.45)",
  },
  sessao: {
    bg: "rgba(160,144,128,0.14)",
    cor: "#5d4f3e",
    borda: "rgba(160,144,128,0.45)",
  },
};

export const AUTOR_LABELS: Record<AutorDiario, string> = {
  claude: "Claude",
  ines: "Ines",
};

export function isTipoDiario(v: unknown): v is TipoDiario {
  return typeof v === "string" && (TIPOS_DIARIO as string[]).includes(v);
}

export function isAutorDiario(v: unknown): v is AutorDiario {
  return v === "claude" || v === "ines";
}

export function normalizeReferencias(v: unknown): ReferenciaDiario[] {
  if (!Array.isArray(v)) return [];
  const out: ReferenciaDiario[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const tipo = typeof raw.tipo === "string" ? raw.tipo.trim() : "";
    const label = typeof raw.label === "string" ? raw.label.trim() : "";
    if (!tipo && !label) continue;
    const ref: ReferenciaDiario = { tipo, label };
    if (typeof raw.url === "string" && raw.url.trim()) ref.url = raw.url.trim();
    out.push(ref);
  }
  return out;
}

export function normalizeTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of v) {
    if (typeof t !== "string") continue;
    const clean = t.trim().toLowerCase();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
  }
  return out;
}

export function formatDataCurta(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

export function formatDataCompleta(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
