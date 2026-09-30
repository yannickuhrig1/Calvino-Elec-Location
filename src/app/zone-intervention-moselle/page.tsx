import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  MapPin, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  Building2, 
  Calendar,
  Sparkles
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Zone d’Intervention & Livraison Matériel BTP en Moselle (57) | Calvino Location',
  description:
    'Retrait dépôt à Coin-lès-Cuvry ou livraison express de matériel de chantier sur toute la Moselle : Metz, Thionville, Nancy, Marly, Augny, Saint-Julien. Tarifs forfaitaires A/R.',
  keywords: [
    'location materiel btp metz',
    'location engin chantier moselle',
    'livraison materiel btp 57',
    'location carotteuse thionville',
    'location outillage coin les cuvry',
    'location travaux marly augny',
    'calvino elec zone de livraison',
  ],
};

const ZONES = [
  {
    name: 'Secteur Sud Messin & Proximité Dépôt',
    badge: 'Retrait Immédiat ou Livraison Express (15-30 min)',
    badgeColor: '#059669',
    cities: [
      'Coin-lès-Cuvry (Siège & Dépôt)',
      'Cuvry',
      'Marly',
      'Augny',
      'Fey',
      'Pournoy-la-Chétive',
      'Verny',
      'Pouilly',
      'Peltre',
      'Fleury',
      'Corny-sur-Moselle',
    ],
    deliveryFee: 'Forfait de base : 25 € HT (A/R)',
    description: 'À moins de 10 minutes de notre dépôt principal. Idéal pour un retrait rapide à 07h30 avant l’embauche ou une livraison directe le matin même sur votre chantier.',
  },
  {
    name: 'Metz Métropole & Agglomération',
    badge: 'Livraison Chantier sous 2h ouvrées',
    badgeColor: '#2563eb',
    cities: [
      'Metz (Centre, Sablon, Queuleu, Magny, Borny)',
      'Montigny-lès-Metz',
      'Saint-Julien-lès-Metz',
      'Woippy',
      'Moulins-lès-Metz',
      'Longeville-lès-Metz',
      'Le Ban-Saint-Martin',
      'La Maxe',
      'Ars-sur-Moselle',
      'Scy-Chazelles',
    ],
    deliveryFee: 'Forfait agglomération : 35 € HT (A/R)',
    description: 'Desserte quotidienne des chantiers de réhabilitation, rénovation et construction de la métropole messine. Prise de rendez-vous horaire précise.',
  },
  {
    name: 'Nord Moselle & Vallée de la Fensch / Orne',
    badge: 'Livraison Programmée 24h/48h',
    badgeColor: '#d97706',
    cities: [
      'Thionville',
      'Maizières-lès-Metz',
      'Hagondange',
      'Amnéville',
      'Mondelange',
      'Uckange',
      'Florange',
      'Yutz',
      'Talange',
      'Rombas',
    ],
    deliveryFee: 'Forfait Nord Moselle : 50 € HT (A/R)',
    description: 'Livraison sur chantiers industriels, pavillonnaires et VRD du sillon mosellan nord via l’A31.',
  },
  {
    name: 'Axe Sud & Meurthe-et-Moselle Proche',
    badge: 'Sur Demande & Moyennes Durées',
    badgeColor: '#475569',
    cities: [
      'Pont-à-Mousson',
      'Dieulouard',
      'Pagny-sur-Moselle',
      'Nomeny',
      'Nancy Nord & Environs',
    ],
    deliveryFee: 'Sur devis kilométrique personnalisé',
    description: 'Accompagnement de vos chantiers sur l’axe Nancy-Metz pour les locations week-end, semaine ou mensuelles.',
  },
];

export default function ZoneInterventionPage() {
  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Fil d'Ariane */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>Accueil</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--brand-navy)', fontWeight: 600 }}>Zone d'intervention & Livraison</span>
        </div>

        {/* Hero Section Locale */}
        <div style={{
          backgroundColor: 'var(--brand-navy)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          marginBottom: '3rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(217, 119, 6, 0.25)', color: '#fbbf24', padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
              <Compass size={14} />
              <span>Couverture géographique Moselle 57 & Lorraine</span>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, margin: '0 0 1rem 0' }}>
              Location & Livraison de Matériel de Chantier en Moselle
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
              Basé à <strong>Coin-lès-Cuvry</strong>, CALVINO LOCATION met à votre disposition un parc d'outillage professionnel révisé pour les artisans, entreprises du BTP et particuliers exigeants de <strong>Metz, Thionville, Nancy</strong> et de l'ensemble du département 57.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/materiels" className="btn btn-primary btn-lg">
                Consulter le catalogue matériel →
              </Link>
              <a href="tel:0663447489" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: '#ffffff' }}>
                <Phone size={18} />
                <span>06 63 44 74 89</span>
              </a>
            </div>
          </div>
        </div>

        {/* Coordonnées Dépôt & Accès */}
        <div className="card" style={{ padding: '2rem', marginBottom: '3rem', borderLeft: '5px solid var(--brand-amber)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                <Building2 size={22} style={{ color: 'var(--brand-amber)' }} />
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Dépôt Principal & Siège</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                Retrait gratuit sur rendez-vous au dépôt ou départ de nos tournées de livraison sur vos chantiers.
              </p>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '1rem' }}>
                📍 CALVINO ELEC SASU<br />
                71 Rue de la Fontenelle<br />
                57420 Coin-lès-Cuvry (Moselle)
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                <Clock size={22} style={{ color: 'var(--brand-amber)' }} />
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Horaires d'Ouverture</h3>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--brand-slate)', lineHeight: 1.6 }}>
                <div><strong>Lundi au Vendredi :</strong> 07h30 - 18h30 (non-stop sur RDV)</div>
                <div><strong>Samedi :</strong> 08h00 - 17h00 (départs week-end)</div>
                <div><strong>Dimanche :</strong> Fermé (restitution possible le lundi matin dès 07h30)</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
                <Truck size={22} style={{ color: 'var(--brand-amber)' }} />
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Modalités de Livraison</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Livraison et reprise directement sur votre chantier. Matériel déchargé et mise en route effectuée sur place avec nos techniciens.
              </p>
            </div>
          </div>
        </div>

        {/* Détail des Secteurs Couverts */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
            Communes et Secteurs Desservis en Moselle
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Consultez les délais moyens d'intervention et nos forfaits de livraison selon la localisation de votre chantier.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {ZONES.map((zone, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${zone.badgeColor}`
                }}
              >
                <div>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: `${zone.badgeColor}15`,
                    color: zone.badgeColor,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.65rem',
                    borderRadius: '4px',
                    marginBottom: '0.75rem'
                  }}>
                    {zone.badge}
                  </span>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', margin: '0 0 0.5rem 0' }}>
                    {zone.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    {zone.description}
                  </p>

                  <div style={{
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    marginBottom: '1rem',
                    fontSize: '0.825rem'
                  }}>
                    <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.35rem' }}>
                      Principales communes desservies :
                    </strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {zone.cities.map((city, cIdx) => (
                        <span key={cIdx} style={{ backgroundColor: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', color: 'var(--brand-slate)' }}>
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{
                  paddingTop: '0.75rem',
                  borderTop: '1px dashed var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{zone.deliveryFee}</span>
                  <Link href="/materiels" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-blue-accent)' }}>
                    Réserver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Avantages Calvino Location Moselle */}
        <div className="card" style={{ padding: '2.5rem', backgroundColor: '#f8fafc', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-navy)', textAlign: 'center', marginBottom: '2rem' }}>
            Pourquoi choisir Calvino Location pour votre chantier en Moselle ?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ color: 'var(--brand-amber)', flexShrink: 0 }}><Sparkles size={22} /></div>
              <div>
                <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.2rem' }}>Matériel Professionnel Testé</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chaque machine est nettoyée, graissée et vérifiée au banc d'essai avant remise.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ color: 'var(--brand-amber)', flexShrink: 0 }}><Calendar size={22} /></div>
              <div>
                <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.2rem' }}>Forfait Week-end Avantageux</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Du vendredi 17h au lundi 08h30 pour seulement 1,5 jour facturé au lieu de 2.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ color: 'var(--brand-amber)', flexShrink: 0 }}><ShieldCheck size={22} /></div>
              <div>
                <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.2rem' }}>Caution Non Débitée</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Simple empreinte bancaire ou chèque d'entreprise, annulé dès l'état des lieux retour.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ color: 'var(--brand-amber)', flexShrink: 0 }}><Phone size={22} /></div>
              <div>
                <strong style={{ display: 'block', color: 'var(--brand-navy)', marginBottom: '0.2rem' }}>Conseil Technique Dédié</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Échange direct avec des pros du bâtiment pour choisir le bon matériel et les consommables.</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Bas de page */}
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          color: '#ffffff'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>
            Prêt à lancer vos travaux en Moselle ?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 1.75rem auto' }}>
            Réservez en ligne en quelques clics ou contactez notre agence de Coin-lès-Cuvry pour une confirmation immédiate de disponibilité.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/materiels" className="btn btn-primary btn-lg">
              Voir tous les matériels disponibles →
            </Link>
            <Link href="/contact" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: '#ffffff' }}>
              Demander un devis personnalisé
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
