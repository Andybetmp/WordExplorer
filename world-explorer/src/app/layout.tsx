import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WorldExplorer – Explore Every Country on Earth',
  description: 'Discover information about all countries: capitals, populations, currencies, languages and more. Search, filter and explore the world interactively.',
  keywords: 'countries, world, capitals, population, currencies, languages, flags, geography',
  openGraph: {
    title: 'WorldExplorer – Explore Every Country on Earth',
    description: 'Discover information about all countries of the world.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
