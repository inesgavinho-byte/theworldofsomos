import type { Dimensao } from "@/lib/dimensoes";

/**
 * SOMOS — Conteúdo Universal
 * Esta lição pertence à condição humana, não a nenhum currículo.
 * Uma criança em Lisboa e uma criança em Tóquio têm exactamente
 * as mesmas perguntas sobre o que sentem e o que isso significa.
 */
export const licao = {
  slug: "as-emocoes-sao-dados",
  titulo: "As Emoções são Dados",
  dimensao: "identitaria" as Dimensao,
  tipo: "universal" as const,
  curriculo: null,
  nivel: 1,
  duracao: "10 min",
  competencia: {
    dimensao: "identitaria",
    area: "Consciência Emocional",
    nivel: 1,
    descricao: "Reconhece e nomeia emoções, distingue emoção de comportamento e compreende o que cada emoção comunica.",
    curriculo: null,
    tipo: "universal",
  },
  conteudo: `
O Zé estava com o coração a bater muito rápido antes de falar à turma. "Estou com medo," disse ele para si mesmo.

A professora ouviu e sorriu. "Sabes o que é que esse medo te está a dizer?"

O Zé ficou surpreso. As emoções diziam coisas?

**As emoções são informação.** Não são fraqueza. Não são erros. São o sistema de navegação interno do teu corpo — como um GPS que usa sentimentos em vez de mapas.

Quando sentes **medo**, o teu corpo está a dizer: *"Presta atenção. Isto importa."*
Quando sentes **raiva**, o teu corpo está a dizer: *"Algo parece injusto ou errado."*
Quando sentes **alegria**, o teu corpo está a dizer: *"Isto é bom. Quero mais disto."*
Quando sentes **tristeza**, o teu corpo está a dizer: *"Perdi algo que era importante para mim."*

Mas atenção: sentir uma emoção é diferente de agir por causa dela.

O Zé sentiu medo — isso era a emoção. Poderia ter fugido da sala — isso seria o comportamento. Em vez disso, respirou fundo, reconheceu a mensagem do medo (*"isto importa-me"*) e foi falar assim mesmo.

As emoções não nos controlam. São dados. E nós decidimos o que fazer com eles.
  `.trim(),
  exercicios: [
    {
      pergunta: "Quando sentes medo antes de uma apresentação, o que o teu corpo está a tentar dizer?",
      opcoes: [
        "Que és fraco e não deves fazer a apresentação",
        "Que a situação importa e deves estar atento",
        "Que há perigo real e tens de fugir",
        "Que estás doente e precisas de descanso",
      ],
      resposta_correcta: 1,
    },
    {
      pergunta: "Qual é a diferença entre uma emoção e um comportamento?",
      opcoes: [
        "São a mesma coisa — emoção e comportamento significam o mesmo",
        "A emoção é o que fazes, o comportamento é o que sentes",
        "A emoção é o que sentes dentro de ti, o comportamento é o que fazes",
        "As emoções são sempre visíveis para os outros",
      ],
      resposta_correcta: 2,
    },
    {
      pergunta: "A Ana está com raiva do irmão mas decide respirar fundo antes de responder. O que está a fazer?",
      opcoes: [
        "Fingir que não está com raiva",
        "Separar a emoção do comportamento — sentiu a emoção mas escolheu como agir",
        "Ignorar as suas emoções",
        "Mostrar que não liga ao irmão",
      ],
      resposta_correcta: 1,
    },
    {
      pergunta: "Se uma pessoa chora ao ver um filme triste, o que é que isso nos diz?",
      opcoes: [
        "Que ela é fraca e não devia chorar",
        "Que ela não gosta do filme",
        "Que ela está doente",
        "Que ela consegue sentir empatia e ligação com os outros",
      ],
      resposta_correcta: 3,
    },
    {
      pergunta: "Porque é que reconhecer as nossas emoções é importante?",
      opcoes: [
        "Para as esconder melhor dos outros",
        "Para não as sentir e parecer mais forte",
        "Para as compreender e fazer escolhas melhores",
        "Para sabermos que emoções são proibidas",
      ],
      resposta_correcta: 2,
    },
  ],
};
