// lib/tom.ts
// Sistema de Tom — SOMOS
// O tom não é estilo. É comportamento.

// ============================================================
// REGRAS DURAS — aplicar em toda a plataforma
// ============================================================

export const TOM_REGRAS = {
  proibido: [
    'problema',       // nunca usar — substituir por "desafio", "situação", "momento"
    'erro',           // em contexto emocional — substituir por "ainda não"
    'falhou',         // para crianças — substituir por "tentou"
    'errado',         // para crianças — substituir por "diferente"
    'mau',            // nunca avaliar carácter
    'preguiçoso',
    'difícil',        // para crianças — substituir por "que pede mais de ti"
  ],
  sempre: [
    'clareza',
    'calma',
    'precisão emocional',
    'linguagem neutra de família',  // nunca "pai" como genérico
    'honestidade sem brutalidade',
  ],
  nuncaEmojisNativos: true,
  semJulgamento: true,
  semAlarmismo: true,
  semMoralismo: true,
} as const;

// ============================================================
// NÍVEIS DE COMUNICAÇÃO
// ============================================================

// SISTEMA — neutro e preciso
// Erros técnicos, confirmações, estados
export const sistema = {
  erroGenerico: 'Não conseguimos concluir esta acção agora. Tenta novamente.',
  erroConexao: 'Sem ligação. Verifica a tua internet.',
  erroPermissao: 'Não tens acesso a esta área.',
  carregando: 'A carregar...',
  guardado: 'Guardado.',
  confirmacao: (accao: string) => `${accao} concluído.`,
} as const;

// ACOMPANHAMENTO — calmo, humano
// Feedback ao adulto, orientação, suporte
export const acompanhamento = {
  semDados: 'Ainda não há dados suficientes para mostrar aqui.',
  semLicoes: 'Ainda não há lições disponíveis para este currículo.',
  primeiroLogin: 'Bem-vinda. Vamos começar por conhecer melhor a tua família.',
  desafioFamilia: 'Pode ser um bom momento para fazerem isto juntos.',
  progressoAdulto: (nome: string) => `${nome} está a construir o seu caminho.`,
} as const;

// CRIANÇA — verdadeiro, nunca condescendente
// Directo, claro, emocionalmente honesto
export const crianca = {
  acerto: [
    'Muito bem.',
    'Conseguiste.',
    'Certo.',
    'Exacto.',
  ],
  erro: [
    'Ainda não. Tenta outra vez.',
    'Quase. Continua.',
    'Não desta vez. Segue em frente.',
  ],
  encorajamento: [
    'Nem sempre é fácil. Mas estás a aprender.',
    'Cada tentativa conta.',
    'Estás a descobrir.',
  ],
  reflexao: 'O que ficou contigo desta lição?',
  voltarAoMundo: 'Voltar ao meu mundo →',
} as const;

// EDITORIAL — mais elevado
// O Momento, conteúdos narrativos, Jarro de Pandora
export const editorial = {
  momento: 'Um Momento da História',
  jarro: 'O Jarro de Pandora abriu.',
  heranca: 'A tua herança está aqui.',
  fraseFinal: 'Fizeste algo hoje que ontem ainda não sabias.',
} as const;

// ============================================================
// HELPERS
// ============================================================

/**
 * Formatar mensagem de erro para o utilizador.
 * Nunca mostrar erros técnicos em bruto.
 */
export function formatErrorMessage(err: unknown, contexto: 'sistema' | 'crianca' | 'adulto' = 'sistema'): string {
  if (contexto === 'crianca') {
    return 'Algo não correu bem. Tenta novamente.';
  }
  if (contexto === 'adulto') {
    return 'Não conseguimos completar esta acção. Se continuar, contacta-nos.';
  }
  return sistema.erroGenerico;
}

/**
 * Seleccionar frase aleatória de uma lista.
 */
export function frasAleatoria(lista: readonly string[]): string {
  return lista[Math.floor(Math.random() * lista.length)];
}

/**
 * Feedback de resposta para criança.
 */
export function feedbackCrianca(correcto: boolean): string {
  if (correcto) return frasAleatoria(crianca.acerto);
  return frasAleatoria(crianca.erro);
}

/**
 * Encorajamento aleatório para criança.
 */
export function encorajamentoCrianca(): string {
  return frasAleatoria(crianca.encorajamento);
}

/**
 * Substituir palavras proibidas num texto (para validar conteúdo gerado por IA).
 */
export function validarTom(texto: string): { valido: boolean; avisos: string[] } {
  const avisos: string[] = [];
  TOM_REGRAS.proibido.forEach(palavra => {
    if (texto.toLowerCase().includes(palavra)) {
      avisos.push(`Palavra proibida encontrada: "${palavra}"`);
    }
  });
  return { valido: avisos.length === 0, avisos };
}
