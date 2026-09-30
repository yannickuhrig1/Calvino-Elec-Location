import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CALVINO Location • Matériel BTP & Chantier',
    short_name: 'Calvino Location',
    description:
      'Location de matériel professionnel de chantier, BTP et espaces verts en Moselle (57). Retrait à Coin-lès-Cuvry ou livraison sur chantier.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'fr',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Catalogue Matériels',
        short_name: 'Catalogue',
        description: 'Consulter tous les matériels disponibles à la location',
        url: '/materiels',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Administration & Fiches',
        short_name: 'Admin',
        description: 'Accéder aux dossiers et réaliser les états des lieux',
        url: '/admin',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Suivi de Réservation',
        short_name: 'Suivi',
        description: 'Suivre une réservation avec votre code d’accès',
        url: '/suivi',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Zone Moselle & Livraison',
        short_name: 'Livraison',
        description: 'Consulter les délais et forfaits de livraison',
        url: '/zone-intervention-moselle',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
