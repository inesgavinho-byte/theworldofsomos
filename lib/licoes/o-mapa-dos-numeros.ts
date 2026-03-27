import type { Dimensao } from "@/lib/dimensoes";

export const licao = {
  slug: "o-mapa-dos-numeros",
  titulo: "O Mapa dos Números",
  dimensao: "logica" as Dimensao,
  curriculo: "PT",
  nivel: 3,
  duracao: "10 min",
  competencia: {
    dimensao: "logica",
    area: "Matemática",
    nivel: 3,
    descricao: "Resolve multiplicações e divisões simples até 100; reconhece padrões numéricos.",
    curriculo: "PT",
  },
  conteudo: `
A exploradora Lena encontrou um mapa antigo numa caixa de madeira. Estava coberto de números misteriosos, dispostos em padrões estranhos.

"Para desvendar o tesouro," dizia o mapa, "tens de conhecer os segredos dos números."

O primeiro segredo era a **multiplicação**. Não é magia — é somar grupos iguais de forma rápida. 7 grupos de 8 é o mesmo que 7 × 8 = 56.

O segundo segredo era a **divisão**. É o contrário: se tens 36 rebuçados e queres partilhar por 4, quantos fica cada um? 36 ÷ 4 = 9.

O terceiro segredo eram os **padrões**. Os números escondem sequências. 5, 10, 15, ___, 25. Sempre a saltar de 5 em 5.

Lena resolveu todos os enigmas. O tesouro? Era perceber que os números têm uma ordem — e que essa ordem tem sempre sentido.
  `.trim(),
  exercicios: [
    {
      pergunta: "Qual é o resultado de 7 × 8?",
      opcoes: ["56", "54", "63", "48"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Se tens 36 rebuçados e divides por 4 amigos, quantos fica cada um?",
      opcoes: ["9", "8", "7", "12"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Qual é o número que falta? 5, 10, 15, ___, 25",
      opcoes: ["20", "18", "22", "19"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Uma caixa tem 6 filas com 9 ovos cada. Quantos ovos no total?",
      opcoes: ["54", "45", "63", "48"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Qual é metade de 84?",
      opcoes: ["42", "44", "40", "46"],
      resposta_correcta: 0,
    },
  ],
};
