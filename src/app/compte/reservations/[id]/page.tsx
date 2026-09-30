import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  FileText,
  AlertCircle,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CancelReservationButton } from './CancelReservationButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function ClientReservationDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/connexion');
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id },
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

  // Vérifier propriétaire ou admin
  if (reservation.userId !== user.id && reservation.customerEmail.toLowerCase() !== user.email.toLowerCase() && user.role !== 'ADMIN') {
    redirect('/compte');
  }

  const history = JSON.parse(reservation.statusHistoryJson || '[]');

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/compte" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} />
            <span>Retour à mes réservations</span>
          </Link>
        </div>

        {/* En-tête Dossier */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Dossier n° {reservation.reservationNumber}
              </span>
              <h1 style={{ fontSize: '1.8rem', color: 'var(--brand-navy)', margin: '0.2rem 0' }}>
                {reservation.equipment.name}
              </h1>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Demande transmise le {format(reservation.createdAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <StatusBadge status={reservation.status} />
              {reservation.unit && (
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-navy)', marginTop: '0.35rem' }}>
                  Unité attribuée : {reservation.unit.internalCode}
                </div>
              )}
            </div>
          </div>

          {/* Alertes de statut */}
          {reservation.status === 'PENDING' && (
            <div className="alert alert-warning">
              <Clock size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Examen en cours :</strong> Votre demande est entre les mains de notre agence. Nous vérifions la disponibilité du matériel et vous validons la commande sous 2h ouvrées.
              </div>
            </div>
          )}

          {reservation.status === 'CONFIRMED' && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Réservation validée !</strong> L'unité physique {reservation.unit?.internalCode} est réservée pour vous. Munissez-vous de vos pièces justificatives lors du retrait.
              </div>
            </div>
          )}

          {reservation.status === 'IN_PROGRESS' && (
            <div className="alert alert-info">
              <Truck size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Matériel en cours d'utilisation sur chantier.</strong> Retour prévu le <strong>{format(reservation.endDate, 'dd/MM/yyyy')} à {reservation.returnTime}</strong>.
              </div>
            </div>
          )}

          {reservation.status === 'COMPLETED' && (
            <div className="alert alert-info">
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Location terminée et caution restituée.</strong> Merci de votre confiance !
              </div>
            </div>
          )}

          {/* Grille des modalités */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', backgroundColor: 'var(--bg-surface-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginTop: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dates</div>
              <div style={{ fontWeight: 600, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>
                Du {format(reservation.startDate, 'dd/MM/yyyy')} à {reservation.pickupTime}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
                Au {format(reservation.endDate, 'dd/MM/yyyy')} à {reservation.returnTime}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({reservation.rentalDays} jours facturés)</span>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mode</div>
              <div style={{ fontWeight: 600, color: 'var(--brand-navy)', marginTop: '0.2rem' }}>
                {reservation.deliveryMode === 'DELIVERY_ON_SITE' ? 'Livraison sur chantier' : 'Retrait en agence'}
              </div>
              {reservation.deliveryAddress && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {reservation.deliveryAddress}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Facturation</div>
              <div style={{ fontWeight: 700, color: 'var(--brand-blue-accent)', marginTop: '0.2rem' }}>
                Total : {reservation.totalAmount.toFixed(2)} € TTC
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Caution : <strong>{reservation.depositAmount.toFixed(0)} €</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Détail financier contractuel */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
            Décomposition du devis contractuel figé
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Loyer matériel de base ({reservation.rentalDays} jours) :</span>
              <span>{reservation.basePrice.toFixed(2)} € HT</span>
            </div>

            {reservation.deliveryFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Livraison et reprise sur chantier (A/R) :</span>
                <span>{reservation.deliveryFee.toFixed(2)} € HT</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-medium)', fontWeight: 600 }}>
              <span>Sous-total HT :</span>
              <span>{reservation.subtotalHt.toFixed(2)} € HT</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>TVA ({reservation.taxRate.toFixed(1)} %) :</span>
              <span>{reservation.taxAmount.toFixed(2)} €</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '0.75rem', borderTop: '2px solid var(--brand-navy)', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Total Location TTC :</span>
              <span style={{ color: 'var(--brand-blue-accent)' }}>{reservation.totalAmount.toFixed(2)} € TTC</span>
            </div>

            {/* Caution */}
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--brand-slate)' }}>Caution (Dépôt de garantie) :</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--brand-amber-hover)' }}>
                  {reservation.depositAmount.toFixed(0)} €
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                La caution est une empreinte bancaire non débitée, demandée lors de la prise en charge et annulée au retour après vérification technique.
              </div>
            </div>
          </div>
        </div>

        {/* Historique du dossier */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
            Historique du cycle de vie
          </h2>

          <div className="timeline">
            {history.map((event: any, idx: number) => (
              <div key={idx} className="timeline-item">
                <div className={`timeline-dot ${idx === history.length - 1 ? 'active' : ''}`} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <StatusBadge status={event.status} showIcon={false} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {format(new Date(event.date), 'dd/MM/yyyy à HH:mm')} • Par {event.author}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--brand-slate)' }}>
                  {event.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions : Annulation si statut EN_ATTENTE */}
        {reservation.status === 'PENDING' && (
          <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
            <div>
              <strong style={{ color: '#92400e' }}>Souhaitez-vous annuler cette demande ?</strong>
              <p style={{ fontSize: '0.8rem', color: '#b45309' }}>
                Tant que la demande est en attente, vous pouvez l'annuler librement sans aucun frais.
              </p>
            </div>
            <CancelReservationButton reservationId={reservation.id} />
          </div>
        )}
      </div>
    </div>
  );
}
