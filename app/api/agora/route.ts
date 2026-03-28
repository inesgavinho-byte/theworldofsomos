import Anthropic from "@anthropic-ai/sdk";

const DIMENSAO_DESCRICOES: Record<string, string> = {
  naturalista: "exploração da natureza, ciência, animais, plantas e o mundo natural",
  logica: "raciocínio lógico, matemática, padrões e resolução de problemas",
  artistica: "arte, criatividade, expressão, música e imaginação",
  social: "relações humanas, emoções, cooperação e comunicação",
  identitaria: "identidade, valores, quem somos e o que nos faz únicos",
};

export async function POST(req: Request) {
  try {
    const { dimensao } = await req.json();

    if (!dimensao || !DIMENSAO_DESCRICOES[dimensao]) {
      return Response.json({ erro: "Dimensão inválida" }, { status: 400 });
    }

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Cria uma pergunta aberta para um desafio familiar em tempo real.

Dimensão: ${dimensao} — ${DIMENSAO_DESCRICOES[dimensao]}

A pergunta deve:
- Ser respondida tanto por um adulto como por uma criança (6-12 anos)
- Não ter resposta certa ou errada — é uma questão de perspectiva ou imaginação
- Ser curta e directa (máximo 1 frase)
- O contexto explica brevemente porque é interessante (máximo 1 frase, opcional)

Responde APENAS com JSON válido:
{
  "pergunta": "a pergunta",
  "contexto": "contexto breve ou string vazia"
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return Response.json({ erro: "Resposta inválida da API" }, { status: 500 });
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ erro: "JSON inválido na resposta" }, { status: 500 });
    }

    const pergunta = JSON.parse(jsonMatch[0]);
    return Response.json({ sucesso: true, pergunta });
  } catch (err) {
    console.error("[agora] erro:", err);
    return Response.json({ erro: "Erro ao gerar pergunta" }, { status: 500 });
  }
}
