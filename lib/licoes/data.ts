import type { Dimensao } from "@/lib/dimensoes";

export interface ExercicioData {
  pergunta: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
}

export interface LicaoData {
  slug: string;
  titulo: string;
  dimensao: Dimensao;
  narrativa: string;
  duracao: string;
  competencia_id: string; // UUID referencing the competencias table
  exercicios: ExercicioData[];
}

export const NOVAS_LICOES: LicaoData[] = [
  {
    slug: "palavras-que-voam",
    titulo: "As Palavras que Voam",
    dimensao: "artistica",
    narrativa:
      "Era uma vez uma criança que descobriu que as palavras não são todas iguais. Algumas descrevem como as coisas são — são os adjectivos. Outras mostram o que acontece — são os verbos. E outras ainda ligam as ideias umas às outras — são as conjunções. Com estas três superpotências, podes construir frases que voam até à imaginação de quem as lê.",
    duracao: "12 min",
    competencia_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    exercicios: [
      {
        pergunta: "O gato ___ rapidamente pela janela.",
        opcoes: ["saltou", "amarelo", "bonito", "mas"],
        correta: 0,
        explicacao:
          '"Saltou" é um verbo — descreve a acção do gato. "Amarelo" e "bonito" são adjectivos e "mas" é uma conjunção.',
      },
      {
        pergunta: "Qual destas palavras descreve como alguém é?",
        opcoes: ["feliz", "correr", "e", "casa"],
        correta: 0,
        explicacao:
          '"Feliz" é um adjectivo — descreve uma qualidade de alguém. "Correr" é verbo, "e" é conjunção e "casa" é substantivo.',
      },
      {
        pergunta: "A Maria ___ a sua amiga porque ela estava triste.",
        opcoes: ["abraçou", "grande", "porém", "azul"],
        correta: 0,
        explicacao:
          '"Abraçou" é o verbo que descreve a acção da Maria. "Grande" e "azul" são adjectivos e "porém" é conjunção.',
      },
      {
        pergunta: "Qual é o adjectivo nesta frase: 'O céu está limpo'?",
        opcoes: ["limpo", "céu", "está", "o"],
        correta: 0,
        explicacao:
          '"Limpo" é o adjectivo — descreve como é o céu. "Céu" é substantivo, "está" é verbo e "o" é artigo.',
      },
      {
        pergunta: "Liga duas ideias: 'Gosto de ler ___ também gosto de desenhar.'",
        opcoes: ["e", "corri", "bonito", "porta"],
        correta: 0,
        explicacao:
          '"E" é uma conjunção — serve para ligar duas ideias numa frase de forma harmoniosa.',
      },
    ],
  },
  {
    slug: "o-mapa-dos-numeros",
    titulo: "O Mapa dos Números",
    dimensao: "logica",
    narrativa:
      "A exploradora Lena encontrou um mapa antigo numa caixa empoeirada. Para desvendar os segredos do mapa, tinha de resolver enigmas numéricos — padrões misteriosos, multiplicações escondidas e divisões que partilhavam tesouros. Cada número certo abria uma nova porta no mapa. Será que consegues ajudá-la a chegar ao tesouro?",
    duracao: "14 min",
    competencia_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    exercicios: [
      {
        pergunta: "Qual é o resultado de 7 × 8?",
        opcoes: ["56", "54", "63", "48"],
        correta: 0,
        explicacao:
          "7 × 8 = 56. Podes pensar: 7 × 8 = 7 × 4 × 2 = 28 × 2 = 56.",
      },
      {
        pergunta:
          "Se tens 36 rebuçados e divides por 4 amigos, quantos ficam a cada um?",
        opcoes: ["9", "8", "7", "12"],
        correta: 0,
        explicacao:
          "36 ÷ 4 = 9. Se divides 36 em 4 grupos iguais, cada grupo tem 9 rebuçados.",
      },
      {
        pergunta: "Qual é o número que falta? 5, 10, 15, ___, 25",
        opcoes: ["20", "18", "22", "19"],
        correta: 0,
        explicacao:
          "O padrão é adicionar 5 a cada número. Depois de 15 vem 15 + 5 = 20.",
      },
      {
        pergunta: "Uma caixa tem 6 filas com 9 ovos cada. Quantos ovos no total?",
        opcoes: ["54", "45", "63", "48"],
        correta: 0,
        explicacao:
          "6 × 9 = 54. Podes calcular: 6 × 10 - 6 = 60 - 6 = 54.",
      },
      {
        pergunta: "Qual é metade de 84?",
        opcoes: ["42", "44", "40", "46"],
        correta: 0,
        explicacao:
          "Metade de 84 é 84 ÷ 2 = 42. Metade de 80 é 40, metade de 4 é 2, logo 40 + 2 = 42.",
      },
    ],
  },
  {
    slug: "a-vida-secreta-das-plantas",
    titulo: "A Vida Secreta das Plantas",
    dimensao: "naturalista",
    narrativa:
      'O Tomás estava no jardim quando percebeu algo incrível: as plantas estão sempre a trabalhar, em silêncio. De dia absorvem luz do sol e dióxido de carbono, e libertam oxigénio — o ar que respiramos. De noite fazem o contrário. As raízes bebem água do solo, as folhas "respiram" e os frutos guardam a energia. As plantas são verdadeiras fábricas vivas!',
    duracao: "13 min",
    competencia_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    exercicios: [
      {
        pergunta: "O que é que as plantas precisam para fazer fotossíntese?",
        opcoes: ["luz solar", "vento", "terra", "frio"],
        correta: 0,
        explicacao:
          "As plantas precisam de luz solar, água e CO₂ para fazer fotossíntese e transformá-los em energia.",
      },
      {
        pergunta: "Qual parte da planta absorve água do solo?",
        opcoes: ["raiz", "folha", "flor", "caule"],
        correta: 0,
        explicacao:
          "As raízes absorvem água e sais minerais do solo e transportam-nos para o resto da planta.",
      },
      {
        pergunta: "O que libertam as plantas durante o dia?",
        opcoes: ["oxigénio", "dióxido de carbono", "azoto", "vapor"],
        correta: 0,
        explicacao:
          "Durante o dia, as plantas absorvem CO₂ e libertam oxigénio como resultado da fotossíntese.",
      },
      {
        pergunta:
          "Como se chama o processo em que a água dos rios sobe para as nuvens?",
        opcoes: ["evaporação", "fotossíntese", "respiração", "germinação"],
        correta: 0,
        explicacao:
          "A evaporação é o processo pelo qual a água líquida se transforma em vapor e sobe para a atmosfera.",
      },
      {
        pergunta: "Onde fica guardada a energia que a planta produz?",
        opcoes: ["fruto e folhas", "flores", "raízes", "casca"],
        correta: 0,
        explicacao:
          "A energia produzida pela fotossíntese é guardada sob a forma de açúcares, principalmente nas folhas e nos frutos.",
      },
    ],
  },
  {
    slug: "a-aventura-em-ingles",
    titulo: "The Big Adventure",
    dimensao: "artistica",
    narrativa:
      "Beep é um robot curioso que chegou a Portugal numa nave espacial. O problema? Beep só fala inglês! A criança decide ajudá-lo a comunicar com toda a gente. Juntos exploram as cores do arco-íris, os animais da quinta, os números e as acções do dia-a-dia. Com cada palavra aprendida, Beep fica mais feliz — e tu ficas mais capaz!",
    duracao: "11 min",
    competencia_id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    exercicios: [
      {
        pergunta: "Como se diz 'gato' em inglês?",
        opcoes: ["cat", "dog", "bird", "fish"],
        correta: 0,
        explicacao:
          '"Cat" significa gato em inglês. "Dog" é cão, "bird" é pássaro e "fish" é peixe.',
      },
      {
        pergunta: "What colour is the sun?",
        opcoes: ["yellow", "blue", "green", "red"],
        correta: 0,
        explicacao:
          'The sun is yellow! "Yellow" significa amarelo em português.',
      },
      {
        pergunta: "Como se diz 'estou feliz' em inglês?",
        opcoes: ["I am happy", "I am sad", "I am tired", "I am hungry"],
        correta: 0,
        explicacao:
          '"I am happy" significa "estou feliz". "Sad" é triste, "tired" é cansado e "hungry" é com fome.',
      },
      {
        pergunta: "Which word means 'correr'?",
        opcoes: ["run", "jump", "swim", "fly"],
        correta: 0,
        explicacao:
          '"Run" significa correr. "Jump" é saltar, "swim" é nadar e "fly" é voar.',
      },
      {
        pergunta: "How many days are in a week?",
        opcoes: ["7", "5", "6", "8"],
        correta: 0,
        explicacao:
          "There are 7 days in a week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday and Sunday.",
      },
    ],
  },
  {
    slug: "os-descobrimentos",
    titulo: "Os Descobrimentos",
    dimensao: "social",
    narrativa:
      "Portugal, um pequeno país na ponta da Europa, teve uma ideia enorme: e se atravessássemos o oceano? No século XV, navegadores corajosos partiram em caravelas para o desconhecido. Vasco da Gama chegou à Índia. Pedro Álvares Cabral encontrou o Brasil. Bartolomeu Dias dobrou o Cabo da Boa Esperança. Estes descobrimentos ligaram mundos que nunca se tinham encontrado — e mudaram a história para sempre.",
    duracao: "15 min",
    competencia_id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    exercicios: [
      {
        pergunta: "Como se chamavam os barcos usados pelos navegadores portugueses?",
        opcoes: ["caravelas", "galeões", "fragatas", "barcaças"],
        correta: 0,
        explicacao:
          "As caravelas eram embarcações leves e rápidas, perfeitas para explorar mares desconhecidos.",
      },
      {
        pergunta: "Quem foi o primeiro navegador a chegar à Índia pelo mar?",
        opcoes: [
          "Vasco da Gama",
          "Pedro Álvares Cabral",
          "Bartolomeu Dias",
          "Fernão de Magalhães",
        ],
        correta: 0,
        explicacao:
          "Vasco da Gama chegou à Índia em 1498, abrindo a rota marítima para o Oriente.",
      },
      {
        pergunta: "Em que século aconteceram os Descobrimentos portugueses?",
        opcoes: ["século XV e XVI", "século XII", "século XVIII", "século X"],
        correta: 0,
        explicacao:
          "Os Descobrimentos ocorreram principalmente nos séculos XV e XVI, durante os reinados de D. João II e D. Manuel I.",
      },
      {
        pergunta: "Que país foi descoberto por Pedro Álvares Cabral em 1500?",
        opcoes: ["Brasil", "Angola", "Índia", "Moçambique"],
        correta: 0,
        explicacao:
          "Pedro Álvares Cabral chegou ao Brasil em 1500, tornando-o território português.",
      },
      {
        pergunta: "Para que servia a bússola nos barcos?",
        opcoes: [
          "indicar o norte",
          "medir o tempo",
          "ver as estrelas",
          "calcular distâncias",
        ],
        correta: 0,
        explicacao:
          "A bússola indica sempre o norte magnético, ajudando os navegadores a saber em que direcção seguiam.",
      },
    ],
  },
];

// Helper: look up a lesson by slug
export function getLicaoBySlug(slug: string): LicaoData | undefined {
  return NOVAS_LICOES.find((l) => l.slug === slug);
}
