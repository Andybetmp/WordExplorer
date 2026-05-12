'use client';

/**
 * @file CountriesClient.tsx
 * @description Componente principal de interactividad del listado de países.
 *
 * RESPONSABILIDADES:
 * 1. Búsqueda en tiempo real por nombre o capital del país.
 * 2. Filtrado por región geográfica.
 * 3. Apertura del modal de detalle al hacer clic en una tarjeta.
 *
 * ESTADO:
 * - search: texto ingresado por el usuario en el input de búsqueda.
 * - region: región seleccionada como filtro activo ('', 'Africa', 'Asia', etc.).
 * - selectedCountry: país actualmente seleccionado para mostrar en el modal.
 *
 * FLUJO DE DATOS:
 * Los países se reciben como prop (initialCountries) desde el Server Component.
 * No se realizan peticiones adicionales a la API en el cliente — todos los datos
 * necesarios (incluyendo monedas e idiomas) ya vienen incluidos en la prop inicial.
 * Esto garantiza que el modal abre INSTANTÁNEAMENTE sin latencia de red.
 */

import { useState, useMemo, useCallback } from 'react';
import { Country } from '@/types/country';
import { REGIONS } from '@/lib/api';
import CountryCard from './CountryCard';
import CountryModal from './CountryModal';

interface CountriesClientProps {
  /** Lista completa de países pre-cargada desde el servidor */
  initialCountries: Country[];
}

export default function CountriesClient({ initialCountries }: CountriesClientProps) {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  /**
   * useMemo: recalcula la lista filtrada SOLO cuando cambia search, region o initialCountries.
   * Evita filtrar los 250 países en cada re-render causado por otros cambios de estado.
   *
   * Lógica de filtrado:
   * 1. Filtra por región si hay una seleccionada.
   * 2. Filtra por término de búsqueda contra nombre común, nombre oficial y capital.
   * Ambos filtros son acumulativos (AND lógico).
   */
  const filtered = useMemo(() => {
    let list = initialCountries;

    // Filtro por región (comparación exacta)
    if (region) list = list.filter(c => c.region === region);

    // Filtro por búsqueda (insensible a mayúsculas, contra nombre y capital)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        c.name.common.toLowerCase().includes(q) ||
        c.name.official.toLowerCase().includes(q) ||
        (c.capital?.some(cap => cap.toLowerCase().includes(q)) ?? false)
      );
    }

    return list;
  }, [initialCountries, search, region]);

  /**
   * useCallback: memoriza la función para evitar que CountryCard re-renderice
   * innecesariamente al recibir una nueva referencia de función en cada render.
   *
   * La apertura del modal es SINCRÓNICA: no requiere fetch adicional porque
   * todos los datos del país ya están disponibles en el objeto `country`.
   */
  const openCountry = useCallback((country: Country) => {
    setSelectedCountry(country);
  }, []);

  /** Cierra el modal limpiando el estado del país seleccionado */
  const closeModal = useCallback(() => {
    setSelectedCountry(null);
  }, []);

  return (
    <>
      {/* ── Controles de búsqueda y filtro ── */}
      <div className="controls">
        <div className="search-wrapper">
          {/* Icono de lupa (SVG inline para evitar dependencias externas) */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>

          {/*
           * Input controlado: React gestiona su valor via estado (search).
           * type="search" activa el botón nativo de limpiar (×) en los navegadores.
           */}
          <input
            id="country-search"
            type="search"
            className="search-input"
            placeholder="Buscar países por nombre o capital..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar países"
          />
        </div>

        {/*
         * Botones de filtro por región.
         * role="group" agrupa semánticamente los botones relacionados (accesibilidad).
         * La clase 'active' es condicional y define el estilo del filtro activo.
         */}
        <div className="filter-group" role="group" aria-label="Filtrar por región">
          <button
            className={`filter-btn ${region === '' ? 'active' : ''}`}
            onClick={() => setRegion('')}
            id="filter-all"
          >
            🌐 Todos
          </button>
          {REGIONS.map(r => (
            <button
              key={r}
              className={`filter-btn ${region === r ? 'active' : ''}`}
              onClick={() => setRegion(r)}
              id={`filter-${r.toLowerCase()}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contador de resultados ── */}
      <div className="results-info">
        {filtered.length > 0
          ? `Mostrando ${filtered.length} ${filtered.length === 1 ? 'país' : 'países'}${region ? ` en ${region}` : ''}${search ? ` · "${search}"` : ''}`
          : 'Sin resultados'}
      </div>

      {/* ── Grid de tarjetas / Estado vacío ── */}
      {filtered.length > 0 ? (
        <div className="countries-grid">
          {filtered.map(country => (
            /*
             * key={country.cca3}: usar el código ISO 3166-1 alpha-3 como key única
             * es más estable que usar el índice del array, evitando re-renders
             * innecesarios al cambiar el orden de los resultados.
             */
            <CountryCard
              key={country.cca3}
              country={country}
              onClick={openCountry}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Sin resultados</h3>
          <p>Prueba con otro término de búsqueda o cambia el filtro de región.</p>
        </div>
      )}

      {/*
       * Modal de detalle: se monta condicionalmente solo cuando hay un país seleccionado.
       * React desmonta el componente al cerrarlo, limpiando automáticamente los
       * event listeners registrados en su useEffect interno.
       */}
      {selectedCountry && (
        <CountryModal country={selectedCountry} onClose={closeModal} />
      )}
    </>
  );
}
