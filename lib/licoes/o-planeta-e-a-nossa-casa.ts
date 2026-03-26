import type { Dimensao } from "@/lib/dimensoes";

/**
 * SOMOS — Conteúdo Universal
 * Esta lição pertence à condição humana, não a nenhum currículo.
 * Não existe endereço mais democrático do que este:
 * todos os seres humanos vivem no mesmo planeta.
 */
export const licao = {
  slug: "o-planeta-e-a-nossa-casa",
  titulo: "O Planeta é a Nossa Casa",
  dimensao: "naturalista" as Dimensao,
  tipo: "universal" as const,
  curriculo: null,
  nivel: 1,
  duracao: "10 min",
  competencia: {
    dimensao: "naturalista",
    area: "Ecologia e Planeta",
    nivel: 1,
    descricao: "Compreende os ecossistemas, o impacto humano no planeta e a importância das escolhas quotidianas para o ambiente.",
    curriculo: null,
    tipo: "universal",
  },
  conteudo: `
Não existe endereço mais preciso do que este: **Terra, Sistema Solar, Via Láctea.**

Esta é a nossa casa. A casa de todos — das baleias e das formigas, das árvores e dos cogumelos, de todas as crianças de todos os países.

A Terra tem **4,5 mil milhões de anos**. Os humanos existem há cerca de 300 mil anos. Isso significa que somos inquilinos muito recentes numa casa muito antiga.

E nos últimos 200 anos — um piscar de olhos na história do planeta — mudámos mais esta casa do que em toda a nossa existência anterior.

**Como funciona a casa?**

A Terra é um sistema. Cada parte está ligada às outras:
- As **florestas** absorvem CO₂ e produzem oxigénio
- Os **oceanos** regulam a temperatura do planeta
- O **solo** alimenta as plantas que alimentam os animais
- A **atmosfera** protege-nos da radiação do sol

Quando perturbamos uma parte, as outras sentem.

**O que podemos fazer?**

Não tens de resolver tudo. Mas as escolhas de hoje constroem o planeta de amanhã:
- Usar menos plástico
- Comer menos carne
- Andar a pé em vez de carro
- Plantar uma árvore
- Aprender mais

O planeta não precisa que sejas perfeito. Precisa que estejas atento.
  `.trim(),
  exercicios: [
    {
      pergunta: "Qual é o nome da camada de ar que envolve e protege a Terra?",
      opcoes: [
        "Hidrosfera",
        "Litosfera",
        "Atmosfera",
        "Biosfera",
      ],
      resposta_correcta: 2,
    },
    {
      pergunta: "O que acontece quando muitas árvores são cortadas numa floresta?",
      opcoes: [
        "O ar fica melhor porque há mais espaço",
        "Aparecem mais animais porque têm mais espaço para viver",
        "Há menos absorção de CO₂, o solo perde nutrientes e a biodiversidade diminui",
        "A chuva aumenta porque não há folhas para a bloquear",
      ],
      resposta_correcta: 2,
    },
    {
      pergunta: "Qual destas acções ajuda o planeta no dia-a-dia?",
      opcoes: [
        "Deixar as luzes ligadas quando saímos do quarto",
        "Comprar sempre coisas novas em vez de reparar as antigas",
        "Separar o lixo para reciclar e usar menos plástico",
        "Usar sempre o carro mesmo para distâncias curtas",
      ],
      resposta_correcta: 2,
    },
    {
      pergunta: "O que é um ecossistema?",
      opcoes: [
        "Uma fábrica de energia renovável",
        "Uma cidade planeada para ser sustentável",
        "Um tipo especial de planta tropical",
        "Uma comunidade de seres vivos que interagem entre si e com o seu ambiente",
      ],
      resposta_correcta: 3,
    },
    {
      pergunta: "Porque é que a Terra é chamada 'o planeta azul'?",
      opcoes: [
        "Porque tem muito frio e o gelo é azul",
        "Porque tem tanta água que parece azul vista do espaço",
        "Porque o céu é sempre azul em todo o planeta",
        "Porque os cientistas escolheram azul como cor do planeta",
      ],
      resposta_correcta: 1,
    },
  ],
};
