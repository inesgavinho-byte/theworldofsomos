export type { Competencia } from "./pt/competencias-pt";
export { competenciasPT } from "./pt/competencias-pt";
export { competenciasBNCC } from "./bncc/competencias-bncc";
export { competenciasCambridge } from "./cambridge/competencias-cambridge";
export { competenciasIB } from "./ib/competencias-ib";
export { competenciasFR } from "./fr/competencias-fr";

import { competenciasPT } from "./pt/competencias-pt";
import { competenciasBNCC } from "./bncc/competencias-bncc";
import { competenciasCambridge } from "./cambridge/competencias-cambridge";
import { competenciasIB } from "./ib/competencias-ib";
import { competenciasFR } from "./fr/competencias-fr";

export type CodigoCurriculo = "PT" | "BNCC" | "Cambridge" | "IB" | "FR";

export interface CurriculoConfig {
  codigo: CodigoCurriculo;
  nome: string;
  idioma: string;
  idioma_codigo: string;
  anos_escolares: string[];
  anos_display: string[];
  bandeira: string;
}

export const CURRICULOS_CONFIG: Record<CodigoCurriculo, CurriculoConfig> = {
  PT: {
    codigo: "PT",
    nome: "Currículo Nacional Português",
    idioma: "Português",
    idioma_codigo: "pt-PT",
    anos_escolares: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    anos_display: ["1.º ano", "2.º ano", "3.º ano", "4.º ano", "5.º ano", "6.º ano", "7.º ano", "8.º ano", "9.º ano"],
    bandeira: "🇵🇹",
  },
  BNCC: {
    codigo: "BNCC",
    nome: "Base Nacional Comum Curricular (Brasil)",
    idioma: "Português",
    idioma_codigo: "pt-BR",
    anos_escolares: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    anos_display: ["1.º ano", "2.º ano", "3.º ano", "4.º ano", "5.º ano", "6.º ano", "7.º ano", "8.º ano", "9.º ano"],
    bandeira: "🇧🇷",
  },
  Cambridge: {
    codigo: "Cambridge",
    nome: "Cambridge International",
    idioma: "English",
    idioma_codigo: "en",
    anos_escolares: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    anos_display: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8", "Year 9"],
    bandeira: "🌐",
  },
  IB: {
    codigo: "IB",
    nome: "International Baccalaureate",
    idioma: "English",
    idioma_codigo: "en",
    anos_escolares: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    anos_display: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"],
    bandeira: "🌐",
  },
  FR: {
    codigo: "FR",
    nome: "Éducation Nationale Française",
    idioma: "Français",
    idioma_codigo: "fr",
    anos_escolares: ["CP", "CE1", "CE2", "CM1", "CM2", "6", "5", "4", "3"],
    anos_display: ["CP", "CE1", "CE2", "CM1", "CM2", "6ème", "5ème", "4ème", "3ème"],
    bandeira: "🇫🇷",
  },
};

export function getCompetenciasByCurriculo(codigo: CodigoCurriculo) {
  switch (codigo) {
    case "PT": return competenciasPT;
    case "BNCC": return competenciasBNCC;
    case "Cambridge": return competenciasCambridge;
    case "IB": return competenciasIB;
    case "FR": return competenciasFR;
  }
}

export function getCurriculoConfig(codigo: string): CurriculoConfig | undefined {
  return CURRICULOS_CONFIG[codigo as CodigoCurriculo];
}

/**
 * Formata o ano escolar para display, usando a config do currículo.
 * Ex: getCurriculo("PT") + ano "3" → "3.º ano"
 *     getCurriculo("Cambridge") + ano "3" → "Year 3"
 */
export function formatAnoEscolar(curriculo: string, anoEscolar: string): string {
  const config = getCurriculoConfig(curriculo);
  if (!config) return anoEscolar;
  const idx = config.anos_escolares.indexOf(anoEscolar);
  return idx >= 0 ? config.anos_display[idx] : anoEscolar;
}

/**
 * Builds the system prompt snippet for AI exercise generation.
 */
export function buildCurriculoSystemPrompt(crianca: {
  curriculo: string;
  ano_escolar: string;
}): string {
  const config = getCurriculoConfig(crianca.curriculo);
  if (!config) return "";
  const anoDisplay = formatAnoEscolar(crianca.curriculo, crianca.ano_escolar);
  return `Currículo: ${config.nome}
Ano escolar: ${anoDisplay}
Idioma: ${config.idioma_codigo}

Todos os exercícios devem ser gerados em ${config.idioma}.
O vocabulário deve ser apropriado para ${anoDisplay} do ${config.nome}.`;
}
