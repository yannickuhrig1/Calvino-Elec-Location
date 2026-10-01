import React from 'react';
import Link from 'next/link';
import prisma from '@/backend/db/prisma';
import { EquipmentCard } from '@/frontend/features/booking/EquipmentCard';
import { 
  Wrench, 
  Wind, 
  Droplets, 
  Hammer, 
  Truck, 
  Zap, 
  Disc, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall, 
  MapPin, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Gauge
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, equipments, settings] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { equipments: true } },
      },
    }),
    prisma.equipment.findMany({
      where: { published: true, archived: false },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        units: {
          where: { status: { not: 'OUT_OF_SERVICE' } },
        },
      },
    }),
    prisma.siteSettings.findUnique({
      where: { id: 'default' },
    }),
  ]);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'nettoyage-entretien':
      case 'nettoyage-pompage':
        return <Droplets size={24} />;
      case 'renovation-poncage-peinture':
        return <Sparkles size={24} />;
      case 'aspiration-depoussierage':
        return <Wind size={24} />;
      case 'sciage-decoupe':
        return <Disc size={24} />;
      case 'beton-maconnerie':
        return <Hammer size={24} />;
      case 'air-comprime':
      case 'air-comprime-sablage':
        return <Gauge size={24} />;
      case 'terrassement-compactage':
        return <Truck size={24} />;
      case 'energie-eclairage':
        return <Zap size={24} />;
      default:
        return <Wrench size={24} />;
    }
  };

  return (
    <div>
      {/* 1. HÉRO & MOTEUR DE RECHERCHE RAPIDE */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--brand-amber)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.825rem', fontWeight: 700, marginBottom: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Sparkles size={15} />
                <span>CALVINO ELEC • Parc matériel professionnel révisé</span>
              </div>

              <h1 className="hero-title">
                La location d'engins & d'outillage <span>sans imprévu</span>.
              </h1>

              <p className="hero-desc">
                Injecteur-extracteur et nettoyeur haute pression Kärcher, ponceuse girafe FLEX, aspirateur classe M, scie radiale Bosch, malaxeur 1800W et compresseur 100L. Tarifs clairs, disponibilité en temps réel et réservation sécurisée à Coin-lès-Cuvry (Moselle).
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/materiels" className="btn btn-primary btn-lg">
                  <span>Explorer le catalogue</span>
                  <ArrowRight size={18} />
                </Link>
                <Link href="/comment-ca-marche" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                  <span>Comment ça marche</span>
                </Link>
              </div>
            </div>

            {/* Formulaire de recherche rapide héro */}
            <div>
              <div className="search-banner-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--brand-navy)' }}>
                    Recherche par date & matériel
                  </span>
                  <span className="badge badge-info">Temps réel</span>
                </div>

                <form action="/materiels" method="GET" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Équipement ou mot-clé</label>
                    <input
                      type="text"
                      name="q"
                      className="form-input"
                      placeholder="Ex : Compresseur, Nettoyeur, Bétonnière..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Date début</label>
                      <input
                        type="date"
                        name="start"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Date fin</label>
                      <input
                        type="date"
                        name="end"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-dark" style={{ width: '100%', marginTop: '0.5rem' }}>
                    <span>Vérifier les disponibilités & tarifs</span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                    Caution non débitée
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                    Retrait ou livraison
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATÉGORIES PHARE */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Nos gammes de matériels
              </span>
              <h2 style={{ fontSize: '2.1rem', marginTop: '0.25rem' }}>
                Des équipements adaptés à tous vos chantiers
              </h2>
            </div>
            <Link href="/materiels" style={{ color: 'var(--brand-blue-accent)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>Voir tout le catalogue ({equipments.length} fiches)</span>
              <ChevronRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/materiels?cat=${cat.slug}`}
                className="card card-hover"
                style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  {getCategoryIcon(cat.slug)}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem', color: 'var(--brand-navy)' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {cat._count.equipments} matériel{cat._count.equipments > 1 ? 's' : ''}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MATÉRIELS EN VEDETTE */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Matériels les plus demandés
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
              Disponibles à la réservation
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Chaque fiche détaille les caractéristiques réelles, les accessoires inclus, les consignes d'utilisation et le calcul transparent du prix selon votre durée.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {equipments.map((eq) => {
              const availableUnits = eq.units.filter((u) => u.status === 'AVAILABLE').length;
              return (
                <EquipmentCard
                  key={eq.id}
                  equipment={{
                    id: eq.id,
                    slug: eq.slug,
                    name: eq.name,
                    summary: eq.summary,
                    brand: eq.brand,
                    model: eq.model,
                    imageUrl: eq.imageUrl,
                    priceDay: eq.priceDay,
                    priceWeekend: eq.priceWeekend,
                    priceWeek: eq.priceWeek,
                    depositAmount: eq.depositAmount,
                    pricingType: eq.pricingType,
                    category: {
                      name: eq.category.name,
                      slug: eq.category.slug,
                    },
                    availableCount: availableUnits,
                  }}
                />
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link href="/materiels" className="btn btn-dark btn-lg">
              <span>Parcourir l'ensemble du parc matériel</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. COMMENT ÇA MARCHE - PROCESSUS EN 4 ÉTAPES */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Fonctionnement clair & transparent
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
              La location en 4 étapes simples
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Pas de mauvaise surprise : votre demande est vérifiée par notre agence avant toute confirmation contractuelle.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-navy)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1.25rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Choix & Devis en ligne</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Sélectionnez votre matériel et vos dates. Le tarif (jour, forfait week-end ou semaine) et la caution s'affichent instantanément et en toute transparence.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', position: 'relative', borderLeft: '3px solid var(--brand-amber)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-amber)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1.25rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Validation sous 2h</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Votre demande est initialement <strong>EN ATTENTE</strong>. Notre équipe contrôle la disponibilité physique, prépare l’engin et vous confirme la réservation.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-navy)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1.25rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Mise à disposition</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Retrait en agence ou livraison sur chantier. État des lieux contradictoire effectué ensemble, consignes de sécurité remises et empreinte de caution enregistrée.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', position: 'relative' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--brand-navy)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '1.25rem' }}>
                4
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Restitution & Caution</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Retour du matériel propre et approvisionné. Dès le contrôle de conformité validé, la caution est immédiatement et intégralement libérée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ENGAGEMENTS & SÉCURITÉ */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--brand-navy)', color: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--brand-amber)', flexShrink: 0 }}>
                <ShieldCheck size={36} />
              </div>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                  Caution non débitée
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  Aucun montant de caution n'est encaissé lors de votre réservation sur internet. Seule une empreinte bancaire ou un chèque est demandé au départ.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--brand-amber)', flexShrink: 0 }}>
                <Wrench size={36} />
              </div>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                  Matériel contrôlé & révisé
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  Chaque engin fait l'objet d'un contrôle technique strict (pression, vidanges, sécurité, nettoyage) consigné dans notre carnet d'entretien.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--brand-amber)', flexShrink: 0 }}>
                <Clock size={36} />
              </div>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                  Horaires pros élargis
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  Ouvert dès 07h30 pour vous permettre de récupérer vos matériels avant le début des travaux, et permanence assurée le samedi matin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BANDEAU CONTACT & DÉMONSTRATION */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f1f5f9' }}>
        <div className="container">
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: 'var(--radius-xl)', 
            padding: '2.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-light)'
          }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
                Besoin d'un conseil ou d'une configuration spéciale ?
              </span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--brand-navy)' }}>
                Notre équipe est à votre écoute
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '560px' }}>
                Retrouvez notre dépôt à <strong>{settings?.address || '71 RUE DE LA FONTENELLE, 57420 COIN-LES-CUVRY'}</strong> ou contactez directement Gaëtan CALVINO par téléphone au <strong>{settings?.phone || '06 63 44 74 89'}</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-dark btn-lg">
                <MapPin size={18} />
                <span>Nous trouver</span>
              </Link>
              <a href={`tel:${settings?.phone || '0663447489'}`} className="btn btn-primary btn-lg">
                <PhoneCall size={18} />
                <span>Appeler le dépôt</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
