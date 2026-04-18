import { createClient } from "@/lib/supabase/client";
import type { Dimensao } from "@/lib/dimensoes";

// ─── Tipos — seguem o schema real da tabela licoes ──────────────────────────

export interface SecaoConteudo {
  numero: number;
  titulo: string;
  texto: string;
}

export interface ConteudoLicao {
  perguntas_de_escuta?: string[];
  secoes?: SecaoConteudo[];
}

export interface ReflexaoLicao {
  introducao?: string;
  prompts?: string[];
  tipo_contributo?: string;
}

export interface MomentoLicao {
  crianca?: {
    data?: string;
    titulo?: string;
    texto?: string;
  };
  adulto?: {
    resumo_aprendizagem?: string;
    sugestao?: string;
  };
}

export interface PerguntaPorta {
  pergunta: string;
  desenvolvimento?: string;
  licao_destino_slug?: string;
}

export interface LicaoCompleta {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  dimensao: string;
  cor: string;
  curriculo: string | null;
  tipo: string;
  ativo: boolean;
  ordem: number;
  estado: "rascunho" | "publicada";
  narrativa: string | null;
  descricao: string | null;
  conteudo: ConteudoLicao | null;
  reflexao: ReflexaoLicao | null;
  momento: MomentoLicao | null;
  perguntas_porta: PerguntaPorta[] | null;
  duracao_min: number | null;
  idade_min: number | null;
  idade_max: number | null;
  competencia_id: string | null;
}

export interface ExercicioConteudoBD {
  pergunta: string;
  opcoes: string[];
  resposta_correcta: number;
  explicacao?: string;
}

export interface ExercicioBD {
  id: string;
  licao_id: string | null;
  ordem: number;
  tipo: string | null;
  conteudo: ExercicioConteudoBD;
}

// Formato que os componentes existentes já consomem.
export interface ExercicioParaUI {
  id: string;
  pergunta: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
}

// ─── Normalização da dimensão (BD guarda "Identitária", UI usa "identitaria") ─

const DIMENSAO_NORMALIZE: Record<string, Dimensao> = {
  "identitária": "identitaria",
  "identitaria": "identitaria",
  "naturalista": "naturalista",
  "lógica": "logica",
  "logica": "logica",
  "artística": "artistica",
  "artistica": "artistica",
  "social": "social",
};

export function normalizarDimensao(valor: string | null | undefined): Dimensao {
  if (!valor) return "identitaria";
  return DIMENSAO_NORMALIZE[valor.toLowerCase()] ?? "identitaria";
}

// ─── Leituras ─────────────────────────────────────────────────────────────────
//
// A RLS trata a distinção rascunho/publicada:
// • crianças/famílias: policy licoes_select_authenticated → ativo + estado='publicada'.
// • admins: policy licoes_all_admin → todas as lições.
// Não é preciso ler o cookie somos-context daqui.

export async function getLicaoCompleta(slug: string): Promise<LicaoCompleta | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("licoes")
    .select(
      "id, slug, titulo, subtitulo, dimensao, cor, curriculo, tipo, ativo, ordem, estado, narrativa, descricao, conteudo, reflexao, momento, perguntas_porta, duracao_min, idade_min, idade_max, competencia_id"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return data as LicaoCompleta;
}

export async function getExerciciosDaLicao(licaoId: string): Promise<ExercicioParaUI[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exercicios")
    .select("id, licao_id, ordem, tipo, conteudo")
    .eq("licao_id", licaoId)
    .order("ordem", { ascending: true });

  if (error || !data) return [];

  return (data as ExercicioBD[])
    .filter((e) => e.conteudo && Array.isArray(e.conteudo.opcoes))
    .map((e) => ({
      id: e.id,
      pergunta: e.conteudo.pergunta,
      opcoes: e.conteudo.opcoes,
      correta: e.conteudo.resposta_correcta,
      explicacao: e.conteudo.explicacao ?? "",
    }));
}
