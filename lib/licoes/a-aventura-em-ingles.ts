import type { Dimensao } from "@/lib/dimensoes";

export const licao = {
  slug: "a-aventura-em-ingles",
  titulo: "The Big Adventure",
  dimensao: "artistica" as Dimensao,
  curriculo: "PT",
  nivel: 3,
  duracao: "10 min",
  competencia: {
    dimensao: "artistica",
    area: "Inglês",
    nivel: 3,
    descricao: "Reconhece e usa vocabulário básico em inglês: animais, cores, emoções e acções.",
    curriculo: "PT",
  },
  conteudo: `
Um dia, apareceu na porta da escola um robot pequenino. Chamava-se **Beep**.

"Hello!" disse Beep. "I am Beep. I do not speak Portuguese."

A turma ficou toda animada. Iam ajudar Beep a aprender as primeiras palavras.

"This is a **cat**," disse a Ana, apontando para o desenho no livro. Beep repetiu: "Cat. Cat. Cat!"

"The sky is **blue**," disse o João, olhando pela janela. "Blue... azul!" descobriu Beep.

"I am **happy**!" gritou Beep, a saltar de alegria. E a turma respondeu: "We are happy too!"

No fim do dia, Beep sabia dizer *cat*, *dog*, *bird*, *yellow*, *blue*, *happy*, *run*, *jump* — e os dias da semana todos de seguida, sem enganos.

Aprender uma língua nova é como abrir uma porta para um mundo diferente. Beep tinha acabado de encontrar a chave.
  `.trim(),
  exercicios: [
    {
      pergunta: "Como se diz 'gato' em inglês?",
      opcoes: ["cat", "dog", "bird", "fish"],
      resposta_correcta: 0,
    },
    {
      pergunta: "What colour is the sun?",
      opcoes: ["yellow", "blue", "green", "red"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Como se diz 'estou feliz' em inglês?",
      opcoes: ["I am happy", "I am sad", "I am tired", "I am hungry"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Which word means 'correr'?",
      opcoes: ["run", "jump", "swim", "fly"],
      resposta_correcta: 0,
    },
    {
      pergunta: "How many days are in a week?",
      opcoes: ["7", "5", "6", "8"],
      resposta_correcta: 0,
    },
  ],
};
