export interface LicaoMeta {
  slug: string;
  titulo: string;
  subtitulo: string;
  dimensao: string;
}

export const LICOES_META: LicaoMeta[] = [
  { slug: "floresta-tropical", titulo: "A Floresta Tropical", subtitulo: "Ecossistemas e biodiversidade", dimensao: "Naturalista" },
  { slug: "cerebro-incrivel", titulo: "O Cérebro Incrível", subtitulo: "Como funciona a tua mente", dimensao: "Identitária" },
  { slug: "sistema-solar", titulo: "O Sistema Solar", subtitulo: "Planetas e galáxias", dimensao: "Lógica" },
  { slug: "a-zona-certa", titulo: "A Zona Certa", subtitulo: "Encontrar o teu espaço", dimensao: "Identitária" },
  { slug: "o-proposito", titulo: "O Propósito", subtitulo: "Para que estou aqui?", dimensao: "Social" },
  { slug: "palavras-que-voam", titulo: "As Palavras que Voam", subtitulo: "Adjectivos, verbos e conjunções", dimensao: "Artística" },
  { slug: "o-mapa-dos-numeros", titulo: "O Mapa dos Números", subtitulo: "Multiplicação, divisão e padrões", dimensao: "Lógica" },
  { slug: "a-vida-secreta-das-plantas", titulo: "A Vida Secreta das Plantas", subtitulo: "Fotossíntese e ciclo da água", dimensao: "Naturalista" },
  { slug: "a-aventura-em-ingles", titulo: "The Big Adventure", subtitulo: "Vocabulário essencial em inglês", dimensao: "Artística" },
  { slug: "os-descobrimentos", titulo: "Os Descobrimentos", subtitulo: "Caravelas e navegadores portugueses", dimensao: "Social" },
  { slug: "as-emocoes-sao-dados", titulo: "As Emoções são Dados", subtitulo: "Sentir é informação", dimensao: "Identitária" },
  { slug: "errar-e-parte-do-mapa", titulo: "Errar é Parte do Mapa", subtitulo: "O erro como método", dimensao: "Identitária" },
  { slug: "o-planeta-e-a-nossa-casa", titulo: "O Planeta é a Nossa Casa", subtitulo: "Ecologia e responsabilidade", dimensao: "Naturalista" },
  { slug: "cerebro-desafios", titulo: "O Cérebro e os Desafios", subtitulo: "Crescimento e resiliência", dimensao: "Identitária" },
];

export function getLicaoBySlug(slug: string): LicaoMeta | undefined {
  return LICOES_META.find((l) => l.slug === slug);
}
