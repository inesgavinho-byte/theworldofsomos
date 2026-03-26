import type { Dimensao } from "@/lib/dimensoes";

/**
 * SOMOS — Conteúdo Universal
 * Esta lição pertence à condição humana, não a nenhum currículo.
 * Nenhuma criança no mundo chega a algum lugar novo sem se perder
 * pelo caminho — e isso é exactamente como deveria ser.
 */
export const licao = {
  slug: "errar-e-parte-do-mapa",
  titulo: "Errar é Parte do Mapa",
  dimensao: "identitaria" as Dimensao,
  tipo: "universal" as const,
  curriculo: null,
  nivel: 1,
  duracao: "10 min",
  competencia: {
    dimensao: "identitaria",
    area: "Crescimento e Resiliência",
    nivel: 1,
    descricao: "Compreende o papel do erro no aprendizagem, distingue esforço de resultado e desenvolve uma mentalidade de crescimento.",
    curriculo: null,
    tipo: "universal",
  },
  conteudo: `
Imagina um explorador com um mapa que ainda não está completo.

Cada vez que ele se perde, descobre um caminho que não estava no mapa. Cada vez que encontra um obstáculo, aprende algo sobre o território. O mapa vai crescendo — não apesar dos erros, mas **por causa deles**.

O teu cérebro funciona exactamente assim.

Quando aprendes algo novo e cometes um erro, o teu cérebro cria **conexões novas** para entender o que correu mal. É literalmente nesse momento — quando erras e percebes porquê — que mais estás a aprender.

Existe uma diferença importante entre dois tipos de mentalidade:

**Mentalidade fixa:** "Ou sei, ou não sei. Se errei, é porque não sou bom nisso."
**Mentalidade de crescimento:** "Ainda não consegui. Mas posso aprender."

A palavra mais poderosa do aprendizagem é **"ainda"**.

Não sei fazer isto — *ainda*.
Não consigo resolver este problema — *ainda*.
Não percebo este conceito — *ainda*.

O erro não é o oposto do sucesso. O erro é o **caminho** para ele.

Nenhum explorador famoso chegou a um lugar novo sem se ter perdido pelo caminho. E o mapa que trouxe de volta — esse era muito melhor do que aquele com que tinha partido.
  `.trim(),
  exercicios: [
    {
      pergunta: "O que é a 'mentalidade de crescimento' (growth mindset)?",
      opcoes: [
        "Acreditar que a inteligência é fixa — ou se tem ou não se tem",
        "Nunca cometer erros e ser sempre o melhor",
        "Acreditar que podemos crescer com esforço, prática e aprendizagem",
        "Crescer fisicamente e ficar mais alto",
      ],
      resposta_correcta: 2,
    },
    {
      pergunta: "Quando cometes um erro numa tarefa, o que é mais útil fazer?",
      opcoes: [
        "Desistir imediatamente — provavelmente não és bom nisso",
        "Culpar os outros pelo teu erro",
        "Fingir que não aconteceu e seguir em frente",
        "Perceber onde erraste, aprender com isso e tentar de novo",
      ],
      resposta_correcta: 3,
    },
    {
      pergunta: "Qual destas frases mostra uma mentalidade de crescimento?",
      opcoes: [
        "Não sou bom a matemática e nunca vou ser.",
        "Ainda não consegui resolver isto, mas posso aprender.",
        "Já nasci com talento — não preciso de esforçar-me.",
        "Errar é uma vergonha e nunca devia acontecer.",
      ],
      resposta_correcta: 1,
    },
    {
      pergunta: "O que acontece no teu cérebro quando erras e percebes porquê?",
      opcoes: [
        "O cérebro fica mais fraco e cansado",
        "Nada — os erros não têm efeito no cérebro",
        "O cérebro cria conexões novas — é quando mais estás a aprender",
        "O cérebro apaga a informação errada",
      ],
      resposta_correcta: 2,
    },
    {
      pergunta: "Qual é a diferença entre esforço e resultado?",
      opcoes: [
        "São exactamente a mesma coisa",
        "O resultado é o único que importa — o esforço não conta",
        "O esforço é o que controlas; o resultado pode depender de mais factores",
        "O esforço é sempre visível para os outros",
      ],
      resposta_correcta: 2,
    },
  ],
};
