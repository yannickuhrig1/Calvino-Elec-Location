import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import { Calendar as CalendarIcon, Clock, Truck, CheckCircle2, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function AdminCalendrierPage() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  // Récupérer les réservations actives ou à venir
  const reservations = await prisma.reservation.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
      endDate: { gte: addDays(today, -7) },
    },
    orderBy: { startDate: 'asc' },
    include: {
      equipment: true,
      unit: true,
    },
  });

  // Tableau des 14 prochains jours
  const days = Array.from({ length: 14 }).map((_, i) => addDays(weekStart, i));

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-navy)' }}>
          Planning & Calendrier des sorties
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Vue chronologique des réservations en cours et programmées sur le parc matériel.
        </p>
      </div>

      {/* Liste des réservations dans le planning */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          Mouvements de matériels ({reservations.length} dossiers)
        </h2>

        {reservations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Aucun mouvement programmé sur cette période.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reservations.map((res) => (
              <div
                key={res.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-light)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: res.status === 'IN_PROGRESS' ? '#eff6ff' : res.status === 'CONFIRMED' ? '#ecfdf5' : '#fffbeb',
                      color: res.status === 'IN_PROGRESS' ? '#1d4ed8' : res.status === 'CONFIRMED' ? '#047857' : '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {res.status === 'IN_PROGRESS' ? <Truck size={20} /> : <CalendarIcon size={20} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: 'var(--brand-navy)' }}>{res.equipment.name}</strong>
                      {res.unit && (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {res.unit.internalCode}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Client : {res.customerName} {res.customerCompany ? `(${res.customerCompany})` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                      Du {format(res.startDate, 'dd MMM', { locale: fr })} au {format(res.endDate, 'dd MMM yyyy', { locale: fr })}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {res.deliveryMode === 'DELIVERY_ON_SITE' ? 'Livraison sur chantier' : 'Retrait agence'}
                    </span>
                  </div>

                  <StatusBadge status={res.status} />

                  <Link href={`/admin/reservations/${res.id}`} className="btn btn-outline btn-sm">
                    <span>Détails</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
