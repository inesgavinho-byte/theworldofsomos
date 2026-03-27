export interface Competencia {
  id?: string;
  dimensao: string;
  area: string;
  nivel: number;
  descricao: string;
  curriculo: string;
  idioma: string;
  ano_escolar: string;
}

export const competenciasPT: Competencia[] = [
  // ─── Dimensão Naturalista — 3.º ano ───────────────────────────────────────
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 1, descricao: "Identifica seres vivos e não vivos no ambiente", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 1, descricao: "Descreve características de animais e plantas", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 1, descricao: "Reconhece a importância da água para os seres vivos", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 2, descricao: "Explica as fases do ciclo da água", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 2, descricao: "Classifica animais segundo a alimentação", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },

  // ─── Dimensão Naturalista — 4.º ano ───────────────────────────────────────
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 1, descricao: "Identifica os diferentes ecossistemas portugueses", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 2, descricao: "Descreve cadeias alimentares simples", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 2, descricao: "Explica a importância da biodiversidade", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 3, descricao: "Relaciona a ação humana com impactos no ambiente", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },

  // ─── Dimensão Naturalista — 5.º ano ───────────────────────────────────────
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 1, descricao: "Classifica os seres vivos em reinos", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 2, descricao: "Descreve a célula como unidade básica da vida", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 2, descricao: "Distingue seres unicelulares de pluricelulares", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "naturalista", area: "Ciências Naturais", nivel: 3, descricao: "Explica o processo de fotossíntese de forma simplificada", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },

  // ─── Dimensão Lógica — 3.º ano ────────────────────────────────────────────
  { dimensao: "logica", area: "Matemática", nivel: 1, descricao: "Lê e escreve números até 1000", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "logica", area: "Matemática", nivel: 1, descricao: "Realiza adições e subtrações com números até 1000", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "logica", area: "Matemática", nivel: 2, descricao: "Multiplica números de um algarismo", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "logica", area: "Matemática", nivel: 2, descricao: "Resolve problemas com as quatro operações", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "logica", area: "Matemática", nivel: 3, descricao: "Identifica e desenha figuras geométricas planas", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },

  // ─── Dimensão Lógica — 4.º ano ────────────────────────────────────────────
  { dimensao: "logica", area: "Matemática", nivel: 1, descricao: "Lê e escreve números até 1 000 000", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "logica", area: "Matemática", nivel: 2, descricao: "Multiplica e divide números inteiros", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "logica", area: "Matemática", nivel: 2, descricao: "Trabalha com frações simples", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "logica", area: "Matemática", nivel: 3, descricao: "Calcula perímetros e áreas de figuras simples", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "logica", area: "Matemática", nivel: 3, descricao: "Lê e interpreta gráficos de barras e pictogramas", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },

  // ─── Dimensão Lógica — 5.º ano ────────────────────────────────────────────
  { dimensao: "logica", area: "Matemática", nivel: 1, descricao: "Opera com números racionais não negativos", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "logica", area: "Matemática", nivel: 2, descricao: "Calcula mínimos múltiplos e máximos divisores comuns", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "logica", area: "Matemática", nivel: 2, descricao: "Resolve problemas com percentagens", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "logica", area: "Matemática", nivel: 3, descricao: "Trabalha com ângulos e propriedades de triângulos", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },

  // ─── Dimensão Identitária — 3.º ano ───────────────────────────────────────
  { dimensao: "identitaria", area: "Estudo do Meio", nivel: 1, descricao: "Reconhece a sua identidade pessoal e familiar", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "identitaria", area: "Estudo do Meio", nivel: 1, descricao: "Descreve a sua localidade e os seus costumes", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "identitaria", area: "Estudo do Meio", nivel: 2, descricao: "Distingue passado e presente na história local", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "identitaria", area: "Estudo do Meio", nivel: 2, descricao: "Reconhece símbolos nacionais: bandeira, hino, armas", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },

  // ─── Dimensão Identitária — 4.º ano ───────────────────────────────────────
  { dimensao: "identitaria", area: "História e Geografia de Portugal", nivel: 1, descricao: "Identifica as principais regiões de Portugal", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "identitaria", area: "História e Geografia de Portugal", nivel: 2, descricao: "Descreve momentos importantes da história de Portugal", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "identitaria", area: "História e Geografia de Portugal", nivel: 2, descricao: "Reconhece a diversidade cultural do país", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "identitaria", area: "História e Geografia de Portugal", nivel: 3, descricao: "Relaciona a localização geográfica de Portugal com a sua história", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },

  // ─── Dimensão Identitária — 5.º ano ───────────────────────────────────────
  { dimensao: "identitaria", area: "História e Geografia de Portugal", nivel: 1, descricao: "Descreve a formação de Portugal como nação", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "identitaria", area: "História e Geografia de Portugal", nivel: 2, descricao: "Explica o papel dos mouros e cristãos na Península Ibérica", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "identitaria", area: "História e Geografia de Portugal", nivel: 3, descricao: "Analisa as motivações das Descobertas Portuguesas", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },

  // ─── Dimensão Social — 3.º ano ────────────────────────────────────────────
  { dimensao: "social", area: "Cidadania e Desenvolvimento", nivel: 1, descricao: "Reconhece a importância das regras em grupo", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "social", area: "Cidadania e Desenvolvimento", nivel: 1, descricao: "Identifica direitos e deveres dos alunos", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "social", area: "Cidadania e Desenvolvimento", nivel: 2, descricao: "Pratica a resolução pacífica de conflitos", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },

  // ─── Dimensão Social — 4.º ano ────────────────────────────────────────────
  { dimensao: "social", area: "Cidadania e Desenvolvimento", nivel: 1, descricao: "Descreve o funcionamento de instituições democráticas simples", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "social", area: "Cidadania e Desenvolvimento", nivel: 2, descricao: "Relaciona o consumo com o impacto ambiental", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "social", area: "Cidadania e Desenvolvimento", nivel: 2, descricao: "Valoriza a diversidade cultural e o respeito pelo outro", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },

  // ─── Dimensão Social — 5.º ano ────────────────────────────────────────────
  { dimensao: "social", area: "Cidadania e Desenvolvimento", nivel: 2, descricao: "Compreende o conceito de democracia e participação cívica", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "social", area: "Cidadania e Desenvolvimento", nivel: 3, descricao: "Analisa situações de desigualdade e propõe soluções", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },

  // ─── Dimensão Artística — 3.º ano ─────────────────────────────────────────
  { dimensao: "artistica", area: "Expressões Artísticas", nivel: 1, descricao: "Experimenta técnicas de desenho e pintura", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "artistica", area: "Expressões Artísticas", nivel: 1, descricao: "Participa em jogos de expressão dramática", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "artistica", area: "Expressões Artísticas", nivel: 2, descricao: "Cria composições plásticas com materiais variados", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },

  // ─── Dimensão Artística — 4.º ano ─────────────────────────────────────────
  { dimensao: "artistica", area: "Expressões Artísticas", nivel: 2, descricao: "Interpreta e comenta obras de arte simples", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "artistica", area: "Expressões Artísticas", nivel: 2, descricao: "Canta e toca ritmos simples em instrumentos de percussão", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "artistica", area: "Expressões Artísticas", nivel: 3, descricao: "Cria narrativas visuais com sequência lógica", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },

  // ─── Dimensão Artística — 5.º ano ─────────────────────────────────────────
  { dimensao: "artistica", area: "Expressões Artísticas", nivel: 2, descricao: "Identifica movimentos artísticos e autores portugueses", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "artistica", area: "Expressões Artísticas", nivel: 3, descricao: "Desenvolve projeto artístico autónomo com intencionalidade", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },

  // ─── Língua Portuguesa — 3.º ano ──────────────────────────────────────────
  { dimensao: "identitaria", area: "Português", nivel: 1, descricao: "Lê textos com fluência e expressividade", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "identitaria", area: "Português", nivel: 1, descricao: "Escreve textos curtos com coerência e coesão", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "identitaria", area: "Português", nivel: 2, descricao: "Identifica classes de palavras: nome, verbo, adjetivo", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },
  { dimensao: "identitaria", area: "Português", nivel: 2, descricao: "Compreende textos narrativos e descritivos", curriculo: "PT", idioma: "pt-PT", ano_escolar: "3" },

  // ─── Língua Portuguesa — 4.º ano ──────────────────────────────────────────
  { dimensao: "identitaria", area: "Português", nivel: 1, descricao: "Lê obras de literatura infantil portuguesa", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "identitaria", area: "Português", nivel: 2, descricao: "Escreve textos de diferentes tipologias (narrativo, descritivo, instrucional)", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "identitaria", area: "Português", nivel: 2, descricao: "Usa pontuação de forma adequada", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },
  { dimensao: "identitaria", area: "Português", nivel: 3, descricao: "Amplia o vocabulário por derivação e composição", curriculo: "PT", idioma: "pt-PT", ano_escolar: "4" },

  // ─── Língua Portuguesa — 5.º ano ──────────────────────────────────────────
  { dimensao: "identitaria", area: "Português", nivel: 2, descricao: "Analisa a estrutura de textos poéticos e narrativos", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "identitaria", area: "Português", nivel: 2, descricao: "Distingue narrador, personagens e ação em textos literários", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
  { dimensao: "identitaria", area: "Português", nivel: 3, descricao: "Produz texto de opinião com argumentos fundamentados", curriculo: "PT", idioma: "pt-PT", ano_escolar: "5" },
];
