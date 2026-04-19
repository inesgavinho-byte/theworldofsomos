export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string; // Nome em português
  flag: string; // Emoji de bandeira
  continent: string;
}

export const COUNTRIES: Country[] = [
  // EUROPA
  { code: "PT", name: "Portugal", flag: "🇵🇹", continent: "Europa" },
  { code: "ES", name: "Espanha", flag: "🇪🇸", continent: "Europa" },
  { code: "FR", name: "França", flag: "🇫🇷", continent: "Europa" },
  { code: "DE", name: "Alemanha", flag: "🇩🇪", continent: "Europa" },
  { code: "IT", name: "Itália", flag: "🇮🇹", continent: "Europa" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧", continent: "Europa" },
  { code: "NL", name: "Países Baixos", flag: "🇳🇱", continent: "Europa" },
  { code: "BE", name: "Bélgica", flag: "🇧🇪", continent: "Europa" },
  { code: "CH", name: "Suíça", flag: "🇨🇭", continent: "Europa" },
  { code: "AT", name: "Áustria", flag: "🇦🇹", continent: "Europa" },
  { code: "SE", name: "Suécia", flag: "🇸🇪", continent: "Europa" },
  { code: "NO", name: "Noruega", flag: "🇳🇴", continent: "Europa" },
  { code: "DK", name: "Dinamarca", flag: "🇩🇰", continent: "Europa" },
  { code: "FI", name: "Finlândia", flag: "🇫🇮", continent: "Europa" },
  { code: "PL", name: "Polónia", flag: "🇵🇱", continent: "Europa" },
  { code: "CZ", name: "República Checa", flag: "🇨🇿", continent: "Europa" },
  { code: "SK", name: "Eslováquia", flag: "🇸🇰", continent: "Europa" },
  { code: "HU", name: "Hungria", flag: "🇭🇺", continent: "Europa" },
  { code: "RO", name: "Roménia", flag: "🇷🇴", continent: "Europa" },
  { code: "BG", name: "Bulgária", flag: "🇧🇬", continent: "Europa" },
  { code: "HR", name: "Croácia", flag: "🇭🇷", continent: "Europa" },
  { code: "RS", name: "Sérvia", flag: "🇷🇸", continent: "Europa" },
  { code: "GR", name: "Grécia", flag: "🇬🇷", continent: "Europa" },
  { code: "TR", name: "Turquia", flag: "🇹🇷", continent: "Europa" },
  { code: "UA", name: "Ucrânia", flag: "🇺🇦", continent: "Europa" },
  { code: "RU", name: "Rússia", flag: "🇷🇺", continent: "Europa" },
  { code: "IE", name: "Irlanda", flag: "🇮🇪", continent: "Europa" },
  { code: "LU", name: "Luxemburgo", flag: "🇱🇺", continent: "Europa" },
  { code: "IS", name: "Islândia", flag: "🇮🇸", continent: "Europa" },
  { code: "LT", name: "Lituânia", flag: "🇱🇹", continent: "Europa" },
  { code: "LV", name: "Letónia", flag: "🇱🇻", continent: "Europa" },
  { code: "EE", name: "Estónia", flag: "🇪🇪", continent: "Europa" },
  { code: "SI", name: "Eslovénia", flag: "🇸🇮", continent: "Europa" },
  { code: "AL", name: "Albânia", flag: "🇦🇱", continent: "Europa" },
  { code: "MK", name: "Macedónia do Norte", flag: "🇲🇰", continent: "Europa" },
  { code: "BA", name: "Bósnia e Herzegovina", flag: "🇧🇦", continent: "Europa" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪", continent: "Europa" },

  // AMÉRICAS DO NORTE E CENTRAL
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", continent: "América do Norte" },
  { code: "CA", name: "Canadá", flag: "🇨🇦", continent: "América do Norte" },
  { code: "MX", name: "México", flag: "🇲🇽", continent: "América do Norte" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", continent: "América do Norte" },
  { code: "BZ", name: "Belize", flag: "🇧🇿", continent: "América do Norte" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", continent: "América do Norte" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", continent: "América do Norte" },
  { code: "NI", name: "Nicarágua", flag: "🇳🇮", continent: "América do Norte" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", continent: "América do Norte" },
  { code: "PA", name: "Panamá", flag: "🇵🇦", continent: "América do Norte" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", continent: "América do Norte" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴", continent: "América do Norte" },
  { code: "HT", name: "Haiti", flag: "🇭🇹", continent: "América do Norte" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", continent: "América do Norte" },
  { code: "PR", name: "Porto Rico", flag: "🇵🇷", continent: "América do Norte" },

  // AMÉRICA DO SUL
  { code: "BR", name: "Brasil", flag: "🇧🇷", continent: "América do Sul" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", continent: "América do Sul" },
  { code: "CL", name: "Chile", flag: "🇨🇱", continent: "América do Sul" },
  { code: "CO", name: "Colômbia", flag: "🇨🇴", continent: "América do Sul" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", continent: "América do Sul" },
  { code: "PE", name: "Peru", flag: "🇵🇪", continent: "América do Sul" },
  { code: "EC", name: "Equador", flag: "🇪🇨", continent: "América do Sul" },
  { code: "BO", name: "Bolívia", flag: "🇧🇴", continent: "América do Sul" },
  { code: "PY", name: "Paraguai", flag: "🇵🇾", continent: "América do Sul" },
  { code: "UY", name: "Uruguai", flag: "🇺🇾", continent: "América do Sul" },
  { code: "GY", name: "Guiana", flag: "🇬🇾", continent: "América do Sul" },
  { code: "SR", name: "Suriname", flag: "🇸🇷", continent: "América do Sul" },

  // ÁFRICA
  { code: "ZA", name: "África do Sul", flag: "🇿🇦", continent: "África" },
  { code: "NG", name: "Nigéria", flag: "🇳🇬", continent: "África" },
  { code: "EG", name: "Egito", flag: "🇪🇬", continent: "África" },
  { code: "ET", name: "Etiópia", flag: "🇪🇹", continent: "África" },
  { code: "KE", name: "Quénia", flag: "🇰🇪", continent: "África" },
  { code: "GH", name: "Gana", flag: "🇬🇭", continent: "África" },
  { code: "TZ", name: "Tanzânia", flag: "🇹🇿", continent: "África" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", continent: "África" },
  { code: "RW", name: "Ruanda", flag: "🇷🇼", continent: "África" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", continent: "África" },
  { code: "CI", name: "Costa do Marfim", flag: "🇨🇮", continent: "África" },
  { code: "CM", name: "Camarões", flag: "🇨🇲", continent: "África" },
  { code: "MA", name: "Marrocos", flag: "🇲🇦", continent: "África" },
  { code: "DZ", name: "Argélia", flag: "🇩🇿", continent: "África" },
  { code: "TN", name: "Tunísia", flag: "🇹🇳", continent: "África" },
  { code: "LY", name: "Líbia", flag: "🇱🇾", continent: "África" },
  { code: "SD", name: "Sudão", flag: "🇸🇩", continent: "África" },
  { code: "MZ", name: "Moçambique", flag: "🇲🇿", continent: "África" },
  { code: "AO", name: "Angola", flag: "🇦🇴", continent: "África" },
  { code: "ZM", name: "Zâmbia", flag: "🇿🇲", continent: "África" },
  { code: "ZW", name: "Zimbabué", flag: "🇿🇼", continent: "África" },
  { code: "MG", name: "Madagáscar", flag: "🇲🇬", continent: "África" },
  { code: "CD", name: "Congo (RDC)", flag: "🇨🇩", continent: "África" },
  { code: "CG", name: "Congo", flag: "🇨🇬", continent: "África" },
  { code: "CV", name: "Cabo Verde", flag: "🇨🇻", continent: "África" },
  { code: "ST", name: "São Tomé e Príncipe", flag: "🇸🇹", continent: "África" },
  { code: "GW", name: "Guiné-Bissau", flag: "🇬🇼", continent: "África" },
  { code: "GQ", name: "Guiné Equatorial", flag: "🇬🇶", continent: "África" },

  // MÉDIO ORIENTE
  { code: "SA", name: "Arábia Saudita", flag: "🇸🇦", continent: "Médio Oriente" },
  { code: "AE", name: "Emirados Árabes Unidos", flag: "🇦🇪", continent: "Médio Oriente" },
  { code: "IL", name: "Israel", flag: "🇮🇱", continent: "Médio Oriente" },
  { code: "JO", name: "Jordânia", flag: "🇯🇴", continent: "Médio Oriente" },
  { code: "LB", name: "Líbano", flag: "🇱🇧", continent: "Médio Oriente" },
  { code: "SY", name: "Síria", flag: "🇸🇾", continent: "Médio Oriente" },
  { code: "IQ", name: "Iraque", flag: "🇮🇶", continent: "Médio Oriente" },
  { code: "IR", name: "Irão", flag: "🇮🇷", continent: "Médio Oriente" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", continent: "Médio Oriente" },
  { code: "QA", name: "Catar", flag: "🇶🇦", continent: "Médio Oriente" },
  { code: "BH", name: "Barém", flag: "🇧🇭", continent: "Médio Oriente" },
  { code: "OM", name: "Omã", flag: "🇴🇲", continent: "Médio Oriente" },
  { code: "YE", name: "Iémen", flag: "🇾🇪", continent: "Médio Oriente" },
  { code: "PS", name: "Palestina", flag: "🇵🇸", continent: "Médio Oriente" },

  // ÁSIA
  { code: "CN", name: "China", flag: "🇨🇳", continent: "Ásia" },
  { code: "JP", name: "Japão", flag: "🇯🇵", continent: "Ásia" },
  { code: "KR", name: "Coreia do Sul", flag: "🇰🇷", continent: "Ásia" },
  { code: "KP", name: "Coreia do Norte", flag: "🇰🇵", continent: "Ásia" },
  { code: "IN", name: "Índia", flag: "🇮🇳", continent: "Ásia" },
  { code: "ID", name: "Indonésia", flag: "🇮🇩", continent: "Ásia" },
  { code: "PK", name: "Paquistão", flag: "🇵🇰", continent: "Ásia" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", continent: "Ásia" },
  { code: "PH", name: "Filipinas", flag: "🇵🇭", continent: "Ásia" },
  { code: "VN", name: "Vietname", flag: "🇻🇳", continent: "Ásia" },
  { code: "TH", name: "Tailândia", flag: "🇹🇭", continent: "Ásia" },
  { code: "MY", name: "Malásia", flag: "🇲🇾", continent: "Ásia" },
  { code: "SG", name: "Singapura", flag: "🇸🇬", continent: "Ásia" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", continent: "Ásia" },
  { code: "KH", name: "Camboja", flag: "🇰🇭", continent: "Ásia" },
  { code: "LA", name: "Laos", flag: "🇱🇦", continent: "Ásia" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", continent: "Ásia" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", continent: "Ásia" },
  { code: "MN", name: "Mongólia", flag: "🇲🇳", continent: "Ásia" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", continent: "Ásia" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", continent: "Ásia" },
  { code: "AF", name: "Afeganistão", flag: "🇦🇫", continent: "Ásia" },
  { code: "KZ", name: "Cazaquistão", flag: "🇰🇿", continent: "Ásia" },
  { code: "UZ", name: "Uzbequistão", flag: "🇺🇿", continent: "Ásia" },
  { code: "GE", name: "Geórgia", flag: "🇬🇪", continent: "Ásia" },
  { code: "AM", name: "Arménia", flag: "🇦🇲", continent: "Ásia" },
  { code: "AZ", name: "Azerbaijão", flag: "🇦🇿", continent: "Ásia" },

  // OCEANIA
  { code: "AU", name: "Austrália", flag: "🇦🇺", continent: "Oceânia" },
  { code: "NZ", name: "Nova Zelândia", flag: "🇳🇿", continent: "Oceânia" },
  { code: "FJ", name: "Fiji", flag: "🇫🇯", continent: "Oceânia" },
  { code: "PG", name: "Papua Nova Guiné", flag: "🇵🇬", continent: "Oceânia" },
  { code: "WS", name: "Samoa", flag: "🇼🇸", continent: "Oceânia" },
  { code: "TO", name: "Tonga", flag: "🇹🇴", continent: "Oceânia" },
  { code: "VU", name: "Vanuatu", flag: "🇻🇺", continent: "Oceânia" },
];

// Países ordenados por nome para o dropdown
export const COUNTRIES_SORTED = [...COUNTRIES].sort((a, b) =>
  a.name.localeCompare(b.name, "pt")
);

// Agrupa por continente para o mapa
export const COUNTRIES_BY_CONTINENT = COUNTRIES.reduce(
  (acc, country) => {
    if (!acc[country.continent]) acc[country.continent] = [];
    acc[country.continent].push(country);
    return acc;
  },
  {} as Record<string, Country[]>
);

export const CONTINENT_ORDER = [
  "Europa",
  "América do Norte",
  "América do Sul",
  "África",
  "Médio Oriente",
  "Ásia",
  "Oceânia",
];

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
