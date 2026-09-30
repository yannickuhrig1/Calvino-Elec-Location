import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Truck, 
  ShieldCheck, 
  ArrowRight,
  Copy,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConfirmationPageProps {
  searchParams: {
    id?: string;
    code?: string;
    secret?: string;
  };
}

export default async function ReservationConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { id, secret } = searchParams;

  if (!id) {
    notFound();
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      equipment: {
        include: { category: true },
      },
      unit: true,
    },
  });

  if (!reservation) {
    notFound();
  }

  const calculation = JSON.parse(reservation.calculationJson || '{}');

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Bannière de confirmation */}
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', borderTop: '6px solid var(--brand-amber)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fffbeb', color: 'var(--brand-amber)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <Clock size={36} />
          </div>

          <h1 style={{ fontSize: '2rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
            Demande de réservation bien enregistrée !
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 1.5rem auto' }}>
            Votre demande porte la référence officielle <strong>{reservation.reservationNumber}</strong>.
          </p>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#fffbeb', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-full)', border: '1px solid #fde68a', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e' }}>
              Statut initial de votre dossier :
            </span>
            <StatusBadge status={reservation.status} />
          </div>

          <div style={{ 
            backgroundColor: 'var(--bg-surface-subtle)', 
            padding: '1.25rem', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px dashed var(--border-medium)',
            maxWidth: '560px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Code d'accès secret pour suivi invité :
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <code style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '0.05em' }}>
                {reservation.secretAccessCode}
              </code>
              <Link 
                href={`/suivi?code=${reservation.reservationNumber}&secret=${reservation.secretAccessCode}`}
                className="btn btn-outline btn-sm"
              >
                Accéder au suivi direct
              </Link>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Conservez ce code ou ce lien pour consulter l'évolution de la réservation sans mot de passe.
            </p>
          </div>
        </div>

        {/* Détails du dossier */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-navy)' }}>
              Récapitulatif contractuel de votre demande
            </h2>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Enregistrée le {format(reservation.createdAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </span>
          </div>

          <div className="card-body">
            {/* Ligne Matériel */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                <img
                  src={reservation.equipment.imageUrl}
                  alt={reservation.equipment.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--brand-blue-accent)', fontWeight: 600 }}>
                  {reservation.equipment.category.name}
                </div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-navy)', margin: '0.2rem 0' }}>
                  {reservation.equipment.name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Durée de mise à disposition : <strong>{reservation.rentalDays} jour{reservation.rentalDays > 1 ? 's' : ''}</strong>
                </div>
              </div>
            </div>

            {/* Période et Modalités */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Dates de location
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                  Du {format(reservation.startDate, 'dd/MM/yyyy')} à {reservation.pickupTime}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                  Au {format(reservation.endDate, 'dd/MM/yyyy')} à {reservation.returnTime}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Mode de mise à disposition
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                  {reservation.deliveryMode === 'DELIVERY_ON_SITE' ? (
                    <span style={{ color: 'var(--brand-blue-accent)' }}>Livraison sur chantier</span>
                  ) : (
                    <span>Retrait au dépôt de Coin-lès-Cuvry</span>
                  )}
                </div>
                {reservation.deliveryAddress && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {reservation.deliveryAddress}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Bénéficiaire
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                  {reservation.customerName}
                </div>
                {reservation.customerCompany && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {reservation.customerCompany}
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {reservation.customerPhone} • {reservation.customerEmail}
                </div>
              </div>
            </div>

            {/* Récapitulatif financier */}
            <div style={{ paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Loyer matériel ({reservation.rentalDays} jours) :</span>
                  <span>{reservation.basePrice.toFixed(2)} € HT</span>
                </div>

                {reservation.deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Livraison et reprise sur site (A/R) :</span>
                    <span>{reservation.deliveryFee.toFixed(2)} € HT</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-medium)', fontWeight: 600 }}>
                  <span>Sous-total HT :</span>
                  <span>{reservation.subtotalHt.toFixed(2)} € HT</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>TVA ({reservation.taxRate.toFixed(1)} %) :</span>
                  <span>{reservation.taxAmount.toFixed(2)} €</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.6rem', borderTop: '2px solid var(--brand-navy)', fontSize: '1.2rem', fontWeight: 800 }}>
                  <span>Total Location TTC :</span>
                  <span style={{ color: 'var(--brand-blue-accent)' }}>{reservation.totalAmount.toFixed(2)} € TTC</span>
                </div>

                {/* Caution */}
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--brand-slate)' }}>Caution (Dépôt de garantie) :</span>
                    <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--brand-amber-hover)' }}>
                      {reservation.depositAmount.toFixed(0)} €
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Dépôt consigné par empreinte CB ou chèque au moment de la remise du matériel. Non encaissée et libérée à la restitution.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Étapes suivantes pour le client */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
            Ce qu'il se passe maintenant :
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                1
              </div>
              <div>
                <strong style={{ color: 'var(--brand-navy)' }}>Contrôle de disponibilité par l'agence (sous 2h)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Un gestionnaire Calvino Location vérifie le calendrier du parc et assigne une unité physique testée. Vous recevrez une notification dès validation.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                2
              </div>
              <div>
                <strong style={{ color: 'var(--brand-navy)' }}>Pièces justificatives à préparer</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Une pièce d'identité en cours de validité (CNI ou passeport), un extrait Kbis ou justificatif de domicile de moins de 3 mois, et le moyen de dépôt de garantie (carte bancaire pour pré-autorisation ou chèque certifié).
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                3
              </div>
              <div>
                <strong style={{ color: 'var(--brand-navy)' }}>Mise à disposition et état des lieux</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Essai de démarrage, explication des sécurités, remise des accessoires et signature contradictoire de la fiche de mise à disposition.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons retour et navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/materiels" className="btn btn-outline">
            ← Louer un autre matériel
          </Link>
          <Link href={`/suivi?code=${reservation.reservationNumber}&secret=${reservation.secretAccessCode}`} className="btn btn-primary">
            <span>Accéder au suivi en direct</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
