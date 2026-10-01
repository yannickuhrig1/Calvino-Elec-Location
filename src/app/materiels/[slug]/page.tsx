import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/backend/db/prisma';
import { getCurrentUser } from '@/backend/auth/authService';
import { BookingForm } from '@/frontend/features/booking/BookingForm';
import { 
  ShieldCheck, 
  Check, 
  X, 
  AlertTriangle, 
  Wrench, 
  Clock, 
  Truck, 
  Layers, 
  FileText,
  Lock,
  ChevronRight
} from 'lucide-react';

interface EquipmentPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: EquipmentPageProps): Promise<Metadata> {
  const equipment = await prisma.equipment.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!equipment) {
    return { title: 'Matériel introuvable' };
  }

  const title = `Location ${equipment.name} à Metz • ${equipment.category.name}`;
  const description = `Louez ${equipment.name} en Moselle (57). Tarif : ${equipment.priceDay.toFixed(2)} € HT/jour. Retrait immédiat à Coin-lès-Cuvry ou livraison directe sur chantier. Réservez en ligne avec Calvino Location.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: equipment.imageUrl ? [{ url: equipment.imageUrl }] : undefined,
    },
  };
}

export default async function EquipmentDetailPage({ params }: EquipmentPageProps) {
  const [equipment, currentUser] = await Promise.all([
    prisma.equipment.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        units: {
          where: { status: { not: 'OUT_OF_SERVICE' } },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!equipment || !equipment.published || equipment.archived) {
    notFound();
  }

  // Décoder les JSON
  const specs: Record<string, string> = equipment.specsJson
    ? JSON.parse(equipment.specsJson)
    : {};
  const includedAccessories: string[] = equipment.includedAccessoriesJson
    ? JSON.parse(equipment.includedAccessoriesJson)
    : [];
  const excludedConsumables: string[] = equipment.excludedConsumablesJson
    ? JSON.parse(equipment.excludedConsumablesJson)
    : [];

  const availableUnits = equipment.units.filter((u) => u.status === 'AVAILABLE');
  const hasAvailableUnits = availableUnits.length > 0;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calvino-location.vercel.app';
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: equipment.name,
    image: equipment.imageUrl ? (equipment.imageUrl.startsWith('http') ? equipment.imageUrl : `${baseUrl}${equipment.imageUrl}`) : undefined,
    description: equipment.description,
    brand: {
      '@type': 'Brand',
      name: equipment.name.split(' ')[0] || 'Calvino',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: equipment.priceDay.toFixed(2),
      availability: hasAvailableUnits ? 'https://schema.org/InStock' : 'https://schema.org/LimitedAvailability',
      seller: {
        '@type': 'LocalBusiness',
        name: 'CALVINO Location',
      },
    },
  };

  return (
    <div style={{ padding: '2rem 0 5rem 0' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="container">
        {/* Fil d'Ariane */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Accueil</Link>
          <ChevronRight size={14} />
          <Link href="/materiels" style={{ color: 'var(--text-muted)' }}>Matériels</Link>
          <ChevronRight size={14} />
          <Link href={`/materiels?cat=${equipment.category.slug}`} style={{ color: 'var(--text-muted)' }}>
            {equipment.category.name}
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--brand-navy)', fontWeight: 600 }}>{equipment.name}</span>
        </div>

        {/* Titre et badges hauts */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-info">{equipment.category.name}</span>
            {equipment.brand && (
              <span className="badge badge-neutral">Marque : {equipment.brand}</span>
            )}
            {hasAvailableUnits ? (
              <span className="badge badge-confirmed">
                <Check size={12} />
                {availableUnits.length} unité(s) libre(s) au parc
              </span>
            ) : (
              <span className="badge badge-pending">
                <Clock size={12} />
                Réservation sous réserve de disponibilité
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2.5rem', color: 'var(--brand-navy)', lineHeight: 1.2 }}>
            {equipment.name}
          </h1>
          {equipment.model && (
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Modèle professionnel : <strong>{equipment.model}</strong>
            </p>
          )}
        </div>

        {/* Disposition 2 Colonnes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr', gap: '3rem', alignItems: 'start' }}>
          {/* COLONNE GAUCHE : Fiche technique et caractéristiques */}
          <div>
            {/* Grande photo principale */}
            <div className="card" style={{ overflow: 'hidden', marginBottom: '2.5rem', position: 'relative', height: '420px', backgroundColor: '#e2e8f0' }}>
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Description */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--brand-navy)' }}>
                Présentation du matériel
              </h2>
              <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--brand-slate)', whiteSpace: 'pre-line' }}>
                {equipment.description}
              </div>
            </div>

            {/* Caractéristiques techniques */}
            {Object.keys(specs).length > 0 && (
              <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wrench size={20} style={{ color: 'var(--brand-amber)' }} />
                  <span>Caractéristiques techniques</span>
                </h2>

                <div className="table-responsive">
                  <table className="table-modern">
                    <tbody>
                      {Object.entries(specs).map(([key, val]) => (
                        <tr key={key}>
                          <td style={{ fontWeight: 600, width: '40%', color: 'var(--text-main)' }}>{key}</td>
                          <td style={{ color: 'var(--brand-slate)' }}>{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Accessoires inclus vs Exclus */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Inclus */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={18} />
                  <span>Accessoires inclus</span>
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: '#14532d' }}>
                  {includedAccessories.length > 0 ? (
                    includedAccessories.map((acc, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700 }}>•</span>
                        <span>{acc}</span>
                      </li>
                    ))
                  ) : (
                    <li>Équipement nu fourni avec câble ou raccords standard.</li>
                  )}
                </ul>
              </div>

              {/* Exclus */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#92400e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} />
                  <span>Consommables non inclus</span>
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: '#78350f' }}>
                  {excludedConsumables.length > 0 ? (
                    excludedConsumables.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700 }}>•</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li>Carburant rendu au niveau de départ obligatoire.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Consignes de sécurité & EPI */}
            {equipment.safetyGuidelines && (
              <div className="card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--brand-amber)' }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={22} style={{ color: 'var(--brand-amber)' }} />
                  <span>Consignes de sécurité & EPI obligatoires</span>
                </h2>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--brand-slate)', whiteSpace: 'pre-line' }}>
                  {equipment.safetyGuidelines}
                </div>
              </div>
            )}

            {/* Grille tarifaire détaillée */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--brand-navy)' }}>
                Barème tarifaire de référence
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Les prix ci-dessous sont calculés automatiquement dans votre réservation. Aucun supplément caché.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>1 Jour (24h)</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
                    {equipment.priceDay.toFixed(2)} €
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HT / jour</div>
                </div>

                {equipment.priceWeekend && (
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--brand-amber)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-amber-hover)', textTransform: 'uppercase', fontWeight: 700 }}>Forfait Week-end</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
                      {equipment.priceWeekend.toFixed(2)} €
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HT (ven. soir au lun. matin)</div>
                  </div>
                )}

                {equipment.priceWeek && (
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Forfait Semaine (7j)</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
                      {equipment.priceWeek.toFixed(2)} €
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HT pour 7 jours</div>
                  </div>
                )}

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Caution requise</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-amber-hover)', marginTop: '0.25rem' }}>
                    {equipment.depositAmount.toFixed(0)} €
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Non débitée en ligne</div>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : WIDGET DE RÉSERVATION STICKY */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <BookingForm
              equipment={{
                id: equipment.id,
                slug: equipment.slug,
                name: equipment.name,
                pricingType: equipment.pricingType,
                priceHalfDay: equipment.priceHalfDay,
                priceDay: equipment.priceDay,
                priceWeekend: equipment.priceWeekend,
                priceWeek: equipment.priceWeek,
                depositAmount: equipment.depositAmount,
                deliveryAvailable: equipment.deliveryAvailable,
                deliveryFlatFee: equipment.deliveryFlatFee,
                minDurationHours: equipment.minDurationHours,
              }}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
