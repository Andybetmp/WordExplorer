export interface CountryName {
  common: string;
  official: string;
  nativeName?: Record<string, { official: string; common: string }>;
}

export interface Currency {
  name: string;
  symbol: string;
}

// Tipo unificado con los campos disponibles en el endpoint /all
export interface Country {
  cca3: string;
  name: CountryName;
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  currencies?: Record<string, Currency>;
  languages?: Record<string, string>;
}
