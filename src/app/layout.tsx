import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { PromoBanner } from '@/components/PromoBanner';
import { SiteFooter } from '@/components/SiteFooter';
import { PwaRegister } from '@/components/PwaRegister';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calvino-location.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'CALVINO Location • Location Matériel BTP & Outillage à Metz & Moselle (57)',
    template: '%s | CALVINO Location Moselle',
  },
  description:
    'Location professionnelle de matériel de chantier, BTP et espaces verts en Moselle (57). Carotteuses, compresseurs, nettoyeurs haute pression, bétonnières. Retrait dépôt à Coin-lès-Cuvry ou livraison directe sur chantier.',
  keywords: [
    'location matériel chantier metz',
    'location outillage btp moselle',
    'location carotteuse diamant metz',
    'location nettoyeur haute pression moselle',
    'location mini pelle coin les cuvry',
    'outillage btp 57',
    'location outillage travaux particuliers lorraine',
    'calvino elec location',
  ],
  authors: [{ name: 'CALVINO ELEC SASU' }],
  creator: 'CALVINO ELEC',
  publisher: 'CALVINO ELEC',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: baseUrl,
    siteName: 'CALVINO Location • BTP & Outillage 57',
    title: 'CALVINO Location • Location Matériel BTP & Chantier à Metz (57)',
    description:
      'Louez votre matériel de chantier et outillage de pointe en Moselle : carotteuse diamant, nettoyeur pro, compresseur. Disponibilité immédiate et forfaits week-end avantageux.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CALVINO Location • Matériel de Chantier Moselle (57)',
    description:
      'Location de matériel BTP, jardinage et travaux à Metz et environs. Retrait à Coin-lès-Cuvry.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'EquipmentRentalService'],
      '@id': `${baseUrl}/#organization`,
      name: 'CALVINO ELEC - Calvino Location',
      alternateName: 'Calvino Location BTP & Chantier Moselle',
      url: baseUrl,
      telephone: '+33663447489',
      email: 'calvinoelec@gmail.com',
      priceRange: '€€',
      description:
        'Service professionnel de location de matériel de chantier, outillage électroportatif de pointe, carotteuses et entretien d’espaces verts en Moselle (57). Particuliers et artisans.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '71 Rue de la Fontenelle',
        addressLocality: 'Coin-lès-Cuvry',
        postalCode: '57420',
        addressRegion: 'Moselle',
        addressCountry: 'FR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 49.0346,
        longitude: 6.1558,
      },
      areaServed: [
        { '@type': 'City', name: 'Coin-lès-Cuvry' },
        { '@type': 'City', name: 'Metz' },
        { '@type': 'City', name: 'Marly' },
        { '@type': 'City', name: 'Augny' },
        { '@type': 'City', name: 'Montigny-lès-Metz' },
        { '@type': 'City', name: 'Saint-Julien-lès-Metz' },
        { '@type': 'City', name: 'Thionville' },
        { '@type': 'City', name: 'Verny' },
        { '@type': 'City', name: 'Pont-à-Mousson' },
        { '@type': 'AdministrativeArea', name: 'Moselle' },
        { '@type': 'AdministrativeArea', name: 'Grand Est' },
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '07:30',
          closes: '18:30',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday'],
          opens: '08:00',
          closes: '17:00',
        },
      ],
      paymentAccepted: 'Carte bancaire, Espèces, Virement',
      currenciesAccepted: 'EUR',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Calvino Location" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body>
        <SiteHeader />
        <PromoBanner />
        <main>{children}</main>
        <SiteFooter />
        <PwaRegister />
      </body>
    </html>
  );
}
