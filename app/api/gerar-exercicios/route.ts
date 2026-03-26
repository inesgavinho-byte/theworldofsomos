import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const { data: familyMember } = await supabase
      .from("familia_membros")
      .select("familia_id, familias(plano)")
      .eq("profile_id", user.id)
      .single();

    const familiaId = (familyMember as any)?.familia_id;
    const plano = (familyMember as any)?.familias?.plano ?? "free";

    // Rate limit check
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("geracoes_ia")
      .select("id", { count: "exact", head: true })
      .eq("familia_id", familiaId)
      .gte("created_at", hoje.toISOString());

    const limite = plano === "premium" ? 10 : 2;
    if ((count ?? 0) >= limite) {
      return NextResponse.json(
        {
          erro: `Limite diário atingido. Plano ${plano === "premium" ? "Premium" : "Free"}: ${limite} gerações por dia.`,
        },
        { status: 429 }
      );
    }

    const {
      imagemBase64,
      mediaType,
      curriculo,
      anoEscolar,
      idioma,
      criancaId,
      tipoUpload,
      storagePath,
    } = await req.json();

    // Insert pending record
    const { data: geracao } = await supabase
      .from("geracoes_ia")
      .insert({
        familia_id: familiaId,
        crianca_id: criancaId || null,
        tipo_upload: tipoUpload ?? "imagem",
        storage_path: storagePath ?? null,
        curriculo,
        ano_escolar: anoEscolar,
        estado: "processando",
      })
      .select()
      .single();

    const client = new Anthropic();

    const systemPrompt = `És um especialista em educação do currículo ${curriculo} para ${anoEscolar}.
A tua tarefa é analisar uma página de livro escolar e gerar 5 exercícios de escolha múltipla.

REGRAS:
- Cada exercício tem exactamente 4 opções
- Apenas uma opção é correcta
- Linguagem adequada para ${anoEscolar} do ${curriculo}
- Todos os exercícios em ${idioma}
- Basear os exercícios APENAS no conteúdo visível na imagem
- Não inventar conteúdo que não esteja na página

FORMATO DE RESPOSTA — responde APENAS com JSON válido, sem markdown:
{
  "dimensao": "naturalista|logica|artistica|social|identitaria",
  "tema": "título curto do tema detectado",
  "exercicios": [
    {
      "pergunta": "texto da pergunta",
      "opcoes": ["opção 1", "opção 2", "opção 3", "opção 4"],
      "resposta_correcta": 0,
      "explicacao": "breve explicação da resposta correcta"
    }
  ]
}`;

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/webp"
                  | "image/gif",
                data: imagemBase64,
              },
            },
            {
              type: "text",
              text: "Analisa esta página do livro escolar e gera 5 exercícios de escolha múltipla.",
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Resposta inválida da IA");

    let exercicios;
    try {
      exercicios = JSON.parse(content.text);
    } catch {
      // Try to extract JSON from response if wrapped in markdown
      const match = content.text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Não consegui interpretar a resposta da IA");
      exercicios = JSON.parse(match[0]);
    }

    // Update record with result
    if (geracao?.id) {
      await supabase
        .from("geracoes_ia")
        .update({ exercicios_gerados: exercicios, estado: "concluido" })
        .eq("id", geracao.id);
    }

    return NextResponse.json({ sucesso: true, exercicios });
  } catch (err: any) {
    console.error("Erro ao gerar exercícios:", err);
    const msg = err.message ?? "Erro interno";
    const userMsg = msg.includes("Could not process image")
      ? "Não consegui ler esta página. Tenta com melhor iluminação."
      : msg.includes("timeout") || msg.includes("ETIMEDOUT")
      ? "A geração está a demorar. Tenta novamente."
      : msg;
    return NextResponse.json({ erro: userMsg }, { status: 500 });
  }
}
