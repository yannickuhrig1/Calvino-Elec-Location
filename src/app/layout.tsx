import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { PromoBanner } from '@/components/PromoBanner';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Calvino Location | Location de Matériel de Chantier, BTP & Bricolage',
  description:
    'Location de compresseurs de chantier, nettoyeurs haute pression, bétonnières et engins professionnels. Tarifs transparents, disponibilité en temps réel et validation humaine sous 2h.',
  keywords: [
    'location matériel chantier',
    'location compresseur',
    'location bétonnière',
    'location nettoyeur haute pression',
    'location outillage BTP',
    'Calvino Location',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <SiteHeader />
        <PromoBanner />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
