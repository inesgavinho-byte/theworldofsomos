import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { SOMOS_TOM_SYSTEM } from "@/lib/claude-system-prompt";

// POST /api/mailbox-resposta-automatica
// Called by a cron job — processes cartas that have been waiting > 48h without response
// Also handles 7-day transformation

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (!cachedClient) cachedClient = new Anthropic();
  return cachedClient;
}

export async function POST(req: Request) {
  try {
    // Verify cron secret to prevent unauthorised calls
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }

    const supabase = await createClient();

    const agora = new Date();

    // --- CAMADA 2: Cartas sem resposta após 48h ---
    const limite48h = new Date(agora.getTime() - 48 * 60 * 60 * 1000);

    const { data: cartasSemResposta, error: err1 } = await supabase
      .from("mailbox_cartas")
      .select("id, conteudo")
      .eq("estado", "aguarda")
      .lt("created_at", limite48h.toISOString())
      .limit(10);

    if (err1) {
      console.error("Erro ao buscar cartas sem resposta:", err1);
    }

    const resultados48h: string[] = [];

    for (const carta of cartasSemResposta ?? []) {
      try {
        const response = await getClient().messages.create({
          model: "claude-opus-4-5",
          max_tokens: 400,
          system: SOMOS_TOM_SYSTEM + `\n\nÉs o SOMOS — uma plataforma que acredita que os nossos filhos
merecem ser formados como pessoas inteiras.

Alguém depositou uma carta anónima e ainda não recebeu resposta da comunidade.
A tua tarefa é responder com cuidado, como um amigo sábio que ouviu de verdade.

REGRAS:
- Nunca condescendente. Nunca com respostas feitas.
- Reconhece o que foi dito. Valida o que é real.
- Não resolves o problema — acompanhas.
- Se houver sinais de crise real, inclui recursos de apoio portugueses.
- Máximo 4 parágrafos curtos.
- Termina sempre com uma pergunta aberta — para a pessoa continuar a pensar.`,
          messages: [{ role: "user", content: carta.conteudo }],
        });

        const respostaTexto =
          response.content[0].type === "text"
            ? response.content[0].text
            : "";

        if (!respostaTexto) continue;

        const expiresAt = new Date(agora.getTime() + 48 * 60 * 60 * 1000);

        const respostaFinal =
          respostaTexto +
          "\n\n---\n*A comunidade ainda não chegou a esta carta. Mas o SOMOS estava aqui.*";

        await supabase
          .from("mailbox_cartas")
          .update({
            estado: "respondida",
            resposta: respostaFinal,
            respondida_at: agora.toISOString(),
            expires_at: expiresAt.toISOString(),
          })
          .eq("id", carta.id)
          .eq("estado", "aguarda");

        resultados48h.push(carta.id);
      } catch (iaErr) {
        console.error(`Erro ao gerar resposta automática para carta ${carta.id}:`, iaErr);
      }
    }

    // --- CAMADA 3: Transformação após 7 dias ---
    // Cartas em aguarda há mais de 7 dias que já foram tratadas pela camada 2
    // (or cartas respondidas cujo expires_at já passou)
    const limite7d = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: cartasExpiradas } = await supabase
      .from("mailbox_cartas")
      .select("id, conteudo, estado")
      .or(`expires_at.lt.${agora.toISOString()},and(estado.eq.aguarda,created_at.lt.${limite7d.toISOString()})`)
      .limit(20);

    // Extract themes using AI before deleting
    const temas: string[] = [];
    for (const carta of cartasExpiradas ?? []) {
      try {
        const temaResponse = await getClient().messages.create({
          model: "claude-opus-4-5",
          max_tokens: 60,
          system: SOMOS_TOM_SYSTEM + `\n\nAnalisa esta carta anónima e identifica o tema principal em 2-4 palavras em português.
Exemplos: "ansiedade escolar", "neurodivergência", "conflito familiar", "burnout parental", "solidão", "dificuldades financeiras".
Responde APENAS com o tema, sem pontuação nem explicação.`,
          messages: [{ role: "user", content: carta.conteudo }],
        });

        const tema =
          temaResponse.content[0].type === "text"
            ? temaResponse.content[0].text.trim().toLowerCase()
            : null;

        if (tema) {
          temas.push(tema);

          // Upsert into mailbox_padroes
          const { data: padrao } = await supabase
            .from("mailbox_padroes")
            .select("id, frequencia")
            .eq("tema", tema)
            .single();

          if (padrao) {
            await supabase
              .from("mailbox_padroes")
              .update({
                frequencia: (padrao.frequencia ?? 1) + 1,
                ultimo_visto: agora.toISOString(),
              })
              .eq("id", padrao.id);
          } else {
            await supabase.from("mailbox_padroes").insert({
              tema,
              frequencia: 1,
              primeiro_visto: agora.toISOString(),
              ultimo_visto: agora.toISOString(),
            });
          }
        }
      } catch (temaErr) {
        console.error(`Erro ao extrair tema da carta ${carta.id}:`, temaErr);
      }
    }

    // Apagar conteúdo das cartas expiradas (manter registo sem conteúdo sensível)
    if ((cartasExpiradas ?? []).length > 0) {
      const ids = (cartasExpiradas ?? []).map((c) => c.id);
      await supabase.from("mailbox_cartas").delete().in("id", ids);
    }

    return NextResponse.json({
      ok: true,
      respondidas_automaticamente: resultados48h.length,
      temas_extraidos: temas,
      cartas_apagadas: (cartasExpiradas ?? []).length,
    });
  } catch (err) {
    console.error("Erro na resposta automática:", err);
    return NextResponse.json({ erro: "Erro inesperado." }, { status: 500 });
  }
}
