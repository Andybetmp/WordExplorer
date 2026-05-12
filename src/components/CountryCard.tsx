'use client';

/**
 * @file CountryCard.tsx
 * @description Tarjeta individual de país en el grid de listado.
 *
 * ACCESIBILIDAD:
 * Se usa un elemento <button> nativo en lugar de <div onClick> o <article onClick>.
 * Los botones nativos son automáticamente focusables con Tab, activables con Enter/Space,
 * y son anunciados correctamente por lectores de pantalla, sin necesidad de
 * atributos adicionales como role="button" o tabIndex.
 *
 * RENDIMIENTO:
 * - loading="lazy": las imágenes fuera del viewport no se descargan hasta que
 *   el usuario hace scroll hacia ellas, reduciendo el tiempo de carga inicial.
 * - width/height declarados: evitan el Layout Shift (CLS) al reservar el espacio
 *   antes de que la imagen se descargue.
 * - La función formatPopulation se define fuera del componente para que no se
 *   recree en cada render.
 */

import { Country } from '@/types/country';

interface CountryCardProps {
  /** Datos completos del país (incluyendo monedas e idiomas para el modal) */
  country: Country;
  /** Callback ejecutado al hacer clic — recibe el país completo para el modal */
  onClick: (country: Country) => void;
}

/**
 * Formatea la población en notación abreviada legible.
 * Ejemplos: 53.100.000 → "53.1M" | 800.000 → "800K" | 1.400.000.000 → "1.4B"
 *
 * Definida fuera del componente para evitar recreación en cada render.
 */
function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return (pop / 1_000_000_000).toFixed(1) + 'B';
  if (pop >= 1_000_000) return (pop / 1_000_000).toFixed(1) + 'M';
  if (pop >= 1_000) return (pop / 1_000).toFixed(0) + 'K';
  return pop.toString();
}

export default function CountryCard({ country, onClick }: CountryCardProps) {
  // Usa el operador de coalescencia nula para manejar países sin capital declarada
  const capital = country.capital?.[0] ?? 'N/A';

  return (
    /*
     * <button type="button"> en lugar de <div>:
     * - Accesible por teclado sin configuración adicional.
     * - Semánticamente correcto para un elemento interactivo.
     * - data-cca3: permite identificar el país desde DevTools o tests E2E.
     */
    <button
      className="country-card"
      type="button"
      onClick={() => onClick(country)}
      aria-label={`Ver detalles de ${country.name.common}`}
      data-cca3={country.cca3}
    >
      <div className="card-flag">
        {/*
         * Imagen de bandera con lazy loading.
         * alt descriptivo usando country.flags.alt (provisto por la API)
         * o fallback generado dinámicamente.
         */}
        <img
          src={country.flags.png}
          alt={country.flags.alt ?? `Bandera de ${country.name.common}`}
          loading="lazy"
          width={320}
          height={180}
        />
        {/* Overlay de gradiente para mejorar legibilidad del badge de región */}
        <div className="card-flag-overlay" />
        <span className="card-region-badge">{country.region}</span>
      </div>

      <div className="card-body">
        {/* h2 semántico para jerarquía correcta dentro de la sección de resultados */}
        <h2 className="card-name">{country.name.common}</h2>
        <div className="card-info">
          <div className="card-info-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Capital: <strong style={{ color: 'var(--text-primary)' }}>{capital}</strong></span>
          </div>
          <div className="card-info-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Población: <strong style={{ color: 'var(--text-primary)' }}>{formatPopulation(country.population)}</strong></span>
          </div>
        </div>
      </div>
    </button>
  );
}
