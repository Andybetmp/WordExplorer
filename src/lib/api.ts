/**
 * @file api.ts
 * @description Capa de acceso a datos para la API pública de REST Countries.
 *
 * DECISIÓN DE ARQUITECTURA:
 * Se optó por una estrategia de "single fetch" – todos los campos necesarios
 * para el listado Y el detalle del país se solicitan en una única petición al
 * cargar la página. Esto elimina la necesidad de llamadas adicionales al hacer
 * clic en cada tarjeta, mejorando la experiencia de usuario y reduciendo la
 * latencia percibida.
 *
 * CACHÉ:
 * next: { revalidate: 3600 } instruye a Next.js para que reutilice la respuesta
 * cacheada durante 1 hora antes de revalidar (ISR – Incremental Static Regeneration).
 * Los datos de países cambian raramente, por lo que este TTL es apropiado.
 */

import { Country } from '@/types/country';

const BASE_URL = 'https://restcountries.com/v3.1';

/**
 * Campos solicitados al endpoint /all.
 * Solo se incluyen los campos que el endpoint soporta y que la UI consume,
 * reduciendo así el tamaño del payload de ~2 MB a ~300 KB.
 */
const ALL_FIELDS = 'fields=cca3,name,capital,region,subregion,population,flags,currencies,languages';

/**
 * Obtiene todos los países con los campos necesarios para listado y detalle.
 * Se ejecuta en el servidor (Server Component) en el momento del request.
 *
 * @returns Lista de países ordenada alfabéticamente por nombre común.
 * @throws Error con mensaje descriptivo si la API falla (manejo en page.tsx).
 */
export async function getAllCountries(): Promise<Country[]> {
  const res = await fetch(`${BASE_URL}/all?${ALL_FIELDS}`, {
    // ISR: cachea la respuesta 1 hora; después revalida en background sin bloquear al usuario
    next: { revalidate: 3600 },
  });

  // Manejo explícito de errores HTTP para mostrar mensajes descriptivos en la UI
  if (!res.ok) {
    throw new Error(`Error al cargar países: ${res.status} ${res.statusText}`);
  }

  const data: Country[] = await res.json();

  // Ordenamiento alfabético en servidor para no repetirlo en cada re-render del cliente
  return data.sort((a, b) => a.name.common.localeCompare(b.name.common));
}

/**
 * Regiones disponibles para el filtro.
 * Definidas como constante centralizada para mantener consistencia
 * entre la UI (botones de filtro) y la lógica de filtrado.
 */
export const REGIONS = ['Africa', 'Americas', 'Antarctic', 'Asia', 'Europe', 'Oceania'];
