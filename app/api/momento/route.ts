import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  try {
    const { tema, dimensao, titulo_licao } = await req.json();

    if (!titulo_licao || !dimensao) {
      return Response.json({ erro: "Parâmetros em falta" }, { status: 400 });
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Uma criança acabou de completar uma lição do SOMOS.

Lição: "${titulo_licao}"
Tema: ${tema ?? dimensao}
Dimensão: ${dimensao}

A tua tarefa: encontrar um momento real da história humana que ressoe
com o que esta criança acabou de aprender.

REGRAS:
- O momento deve ser real — um facto histórico, uma pessoa real, um evento documentado
- Pode ser brutal, surpreendente, inesperado — mas sempre verdadeiro
- A frase para a criança: simples, directa, que a faça sentir ligada à história. Máximo 2 frases.
- A frase para o adulto: mais camadas, mais contexto, a ligação mais profunda. Máximo 3 frases.
- Nunca condescendente. Nunca fofinho. Sempre com respeito pela inteligência de quem lê.

Responde APENAS com JSON válido:
{
  "momento_historico": "nome ou descrição curta do momento",
  "para_crianca": "frase para a criança",
  "para_adulto": "frase para o adulto"
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return Response.json({ erro: "Resposta inválida da API" }, { status: 500 });
    }

    // Extract JSON — Claude may wrap in markdown code blocks
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ erro: "JSON inválido na resposta" }, { status: 500 });
    }

    const momento = JSON.parse(jsonMatch[0]);
    return Response.json({ sucesso: true, momento });
  } catch (err) {
    console.error("[momento] erro:", err);
    return Response.json({ erro: "Erro ao gerar momento" }, { status: 500 });
  }
}
