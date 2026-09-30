import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Filter, ChevronRight, Calendar, User, Phone } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

interface ReservationsPageProps {
  searchParams: {
    status?: string;
    q?: string;
  };
}

export default async function AdminReservationsPage({ searchParams }: ReservationsPageProps) {
  const statusFilter = searchParams.status || 'ALL';
  const query = searchParams.q?.trim() || '';

  const where: any = {};

  if (statusFilter !== 'ALL') {
    where.status = statusFilter;
  }

  if (query) {
    where.OR = [
      { reservationNumber: { contains: query } },
      { customerName: { contains: query } },
      { customerEmail: { contains: query } },
      { customerPhone: { contains: query } },
    ];
  }

  const [reservations, counts] = await Promise.all([
    prisma.reservation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        equipment: true,
        unit: true,
      },
    }),
    prisma.reservation.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  const countMap: Record<string, number> = {};
  counts.forEach((c) => {
    countMap[c.status] = c._count;
  });

  const totalCount = Object.values(countMap).reduce((a, b) => a + b, 0);

  const tabs = [
    { key: 'ALL', label: 'Toutes', count: totalCount },
    { key: 'PENDING', label: 'En attente', count: countMap['PENDING'] || 0, badge: 'badge-pending' },
    { key: 'CONFIRMED', label: 'Confirmées', count: countMap['CONFIRMED'] || 0, badge: 'badge-confirmed' },
    { key: 'IN_PROGRESS', label: 'Sur chantier', count: countMap['IN_PROGRESS'] || 0, badge: 'badge-in-progress' },
    { key: 'COMPLETED', label: 'Terminées', count: countMap['COMPLETED'] || 0, badge: 'badge-completed' },
    { key: 'CANCELLED', label: 'Annulées', count: countMap['CANCELLED'] || 0 },
    { key: 'REJECTED', label: 'Refusées', count: countMap['REJECTED'] || 0 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--brand-navy)' }}>
            Gestion des réservations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Traitement des demandes, attribution des engins et suivi du cycle de vie.
          </p>
        </div>
      </div>

      {/* Onglets de filtrage par statut */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        {tabs.map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/admin/reservations?status=${tab.key}${query ? `&q=${query}` : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: active ? 700 : 500,
                color: active ? '#ffffff' : 'var(--brand-slate)',
                backgroundColor: active ? 'var(--brand-navy)' : '#ffffff',
                border: '1px solid',
                borderColor: active ? 'var(--brand-navy)' : 'var(--border-light)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-surface-subtle)',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Recherche textuelle */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.75rem', backgroundColor: '#ffffff' }}>
        <form method="GET" action="/admin/reservations" style={{ display: 'flex', gap: '0.75rem' }}>
          <input type="hidden" name="status" value={statusFilter} />
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Rechercher par référence (CALV-...), nom de client, email ou téléphone..."
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn btn-dark">
            Rechercher
          </button>
        </form>
      </div>

      {/* Table des réservations */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {reservations.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucune réservation trouvée pour ces critères.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Réf. & Reçue</th>
                  <th>Client</th>
                  <th>Matériel & Unité</th>
                  <th>Période</th>
                  <th>Mode</th>
                  <th>Total TTC</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge" style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem', backgroundColor: '#e2e8f0', color: 'var(--brand-navy)', padding: '0.3rem 0.55rem' }}>
                        {res.reservationNumber}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                        {format(res.createdAt, 'dd/MM/yyyy')}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{res.customerName}</div>
                      {res.customerCompany && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-slate-light)' }}>{res.customerCompany}</div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{res.customerPhone}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>{res.equipment.name}</div>
                      {res.unit ? (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                          Unité : {res.unit.internalCode}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, display: 'inline-block', marginTop: '0.2rem' }}>
                          ⚠️ Unité non assignée
                        </span>
                      )}
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                        Du {format(res.startDate, 'dd/MM/yy')} au {format(res.endDate, 'dd/MM/yy')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Durée : {res.rentalDays} j
                      </div>
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      {res.deliveryMode === 'DELIVERY_ON_SITE' ? (
                        <span className="badge badge-in-progress" style={{ fontSize: '0.75rem' }}>
                          Livraison
                        </span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                          Dépôt
                        </span>
                      )}
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--brand-navy)', fontSize: '0.95rem' }}>{res.totalAmount.toFixed(2)} €</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Caution : {res.depositAmount.toFixed(0)} €
                      </div>
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      <StatusBadge status={res.status} />
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link href={`/admin/reservations/${res.id}`} className="btn btn-outline btn-sm">
                        <span>Traiter</span>
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
