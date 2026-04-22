import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CriancaDashboardClient, {
  type LicaoDashboard,
  type MissaoDoDia,
} from "./CriancaDashboardClient";

interface LicaoRow {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  tipo: string;
  curriculo: string | null;
  dimensao: string;
  cor: string | null;
  duracao_min: number | null;
  ordem: number | null;
}

interface SessaoRow {
  licao_id: string | null;
  slug_licao: string | null;
  tipo: string | null;
  correcto: boolean | null;
  created_at: string;
  momento_entregue_em: string | null;
}

function toLocalDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mondayOfThisWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function dayIndexMondayFirst(iso: string): number {
  const d = new Date(iso);
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

function computeStreak(sessionDateKeys: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (sessionDateKeys.has(toLocalDateKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default async function CriancaDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/crianca/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, tipo")
    .eq("id", user.id)
    .single();

  const { data: crianca } = await supabase
    .from("criancas")
    .select("*")
    .eq("user_id", user.id)
    .single();

  let desafiosPendentes: any[] = [];
  let diagnosticoPendente = false;
  let licoes: LicaoDashboard[] = [];
  let missaoDoDia: MissaoDoDia | null = null;
  let streak = 0;
  let diasEstaSemana: number[] = [];
  let estrelasSemana = 0;

  if (crianca?.id) {
    const { data: desafiosData } = await supabase
      .from("desafios_familia")
      .select("id, conteudo, created_at")
      .eq("crianca_id", crianca.id)
      .eq("tipo", "exercicios_ia")
      .eq("estado", "pendente")
      .order("created_at", { ascending: false });
    desafiosPendentes = desafiosData ?? [];

    const { count: diagCount } = await supabase
      .from("diagnosticos")
      .select("id", { count: "exact", head: true })
      .eq("crianca_id", crianca.id)
      .eq("estado", "concluido");
    diagnosticoPendente = (diagCount ?? 0) === 0;

    const curriculoCrianca = (crianca.curriculo ?? "PT") as string;

    const { data: licoesData } = await supabase
      .from("licoes")
      .select("id, slug, titulo, subtitulo, tipo, curriculo, dimensao, cor, duracao_min, ordem")
      .eq("estado", "publicada")
      .eq("ativo", true)
      .or(`tipo.eq.universal,curriculo.eq.${curriculoCrianca}`)
      .order("ordem", { ascending: true });

    const licoesRows: LicaoRow[] = (licoesData ?? []) as LicaoRow[];

    const { data: sessoesData } = await supabase
      .from("sessoes")
      .select("licao_id, slug_licao, tipo, correcto, created_at, momento_entregue_em")
      .eq("crianca_id", crianca.id)
      .order("created_at", { ascending: false });

    const sessoes: SessaoRow[] = (sessoesData ?? []) as SessaoRow[];

    const statusPorLicao = new Map<string, "nao_comecada" | "em_curso" | "completa">();
    for (const l of licoesRows) statusPorLicao.set(l.id, "nao_comecada");

    for (const s of sessoes) {
      if (!s.licao_id) continue;
      const atual = statusPorLicao.get(s.licao_id);
      if (atual === "completa") continue;
      if (s.tipo === "narrativa" && s.momento_entregue_em) {
        statusPorLicao.set(s.licao_id, "completa");
      } else {
        statusPorLicao.set(s.licao_id, "em_curso");
      }
    }

    const sessionDateKeys = new Set<string>();
    for (const s of sessoes) {
      if (s.created_at) sessionDateKeys.add(toLocalDateKey(s.created_at));
    }
    streak = computeStreak(sessionDateKeys);

    const monday = mondayOfThisWeek();
    const diasSet = new Set<number>();
    let estrelasAcc = 0;
    for (const s of sessoes) {
      const d = new Date(s.created_at);
      if (d >= monday) {
        diasSet.add(dayIndexMondayFirst(s.created_at));
        if (s.correcto === true) estrelasAcc += 1;
      }
    }
    diasEstaSemana = Array.from(diasSet).sort();
    estrelasSemana = estrelasAcc;

    const licoesIds = licoesRows.map((l) => l.id);
    const exerciciosPorLicao = new Map<string, number>();
    if (licoesIds.length > 0) {
      const { data: exerciciosData } = await supabase
        .from("exercicios")
        .select("licao_id")
        .in("licao_id", licoesIds);
      for (const row of (exerciciosData ?? []) as { licao_id: string }[]) {
        exerciciosPorLicao.set(row.licao_id, (exerciciosPorLicao.get(row.licao_id) ?? 0) + 1);
      }
    }

    licoes = licoesRows.map((l) => ({
      id: l.id,
      slug: l.slug,
      titulo: l.titulo,
      subtitulo: l.subtitulo,
      tipo: l.tipo,
      curriculo: l.curriculo,
      dimensao: l.dimensao,
      cor: l.cor,
      duracao_min: l.duracao_min,
      ordem: l.ordem,
      status: statusPorLicao.get(l.id) ?? "nao_comecada",
      num_exercicios: exerciciosPorLicao.get(l.id) ?? 0,
    }));

    const primeiraPendente = licoes.find((l) => l.status !== "completa");
    if (primeiraPendente) {
      missaoDoDia = {
        slug: primeiraPendente.slug,
        titulo: primeiraPendente.titulo,
        dimensao: primeiraPendente.dimensao,
        cor: primeiraPendente.cor,
        num_exercicios: primeiraPendente.num_exercicios,
        status: primeiraPendente.status,
      };
    }
  }

  return (
    <CriancaDashboardClient
      profile={profile}
      crianca={crianca}
      licoes={licoes}
      missaoDoDia={missaoDoDia}
      streak={streak}
      diasEstaSemana={diasEstaSemana}
      estrelasSemana={estrelasSemana}
      desafiosPendentes={desafiosPendentes}
      diagnosticoPendente={diagnosticoPendente}
    />
  );
}
