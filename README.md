# 🌍 WorldExplorer – Prueba Técnica

Aplicación web que consume la [API pública de REST Countries] para mostrar información detallada sobre los 250 países del mundo.

## 🚀 Demo

> Disponible en: https://word-explorer-n7ih.vercel.app/

---

## ✅ Funcionalidades implementadas

| Requisito | Estado |
|---|---|
| Listado de países con nombre, capital y región | ✅ |
| Búsqueda por nombre (común, oficial) y capital | ✅ |
| Filtro por región (Africa, Americas, Asia, Europe, Oceania, Antarctic) | ✅ |
| Detalle del país al hacer clic: población, monedas, idiomas | ✅ |
| **Bonus:** Bandera del país en tarjeta y modal | ✅ |
| **Bonus:** Skeleton loader (indicador de carga) | ✅ |
| Manejo de errores con mensaje amigable al usuario | ✅ |
| Código ordenado con comentarios técnicos | ✅ |

---

## 🛠 Stack tecnológico

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** CSS Vanilla con variables CSS (sin frameworks)
- **API:** [REST Countries v3.1](https://restcountries.com/)
- **Fuente:** Inter (Google Fonts)

---

## 🏗 Arquitectura

```
src/
├── app/
│   ├── layout.tsx          # Layout raíz con metadata SEO
│   ├── page.tsx            # Server Component — fetch de datos en el servidor
│   └── globals.css         # Sistema de diseño global (variables, componentes)
├── components/
│   ├── CountriesWrapper.tsx # Puente Server→Client con next/dynamic (ssr:false)
│   ├── CountriesClient.tsx  # Lógica de búsqueda, filtros y apertura de modal
│   ├── CountryCard.tsx      # Tarjeta individual de país
│   └── CountryModal.tsx     # Modal de detalle del país
├── lib/
│   └── api.ts              # Capa de acceso a la API de REST Countries
└── types/
    └── country.ts          # Tipos TypeScript para los datos de la API
```

### Patrón Server / Client Component

```
page.tsx (Server Component)
│   • Ejecuta el fetch en el servidor
│   • Datos disponibles en el HTML inicial
│   • Manejo de error de la API
│
└── CountriesWrapper (Client Component)
        • next/dynamic con ssr:false
        • Evita errores de hidratación
        │
        └── CountriesClient (Client Component)
                • useState: search, region, selectedCountry
                • useMemo: filtrado optimizado
                • useCallback: handlers memorizados
                │
                ├── CountryCard × 250
                └── CountryModal (condicional)
```

---

## 🔑 Decisiones técnicas clave

### 1. Single Fetch Strategy
Todos los datos necesarios (nombre, capital, región, **monedas, idiomas**, banderas) se solicitan en **una sola petición** al cargar la página. El modal abre **instantáneamente** sin llamadas adicionales a la API.

```typescript
// api.ts — Un solo fetch con todos los campos requeridos
const ALL_FIELDS = 'fields=cca3,name,capital,region,subregion,population,flags,currencies,languages';
```

### 2. `ssr: false` para evitar errores de hidratación
El componente interactivo se carga exclusivamente en el cliente usando `next/dynamic`, eliminando la fase de hidratación y cualquier conflicto con extensiones del navegador.

```typescript
// CountriesWrapper.tsx
const CountriesClient = nextDynamic(
  () => import('./CountriesClient'),
  { ssr: false, loading: () => <LoadingSkeleton /> }
);
```

### 3. Filtrado con `useMemo`
El filtrado de 250 países solo se recalcula cuando cambian `search` o `region`, no en cada render del componente.

```typescript
const filtered = useMemo(() => {
  let list = initialCountries;
  if (region) list = list.filter(c => c.region === region);
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
```

### 4. Caché con ISR
El fetch usa `next: { revalidate: 3600 }` para cachear la respuesta 1 hora en el servidor, reduciendo llamadas innecesarias a la API externa.

### 5. Accesibilidad
- Elementos `<button>` nativos (navegables por teclado sin configuración adicional).
- `role="dialog"` + `aria-modal="true"` en el modal.
- `aria-label` descriptivo en tarjetas y botones de cierre.
- Cierre del modal con tecla **Escape**.
- SVGs decorativos marcados con `aria-hidden="true"`.

---

## ⚡ Instalación y ejecución local

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd world-explorer

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:3000
```

### Requisitos
- Node.js >= 18
- npm >= 9
- Conexión a internet (consume API externa)

---

## 📦 Build para producción

```bash
npm run build
npm start
```

---

## 🗂 Variables de entorno

No se requieren variables de entorno. La aplicación consume únicamente la API pública de REST Countries sin autenticación.

---

## 📄 API utilizada

**REST Countries v3.1** — `https://restcountries.com/v3.1`

| Endpoint | Uso |
|---|---|
| `GET /all?fields=...` | Obtiene todos los países con los campos seleccionados |

Campos consumidos: `cca3`, `name`, `capital`, `region`, `subregion`, `population`, `flags`, `currencies`, `languages`

---

*Desarrollado para Prueba Técnica – Andean · 2026*
