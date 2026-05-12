'use client';

/**
 * @file CountryModal.tsx
 * @description Modal de detalle del país seleccionado.
 *
 * FUNCIONALIDADES:
 * - Muestra bandera en alta resolución (SVG preferido sobre PNG).
 * - Presenta información de: región, subregión, población, capital, monedas e idiomas.
 * - Cierre por: botón X, clic fuera del modal, o tecla Escape.
 * - Bloquea el scroll del body mientras está abierto.
 *
 * ACCESIBILIDAD:
 * - role="dialog" + aria-modal="true": anuncia correctamente a lectores de pantalla.
 * - aria-label: describe el contenido del diálogo.
 * - Listener de teclado para Escape registrado con addEventListener (no onKeyDown)
 *   para capturar el evento en cualquier punto del DOM, no solo dentro del modal.
 *
 * GESTIÓN DE EFECTOS:
 * useEffect registra el listener de Escape y bloquea el scroll al montarse.
 * La función de cleanup los elimina al desmontarse, evitando memory leaks.
 */

import { useEffect, useCallback } from 'react';
import { Country } from '@/types/country';

interface CountryModalProps {
  /** País cuyos detalles se muestran — datos ya disponibles, sin fetch adicional */
  country: Country;
  /** Callback para cerrar el modal y limpiar el estado en el componente padre */
  onClose: () => void;
}

/**
 * Formatea la población con separadores de miles según la configuración regional.
 * Ejemplo: 53100000 → "53.100.000" (es-CO)
 */
function formatPopulation(pop: number): string {
  return new Intl.NumberFormat('es-CO').format(pop);
}

export default function CountryModal({ country, onClose }: CountryModalProps) {

  /**
   * useCallback garantiza que handleKey tenga la misma referencia entre renders,
   * evitando que el useEffect re-registre el listener innecesariamente.
   */
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    // Registra el listener globalmente para capturar Escape desde cualquier elemento
    document.addEventListener('keydown', handleKey);

    // Deshabilita el scroll del body mientras el modal está abierto (UX estándar)
    document.body.style.overflow = 'hidden';

    // Cleanup: se ejecuta cuando el componente se desmonta (modal cerrado)
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = ''; // Restaura el scroll
    };
  }, [handleKey]);

  // Extrae monedas e idiomas del formato de objeto de la API a arrays planos
  const currencyList = country.currencies
    ? Object.values(country.currencies)
    : [];

  const languages = country.languages
    ? Object.values(country.languages)
    : [];

  const capital = country.capital?.[0] ?? 'N/A';

  return (
    /*
     * CIERRE AL HACER CLIC EN EL BACKDROP:
     * La condición e.target === e.currentTarget asegura que solo se cierra
     * cuando el clic es directamente sobre el backdrop (fondo oscuro),
     * NO cuando se hace clic dentro del contenido del modal (event bubbling).
     */
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de ${country.name.common}`}
    >
      <div className="modal">

        {/* ── Header con bandera a pantalla completa ── */}
        <div className="modal-header">
          <div className="modal-flag">
            {/*
             * Preferencia de SVG sobre PNG: el SVG es vectorial y se ve perfecto
             * en cualquier resolución de pantalla (Retina, 4K, etc.).
             * Fallback a PNG si el SVG no está disponible.
             */}
            <img
              src={country.flags.svg || country.flags.png}
              alt={country.flags.alt ?? `Bandera de ${country.name.common}`}
            />
          </div>
          <div className="modal-flag-overlay" />

          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">✕</button>

          {/* Nombre superpuesto sobre la bandera para efecto visual premium */}
          <h2 className="modal-country-name">{country.name.common}</h2>
          <p className="modal-country-official">{country.name.official}</p>
        </div>

        <div className="modal-body">

          {/* ── Badges de clasificación geográfica ── */}
          <div className="modal-region-row">
            <span className="badge badge-region">🌍 {country.region}</span>
            {/* Subregión condicional: no todos los países tienen subregión */}
            {country.subregion && (
              <span className="badge badge-subregion">{country.subregion}</span>
            )}
          </div>

          {/* ── Stats numéricas destacadas ── */}
          <div className="modal-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-label">Población</div>
              {/* Intl.NumberFormat para formato localizado de números grandes */}
              <div className="stat-value">{formatPopulation(country.population)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏙️</div>
              <div className="stat-label">Capital</div>
              <div className="stat-value small">{capital}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-label">Moneda(s)</div>
              <div className="stat-value small">
                {currencyList.length > 0 ? currencyList[0].name : 'N/A'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🗣️</div>
              <div className="stat-label">Idioma(s)</div>
              <div className="stat-value small">
                {languages.length > 0 ? languages[0] : 'N/A'}
              </div>
            </div>
          </div>

          {/* ── Detalle completo de monedas e idiomas ── */}
          <div className="modal-detail-grid">

            {/* La API devuelve currencies como Record<código, {name, symbol}> */}
            <div className="detail-section">
              <h4>💰 Moneda(s)</h4>
              <div className="detail-chips">
                {currencyList.length > 0
                  ? currencyList.map((cur, i) => (
                    <span key={i} className="detail-chip">
                      {cur.name} <strong>{cur.symbol}</strong>
                    </span>
                  ))
                  : <span className="detail-chip">N/A</span>
                }
              </div>
            </div>

            {/* La API devuelve languages como Record<código, nombre> */}
            <div className="detail-section">
              <h4>🗣️ Idioma(s)</h4>
              <div className="detail-chips">
                {languages.length > 0
                  ? languages.map((lang, i) => (
                    <span key={i} className="detail-chip">{lang}</span>
                  ))
                  : <span className="detail-chip">N/A</span>
                }
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-maps" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
