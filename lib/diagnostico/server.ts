import { createAdminClient } from "@/lib/supabase/admin";

export interface CompetenciaPrioritaria {
  competencia_id: string;
  area: string;
  dominio: string | null;
  ordem_dominio: number | null;
  codigo_oficial: string | null;
  descricao: string | null;
  num_exercicios: number;
}

export interface ExercicioDiagnostico {
  id: string;
  competencia_id: string;
  codigo_oficial: string | null;
  area: string;
  dominio: string | null;
  dificuldade: number;
  pergunta: string;
  opcoes: string[];
  resposta_correcta: number;
}

export interface SelecaoExercicios {
  exercicios: ExercicioDiagnostico[];
  competencias_sem_exercicios: string[];
}

type ExercicioRow = {
  id: string;
  competencia_id: string;
  dificuldade: number | null;
  conteudo: Record<string, unknown> | null;
  competencias: {
    area: string | null;
    dominio: string | null;
    codigo_oficial: string | null;
  } | null;
};

function normalizarConteudo(conteudo: Record<string, unknown> | null): {
  pergunta: string;
  opcoes: string[];
  resposta_correcta: number;
} | null {
  if (!conteudo) return null;
  const pergunta = typeof conteudo.pergunta === "string" ? conteudo.pergunta : null;
  const opcoes = Array.isArray(conteudo.opcoes) ? (conteudo.opcoes as unknown[]) : null;
  const resposta =
    typeof conteudo.resposta_correcta === "number"
      ? (conteudo.resposta_correcta as number)
      : null;
  if (!pergunta || !opcoes || resposta === null) return null;
  return {
    pergunta,
    opcoes: opcoes.map((o) => String(o)),
    resposta_correcta: resposta,
  };
}

/**
 * Devolve até 25 competências prioritárias para a criança, no
 * currículo/ano dados. Apenas inclui competências com estado
 * 'nao_avaliada'.
 */
export async function competenciasPrioritarias(
  criancaId: string,
  curriculo: string,
  anoEscolar: string,
  limite = 25,
): Promise<CompetenciaPrioritaria[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc(
    "competencias_prioritarias_para_diagnostico",
    {
      p_crianca_id: criancaId,
      p_curriculo: curriculo,
      p_ano: anoEscolar,
      p_limite: limite,
    },
  );
  if (error || !data) return [];
  return data as CompetenciaPrioritaria[];
}

/**
 * Selecciona um conjunto de exercícios diagnósticos a apresentar
 * à criança: 1 por competência prioritária, mistura de dificuldades
 * e equilíbrio entre áreas. Competências sem pelo menos 1 exercício
 * curricular são saltadas (devolvidas à parte para debug).
 */
export async function selecionarExerciciosParaDiagnostico(
  competencias: CompetenciaPrioritaria[],
  maxExercicios = 12,
  exclusoes: Set<string> = new Set(),
): Promise<SelecaoExercicios> {
  if (competencias.length === 0) {
    return { exercicios: [], competencias_sem_exercicios: [] };
  }

  const admin = createAdminClient();
  const ids = competencias.map((c) => c.competencia_id);

  const { data, error } = await admin
    .from("exercicios")
    .select(
      "id, competencia_id, dificuldade, conteudo, competencias!inner(area, dominio, codigo_oficial)",
    )
    .in("competencia_id", ids)
    .eq("tipo_conteudo", "curricular");

  if (error || !data) {
    return { exercicios: [], competencias_sem_exercicios: ids };
  }

  const rows = data as unknown as ExercicioRow[];
  const porCompetencia = new Map<string, ExercicioRow[]>();
  for (const r of rows) {
    if (exclusoes.has(r.id)) continue;
    if (!r.competencia_id) continue;
    const bucket = porCompetencia.get(r.competencia_id) ?? [];
    bucket.push(r);
    porCompetencia.set(r.competencia_id, bucket);
  }

  const semExercicios: string[] = [];
  const escolhidas: ExercicioDiagnostico[] = [];

  // Round-robin por área para equilibrar.
  const porArea = new Map<string, CompetenciaPrioritaria[]>();
  for (const c of competencias) {
    const arr = porArea.get(c.area) ?? [];
    arr.push(c);
    porArea.set(c.area, arr);
  }

  const areas = Array.from(porArea.keys());
  let i = 0;
  while (escolhidas.length < maxExercicios) {
    if (areas.every((a) => (porArea.get(a)?.length ?? 0) === 0)) break;
    const area = areas[i % areas.length];
    i += 1;
    const fila = porArea.get(area);
    if (!fila || fila.length === 0) continue;
    const comp = fila.shift()!;
    const lista = porCompetencia.get(comp.competencia_id) ?? [];
    if (lista.length === 0) {
      semExercicios.push(comp.competencia_id);
      continue;
    }
    // Ordenar por dificuldade asc, pegar um índice que alterne entre fáceis e médios
    lista.sort((a, b) => (a.dificuldade ?? 1) - (b.dificuldade ?? 1));
    const index = escolhidas.length % lista.length;
    const raw = lista[index];
    const conteudo = normalizarConteudo(raw.conteudo);
    if (!conteudo) {
      semExercicios.push(comp.competencia_id);
      continue;
    }
    escolhidas.push({
      id: raw.id,
      competencia_id: raw.competencia_id,
      codigo_oficial: comp.codigo_oficial,
      area: comp.area,
      dominio: comp.dominio,
      dificuldade: raw.dificuldade ?? 1,
      pergunta: conteudo.pergunta,
      opcoes: conteudo.opcoes,
      resposta_correcta: conteudo.resposta_correcta,
    });
  }

  return { exercicios: escolhidas, competencias_sem_exercicios: semExercicios };
}

/**
 * Carrega um único exercício diagnóstico pelo id (com contexto da
 * competência).
 */
export async function carregarExercicio(
  exercicioId: string,
): Promise<ExercicioDiagnostico | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("exercicios")
    .select(
      "id, competencia_id, dificuldade, conteudo, competencias!inner(area, dominio, codigo_oficial)",
    )
    .eq("id", exercicioId)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as ExercicioRow;
  const conteudo = normalizarConteudo(row.conteudo);
  if (!conteudo) return null;
  return {
    id: row.id,
    competencia_id: row.competencia_id,
    codigo_oficial: row.competencias?.codigo_oficial ?? null,
    area: row.competencias?.area ?? "",
    dominio: row.competencias?.dominio ?? null,
    dificuldade: row.dificuldade ?? 1,
    pergunta: conteudo.pergunta,
    opcoes: conteudo.opcoes,
    resposta_correcta: conteudo.resposta_correcta,
  };
}
