import type { Dimensao } from "@/lib/dimensoes";

export const licao = {
  slug: "palavras-que-voam",
  titulo: "As Palavras que Voam",
  dimensao: "artistica" as Dimensao,
  curriculo: "PT",
  nivel: 3,
  duracao: "10 min",
  competencia: {
    dimensao: "artistica",
    area: "Português",
    nivel: 3,
    descricao: "Identifica e usa adjectivos, verbos e conjunções em frases simples.",
    curriculo: "PT",
  },
  conteudo: `
Era uma vez uma criança chamada Mia que descobriu uma coisa espantosa: as palavras não são todas iguais.

Algumas palavras *descrevem* — dizem como as coisas são. "O céu está **azul**." "A borboleta é **bonita**." Essas chamam-se **adjectivos**.

Outras palavras *fazem coisas acontecer* — mostram acções. "O cão **correu**." "Ela **sorriu**." Essas chamam-se **verbos**.

E há palavras que *ligam ideias* — como pontes entre frases. "Gosto de ler **e** de desenhar." "Estava cansado, **mas** continuou." Essas chamam-se **conjunções**.

Mia olhou para o jardim e viu: "A flor **vermelha** **abriu** **e** o pássaro **cantou**."

Três tipos de palavras. Três poderes diferentes. Todos juntos, fazem a magia da língua.
  `.trim(),
  exercicios: [
    {
      pergunta: "O gato ___ rapidamente pela janela.",
      opcoes: ["saltou", "amarelo", "bonito", "mas"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Qual destas palavras descreve como alguém é?",
      opcoes: ["feliz", "correr", "e", "casa"],
      resposta_correcta: 0,
    },
    {
      pergunta: "A Maria ___ a sua amiga porque ela estava triste.",
      opcoes: ["abraçou", "grande", "porém", "azul"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Qual é o adjectivo nesta frase: 'O céu está limpo'?",
      opcoes: ["limpo", "céu", "está", "o"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Liga duas ideias: 'Gosto de ler ___ também gosto de desenhar.'",
      opcoes: ["e", "corri", "bonito", "porta"],
      resposta_correcta: 0,
    },
  ],
};
