/**
 * @file page.tsx
 * @description Página principal de WorldExplorer – Server Component de Next.js.
 *
 * PATRÓN SERVER / CLIENT:
 * Este componente es un async Server Component (sin directiva 'use client').
 * Ejecuta el fetch a la API de países en el SERVIDOR antes de enviar HTML al cliente,
 * aprovechando:
 *   - Mejor rendimiento: el navegador recibe datos ya incluidos en el HTML inicial.
 *   - SEO: el contenido es visible para los crawlers sin necesidad de JS.
 *   - Seguridad: las claves de API (si las hubiera) nunca se exponen al cliente.
 *
 * MANEJO DE ERRORES:
 * El bloque try/catch captura cualquier fallo de red o de la API y muestra
 * un mensaje amigable al usuario con opción de reintentar, en lugar de
 * dejar la página vacía o mostrar un error técnico.
 */

import { getAllCountries } from '@/lib/api';
import { Country } from '@/types/country';
import CountriesWrapper from '@/components/CountriesWrapper';

/**
 * Directiva de Next.js que deshabilita el caché estático de la ruta.
 * Garantiza que los datos se obtienen frescos en cada request al servidor.
 * Complementa el caché de fetch definido en api.ts con revalidate: 3600.
 */
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let countries: Country[] = [];
  let error = '';

  try {
    // Fetch ejecutado en el servidor — los datos llegan al cliente ya listos
    countries = await getAllCountries();
  } catch (e: unknown) {
    // Captura errores de red y de la API con mensaje legible para el usuario
    error = e instanceof Error ? e.message : 'Error desconocido al cargar los países.';
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Barra de navegación con contador dinámico de países cargados */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="globe-icon">🌍</div>
          <span>WorldExplorer</span>
        </div>
        {/* Solo se muestra el contador si la API respondió correctamente */}
        {!error && (
          <div className="navbar-stat">
            {countries.length} países disponibles
          </div>
        )}
      </nav>

      {/* Sección hero con título principal (h1 único por página para SEO) */}
      <header className="hero">
        <h1>Explora el Mundo</h1>
        <p>Busca, filtra y descubre información detallada sobre todos los países del planeta.</p>
      </header>

      {/*
       * Renderizado condicional:
       * - Si la API falló → muestra mensaje de error con opción de reintentar.
       * - Si la API respondió → pasa los datos al componente interactivo del cliente.
       */}
      {error ? (
        <div style={{ padding: '0 2rem' }}>
          <div className="error-box" style={{ margin: '2rem auto' }}>
            <div className="error-icon">🌐</div>
            <h2>No se pudo cargar los datos</h2>
            <p>{error}</p>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.8rem' }}>
              Verifica tu conexión a internet e intenta recargar la página.
            </p>
            {/* Enlace <a> en lugar de <button onClick> para evitar errores de hidratación */}
            <a href="/" className="btn-retry" style={{ display: 'inline-block' }}>
              Reintentar
            </a>
          </div>
        </div>
      ) : (
        /*
         * CountriesWrapper: Client Component que usa next/dynamic con ssr:false.
         * Patrón utilizado para aislar la interactividad (búsqueda, filtros, modal)
         * del Server Component padre, evitando errores de hidratación causados por
         * extensiones del navegador que modifican el DOM antes de que React lo tome.
         */
        <CountriesWrapper initialCountries={countries} />
      )}

      <footer className="footer">
        <p>
          Datos de{' '}
          <a href="https://restcountries.com" target="_blank" rel="noopener noreferrer">
            REST Countries API
          </a>
          {' '}· Prueba Técnica Andean
        </p>
      </footer>
    </div>
  );
}
