import type { Dimensao } from "@/lib/dimensoes";

export const licao = {
  slug: "os-descobrimentos",
  titulo: "Os Descobrimentos",
  dimensao: "social" as Dimensao,
  curriculo: "PT",
  nivel: 3,
  duracao: "10 min",
  competencia: {
    dimensao: "social",
    area: "História e Geografia de Portugal",
    nivel: 3,
    descricao: "Conhece os principais navegadores e acontecimentos dos Descobrimentos portugueses.",
    curriculo: "PT",
  },
  conteudo: `
Portugal é um país pequenino, encostado ao Atlântico. Mas um dia, teve uma ideia enorme.

"E se atravessarmos o oceano?"

Ninguém sabia o que havia do outro lado. Os mapas terminavam no mar. Mas os portugueses construíram barcos especiais — as **caravelas** — rápidas, leves, capazes de navegar contra o vento.

**Bartolomeu Dias** dobrou o Cabo da Boa Esperança, a ponta de África, em 1488. **Vasco da Gama** chegou à **Índia** em 1498 — a primeira viagem marítima de Portugal à Ásia. **Pedro Álvares Cabral** chegou ao **Brasil** em 1500, quase por acidente, numa viagem para a Índia.

Tinham **bússolas** para saber onde era o norte. Tinham **astrolábios** para ler as estrelas. Tinham coragem para ir onde ninguém tinha ido.

Os Descobrimentos aconteceram nos **séculos XV e XVI** — há mais de 500 anos. Mudaram os mapas, as rotas do comércio, e a história de três continentes.

Portugal, pequeno país na ponta da Europa, deixou a sua marca no mundo inteiro.
  `.trim(),
  exercicios: [
    {
      pergunta: "Como se chamavam os barcos usados pelos navegadores portugueses?",
      opcoes: ["caravelas", "galeões", "fragatas", "barcaças"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Quem foi o primeiro navegador a chegar à Índia pelo mar?",
      opcoes: ["Vasco da Gama", "Pedro Álvares Cabral", "Bartolomeu Dias", "Fernão de Magalhães"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Em que século aconteceram os Descobrimentos portugueses?",
      opcoes: ["século XV e XVI", "século XII", "século XVIII", "século X"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Que país foi descoberto por Pedro Álvares Cabral em 1500?",
      opcoes: ["Brasil", "Angola", "Índia", "Moçambique"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Para que servia a bússola nos barcos?",
      opcoes: ["indicar o norte", "medir o tempo", "ver as estrelas", "calcular distâncias"],
      resposta_correcta: 0,
    },
  ],
};
