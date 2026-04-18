import { NextResponse } from "next/server";
import { autenticarCrianca } from "@/lib/licao/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";
import { ERASMO_PITHOS_INTRO } from "@/lib/licao/erasmo";

interface MomentoEntregue {
  momento_historico?: string | null;
  para_crianca?: string | null;
  para_adulto?: string | null;
}

interface JarroDesbloqueado {
  numero: number;
  facto_id: number | null;
  facto: string | null;
  categoria: string | null;
  eh_primeiro: boolean;
  intro_erasmo?: string;
}

interface RespostaCompleta {
  ok: true;
  ja_completou: boolean;
  estrelas_ganhas: number;
  total_apos: number | null;
  momento_entregue: boolean;
  jarros: JarroDesbloqueado[];
}

function respostaJaCompletou(): RespostaCompleta {
  return {
    ok: true,
    ja_completou: true,
    estrelas_ganhas: 0,
    total_apos: null,
    momento_entregue: false,
    jarros: [],
  };
}

export async function POST(req: Request): Promise<NextResponse> {
  const auth = await autenticarCrianca();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const {
    licao_id,
    slug,
    titulo,
    correctos,
    total,
    tempo_total_ms,
    reflexao_emocao,
    reflexao_texto,
    momento,
  }: {
    licao_id?: string;
    slug?: string;
    titulo?: string;
    correctos?: number;
    total?: number;
    tempo_total_ms?: number;
    reflexao_emocao?: string | null;
    reflexao_texto?: string | null;
    momento?: MomentoEntregue | null;
  } = body;

  if (!licao_id || typeof correctos !== "number" || typeof total !== "number") {
    return NextResponse.json(
      { erro: "licao_id, correctos e total obrigatórios" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const criancaId = auth.data.criancaId;

  // ── Gate 1 (leitura): short-circuit se já há narrativa para este par. ──
  const { data: conclusoesAnteriores } = await admin
    .from("sessoes")
    .select("id")
    .eq("crianca_id", criancaId)
    .eq("licao_id", licao_id)
    .eq("tipo", "narrativa")
    .limit(1);

  if ((conclusoesAnteriores?.length ?? 0) > 0) {
    return NextResponse.json(respostaJaCompletou());
  }

  // ── Gate 2 (escrita atómica): inserimos a linha narrativa PRIMEIRO.  ──
  // Serve de lock: a unique index parcial sessoes_conclusao_unica_idx
  // (crianca_id, licao_id) where tipo='narrativa' garante que apenas
  // um insert passa, mesmo com dois POSTs simultâneos.
  const tempoTotalMs =
    typeof tempo_total_ms === "number" ? Math.max(0, Math.floor(tempo_total_ms)) : null;

  const { error: lockErr } = await admin.from("sessoes").insert({
    crianca_id: criancaId,
    licao_id,
    slug_licao: slug ?? null,
    titulo_licao: titulo ?? null,
    tipo: "narrativa",
    momento_historico: momento?.momento_historico ?? null,
    momento_crianca: momento?.para_crianca ?? null,
    momento_adulto: momento?.para_adulto ?? null,
    momento_entregue_em: new Date().toISOString(),
    tempo_ms: tempoTotalMs,
  });

  if (lockErr) {
    // 23505 = unique_violation → outro POST ganhou a corrida. Tratar como já concluiu.
    const pgCode = (lockErr as { code?: string }).code;
    if (pgCode === "23505") {
      return NextResponse.json(respostaJaCompletou());
    }
    console.error("[licao/completa] falha a adquirir lock narrativa:", lockErr);
    return NextResponse.json({ erro: "Erro ao concluir lição" }, { status: 500 });
  }

  // ── A partir daqui, somos o único processo a concluir esta lição. ──
  const momentoEntregue = Boolean(momento?.para_crianca);

  if (momentoEntregue) {
    await log({
      userId: auth.data.userId,
      action: "licao.momento_entregue",
      entityType: "licao",
      entityId: licao_id,
      metadata: { crianca_id: criancaId, slug: slug ?? null },
      request: req,
    });
  }

  // Reflexão — opcional, mas agora com a certeza de uma única execução.
  if (reflexao_emocao || reflexao_texto) {
    await admin.from("sessoes").insert({
      crianca_id: criancaId,
      licao_id,
      slug_licao: slug ?? null,
      titulo_licao: titulo ?? null,
      tipo: "reflexao",
      reflexao_emocao: reflexao_emocao ?? null,
      reflexao_texto: reflexao_texto ?? null,
      tempo_ms: tempoTotalMs,
    });

    await log({
      userId: auth.data.userId,
      action: "licao.reflexao_completa",
      entityType: "licao",
      entityId: licao_id,
      metadata: {
        crianca_id: criancaId,
        emocao: reflexao_emocao ?? null,
        tem_texto: Boolean(reflexao_texto && reflexao_texto.trim().length > 0),
      },
      request: req,
    });
  }

  // Regra de estrelas: 1 por acerto + bónus de 1 se 100%.
  const acertos = Math.max(0, Math.min(correctos, total));
  const estrelasGanhas = acertos + (total > 0 && acertos === total ? 1 : 0);

  const jarrosDesbloqueados: JarroDesbloqueado[] = [];
  let totalApos: number | null = null;

  if (estrelasGanhas > 0) {
    const { data: novoTotal, error: rpcErr } = await admin.rpc("incrementar_estrelas", {
      p_crianca_id: criancaId,
      p_estrelas: estrelasGanhas,
    });

    if (rpcErr) {
      console.error("[licao/completa] incrementar_estrelas falhou:", rpcErr);
    } else {
      totalApos = novoTotal as number;

      await log({
        userId: auth.data.userId,
        action: "estrelas.ganhas",
        entityType: "licao",
        entityId: licao_id,
        metadata: {
          crianca_id: criancaId,
          quantidade: estrelasGanhas,
          total_apos: totalApos,
          acertos,
          total,
        },
        request: req,
      });

      // Jarros já abertos por esta criança
      const { data: jarrosExistentes } = await admin
        .from("jarros_abertos")
        .select("numero, facto_id")
        .eq("crianca_id", criancaId)
        .order("numero", { ascending: true });

      const numerosAbertos = new Set(jarrosExistentes?.map((j) => j.numero) ?? []);
      const factosDados = new Set(
        (jarrosExistentes ?? []).map((j) => j.facto_id).filter((x): x is number => x !== null),
      );
      const maiorNumero = Math.max(0, ...numerosAbertos);

      // Cada múltiplo de 25 ainda não aberto dispara um jarro
      const alvos: number[] = [];
      for (let k = maiorNumero + 1; k * 25 <= totalApos; k++) alvos.push(k);

      for (const numero of alvos) {
        // Escolher 1 facto aleatório ainda não entregue
        const { data: candidatos } = await admin
          .from("ninguem_te_conta")
          .select("id, facto, categoria")
          .limit(500);

        const poolDisponivel =
          candidatos?.filter((f) => !factosDados.has(f.id as number)) ?? [];

        const escolhido =
          poolDisponivel.length > 0
            ? poolDisponivel[Math.floor(Math.random() * poolDisponivel.length)]
            : null;

        if (escolhido) factosDados.add(escolhido.id as number);

        const ehPrimeiro = numero === 1;

        const { error: insertErr } = await admin.from("jarros_abertos").insert({
          crianca_id: criancaId,
          numero,
          facto_id: escolhido?.id ?? null,
          eh_primeiro: ehPrimeiro,
          estrelas_no_momento: totalApos,
        });

        if (insertErr) {
          console.error("[licao/completa] jarro insert falhou:", insertErr);
          continue;
        }

        if (ehPrimeiro) {
          await admin
            .from("criancas")
            .update({ primeiro_jarro_visto: true })
            .eq("id", criancaId);
        }

        await log({
          userId: auth.data.userId,
          action: "jarro.desbloqueado",
          entityType: "jarro",
          metadata: {
            crianca_id: criancaId,
            numero,
            facto_id: escolhido?.id ?? null,
            eh_primeiro: ehPrimeiro,
          },
          request: req,
        });

        jarrosDesbloqueados.push({
          numero,
          facto_id: escolhido?.id ?? null,
          facto: (escolhido?.facto as string | undefined) ?? null,
          categoria: (escolhido?.categoria as string | undefined) ?? null,
          eh_primeiro: ehPrimeiro,
          intro_erasmo: ehPrimeiro ? ERASMO_PITHOS_INTRO : undefined,
        });
      }

      if (jarrosDesbloqueados.length > 0) {
        await admin
          .from("criancas")
          .update({ jarros_abertos: maiorNumero + jarrosDesbloqueados.length })
          .eq("id", criancaId);
      }
    }
  }

  await log({
    userId: auth.data.userId,
    action: "licao.concluida",
    entityType: "licao",
    entityId: licao_id,
    metadata: {
      crianca_id: criancaId,
      estrelas_ganhas: estrelasGanhas,
      acertos,
      total,
      tempo_total_ms: tempo_total_ms ?? null,
      ja_completou: false,
    },
    request: req,
  });

  const resposta: RespostaCompleta = {
    ok: true,
    ja_completou: false,
    estrelas_ganhas: estrelasGanhas,
    total_apos: totalApos,
    momento_entregue: momentoEntregue,
    jarros: jarrosDesbloqueados,
  };

  return NextResponse.json(resposta);
}
