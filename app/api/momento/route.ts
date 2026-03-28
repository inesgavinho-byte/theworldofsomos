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
- Se o Momento mencionar uma pessoa histórica, inventor, cientista ou figura que uma criança de 8-10 anos provavelmente não conhece, apresenta brevemente quem foi em UMA frase simples antes do Momento, dentro do campo "para_crianca". Nunca assumir que a criança sabe quem é a pessoa. Máximo 1 frase de apresentação, depois o Momento. Exemplo: "Thomas Edison foi o inventor da lâmpada eléctrica. Ele não falhou cinco mil vezes — descobriu cinco mil maneiras que não funcionavam, até encontrar a que funcionava."
- Nunca construir frases onde a ligação entre a acção histórica e a acção da criança possa ser interpretada negativamente. Exemplo ERRADO: "Sócrates foi condenado à morte por fazer perguntas. Hoje fizeste o mesmo." — a criança pode interpretar que fazer perguntas leva à morte. A ligação entre o momento histórico e a criança deve ser sempre de inspiração e continuidade — nunca de consequência negativa. Exemplo CERTO: "Sócrates foi o filósofo grego que ensinou o mundo a pensar através de perguntas. Viveu há 2500 anos e as suas perguntas ainda ecoam hoje. Tu fizeste o mesmo hoje — perguntaste, exploraste, pensaste."

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
