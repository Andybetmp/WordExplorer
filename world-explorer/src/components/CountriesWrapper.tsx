'use client';

/**
 * @file CountriesWrapper.tsx
 * @description Puente entre el Server Component (page.tsx) y el Client Component
 * interactivo (CountriesClient.tsx).
 *
 * PROBLEMA QUE RESUELVE:
 * En Next.js App Router, cuando un Server Component pasa props a un Client Component
 * que contiene lógica interactiva (useState, eventos), React intenta "hidratar" el DOM:
 * comparar el HTML generado en el servidor con lo que el cliente renderiza.
 * Si extensiones del navegador modifican atributos del DOM (ej. data-extension-id)
 * ANTES de que React complete la hidratación, se produce un error que interrumpe
 * la vinculación de event listeners (onClick, onChange), dejando la UI sin respuesta.
 *
 * SOLUCIÓN:
 * next/dynamic con { ssr: false } indica a Next.js que este componente NO debe
 * renderizarse en el servidor. React lo monta directamente en el cliente sin
 * intentar comparar con HTML previo, eliminando por completo el riesgo de
 * errores de hidratación.
 *
 * TRADEOFF:
 * El contenido interactivo no aparece en el HTML inicial (no indexable por SEO),
 * pero para una herramienta de búsqueda esto es aceptable. El skeleton loader
 * garantiza que el usuario vea feedback visual inmediato mientras carga el JS.
 */

import nextDynamic from 'next/dynamic';
import { Country } from '@/types/country';

/**
 * Skeleton animado que se muestra mientras el bundle de CountriesClient
 * se descarga e inicializa en el navegador del usuario.
 * Mejora la percepción de velocidad (Perceived Performance).
 */
function LoadingSkeleton() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-flag skeleton-line" />
          <div className="skeleton-body">
            <div className="skeleton-line" style={{ height: 20, width: '70%' }} />
            <div className="skeleton-line" style={{ height: 14, width: '50%' }} />
            <div className="skeleton-line" style={{ height: 14, width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Importación dinámica con SSR deshabilitado.
 * El componente solo se carga y ejecuta en el navegador del cliente.
 */
const CountriesClient = nextDynamic(
  () => import('./CountriesClient'),
  { ssr: false, loading: () => <LoadingSkeleton /> }
);

interface Props {
  initialCountries: Country[];
}

/**
 * Componente wrapper que actúa como puente entre servidor y cliente.
 * Recibe los datos pre-cargados del servidor y los inyecta en el
 * componente dinámico del cliente, evitando que el cliente deba
 * hacer una nueva petición a la API.
 */
export default function CountriesWrapper({ initialCountries }: Props) {
  return <CountriesClient initialCountries={initialCountries} />;
}
