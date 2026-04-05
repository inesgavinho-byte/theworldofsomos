// lib/email-templates.ts
// Sistema de Tom — SOMOS
// Usar em todos os templates de email enviados via Resend.

export const EMAIL_TOM = {
  saudacao: (nome: string) => `Olá, ${nome}.`,  // nunca "Caro pai/mãe"
  despedida: 'SOMOS',                            // nunca "Atenciosamente" ou "Cumprimentos"
  assuntoPrefix: 'SOMOS —',                      // prefixo consistente no assunto
} as const;

// Exemplos de assuntos correctos:
// "SOMOS — A Valentina completou uma lição"
// "SOMOS — A tua candidatura à Guilda"
// "SOMOS — Uma carta está à tua espera"
