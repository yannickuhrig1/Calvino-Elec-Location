import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { AdminStatusManager } from './AdminStatusManager';
import { ReservationEmailHub } from './ReservationEmailHub';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  Calendar, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Lock,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

interface AdminDetailPageProps {
  params: { id: string };
}

export default async function AdminReservationDetailPage({ params }: AdminDetailPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/connexion');
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: params.id },
    include: {
      equipment: {
        include: {
          units: true,
          category: true,
        },
      },
      unit: true,
    },
  });

  if (!reservation) {
    notFound();
  }

  // Vérifier pour chaque unité physique si elle est libre sur cette période
  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      equipmentId: reservation.equipmentId,
      id: { not: reservation.id },
      status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
      startDate: { lte: reservation.endDate },
      endDate: { gte: reservation.startDate },
    },
    select: { unitId: true },
  });

  const occupiedUnitIds = new Set(
    overlappingReservations.map((r) => r.unitId).filter((id): id is string => id !== null)
  );

  const unitOptions = reservation.equipment.units.map((u) => {
    const isOccupied = occupiedUnitIds.has(u.id);
    const inMaintenance = u.status === 'MAINTENANCE' || u.status === 'OUT_OF_SERVICE';
    const isAvailableOnDates = !isOccupied && !inMaintenance;

    return {
      id: u.id,
      internalCode: u.internalCode,
      status: u.status,
      serialNumber: u.serialNumber,
      isAvailableOnDates,
    };
  });

  const history = JSON.parse(reservation.statusHistoryJson || '[]');

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/reservations" className="btn btn-outline btn-sm">
          <ArrowLeft size={14} />
          <span>Retour aux réservations</span>
        </Link>
      </div>

      {/* En-tête Dossier */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
                Dossier {reservation.reservationNumber}
              </span>
              <span className="badge badge-info">{reservation.equipment.category.name}</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--brand-navy)' }}>
              {reservation.equipment.name}
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Reçue le {format(reservation.createdAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <StatusBadge status={reservation.status} />
            {reservation.unit && (
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-navy)', marginTop: '0.35rem' }}>
                Unité assignée : {reservation.unit.internalCode}
              </div>
            )}
          </div>
        </div>

        {/* Actions Rapides Métier : Contrat, Facture, État des Lieux */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: '#0F172A',
          borderRadius: 'var(--radius-md)',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F8FAFC', fontSize: '0.85rem', fontWeight: 700 }}>
            <span>Documents officiels & inspections :</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link
              href={`/admin/reservations/${reservation.id}/contrat`}
              style={{
                backgroundColor: reservation.contractSignedAt ? '#059669' : '#D97706',
                color: '#FFF',
                padding: '0.45rem 0.9rem',
                borderRadius: '0.35rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>📄 Contrat & Signature {reservation.contractSignedAt ? '✓' : ''}</span>
            </Link>
            <Link
              href={`/admin/reservations/${reservation.id}/facture`}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFF',
                padding: '0.45rem 0.9rem',
                borderRadius: '0.35rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>🧾 Facture PDF</span>
            </Link>
            <Link
              href={`/admin/reservations/${reservation.id}/etat-des-lieux`}
              style={{
                backgroundColor: '#1E293B',
                color: '#E2E8F0',
                border: '1px solid #334155',
                padding: '0.45rem 0.9rem',
                borderRadius: '0.35rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>📸 État des Lieux & Photos</span>
            </Link>
            <a
              href="#centre-emails"
              style={{
                backgroundColor: '#3B82F6',
                color: '#FFF',
                padding: '0.45rem 0.9rem',
                borderRadius: '0.35rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>📧 Centre d'Emails</span>
            </a>
          </div>
        </div>

        {/* Coordonnées Client */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', backgroundColor: 'var(--bg-surface-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Client / Entreprise
            </div>
            <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{reservation.customerName}</div>
            {reservation.customerCompany && (
              <div style={{ fontSize: '0.85rem', color: 'var(--brand-slate)' }}>{reservation.customerCompany}</div>
            )}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {reservation.customerAddress} {reservation.customerPostalCode} {reservation.customerCity}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Contact
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--brand-navy)', fontWeight: 600 }}>
              <a href={`tel:${reservation.customerPhone}`}>{reservation.customerPhone}</a>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--brand-blue-accent)' }}>
              <a href={`mailto:${reservation.customerEmail}`}>{reservation.customerEmail}</a>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Dates & Créneaux
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
              Du {format(reservation.startDate, 'dd/MM/yyyy')} à {reservation.pickupTime}
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
              Au {format(reservation.endDate, 'dd/MM/yyyy')} à {reservation.returnTime}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({reservation.rentalDays} jours)</span>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Mise à disposition
            </div>
            <div style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
              {reservation.deliveryMode === 'DELIVERY_ON_SITE' ? 'Livraison sur chantier' : 'Retrait à l’agence'}
            </div>
            {reservation.deliveryAddress && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {reservation.deliveryAddress}
              </div>
            )}
          </div>
        </div>

        {reservation.customerNotes && (
          <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', backgroundColor: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
            <strong>Remarque du client :</strong> {reservation.customerNotes}
          </div>
        )}
      </div>

      {/* COMPOSANT DE PILOTAGE DU STATUT (Confirmation, remise, restitution) */}
      <div style={{ marginBottom: '2rem' }}>
        <AdminStatusManager
          reservation={{
            id: reservation.id,
            reservationNumber: reservation.reservationNumber,
            status: reservation.status,
            unitId: reservation.unitId,
            depositAmount: reservation.depositAmount,
            adminNotes: reservation.adminNotes,
          }}
          units={unitOptions}
        />
      </div>

      {/* Centre d'Emails et Notifications Transactionnelles */}
      <div id="centre-emails">
        <ReservationEmailHub
          reservationId={reservation.id}
          customerEmail={reservation.customerEmail}
          customerName={reservation.customerName}
          reservationNumber={reservation.reservationNumber}
        />
      </div>

      {/* Détail financier contractuel */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          Décomposition financière contractuelle (Figée)
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Loyer matériel ({reservation.rentalDays} jours) :</span>
            <span>{reservation.basePrice.toFixed(2)} € HT</span>
          </div>

          {reservation.deliveryFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Forfait livraison / reprise chantier :</span>
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

          <div style={{ marginTop: '0.75rem', padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Caution réglementaire :</span>
              <span style={{ color: 'var(--brand-amber-hover)' }}>{reservation.depositAmount.toFixed(0)} €</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Non encaissée • Empreinte CB ou chèque d’entreprise conservé jusqu’au retour.
            </div>
          </div>
        </div>
      </div>

      {/* Journal d'audit complet */}
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          Journal d'audit et historique des transitions
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
    </div>
  );
}
