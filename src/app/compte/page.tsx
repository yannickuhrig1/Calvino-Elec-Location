import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Truck, 
  FileText, 
  ChevronRight, 
  Plus, 
  Building, 
  Phone, 
  MapPin,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function ComptePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/connexion');
  }

  // Si l'utilisateur est ADMIN, on peut lui proposer une redirection ou lien vers /admin
  const reservations = await prisma.reservation.findMany({
    where: {
      OR: [
        { userId: user.id },
        { customerEmail: user.email.toLowerCase() },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      equipment: true,
      unit: true,
    },
  });

  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length;
  const activeCount = reservations.filter((r) => r.status === 'CONFIRMED' || r.status === 'IN_PROGRESS').length;
  const completedCount = reservations.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        {/* En-tête profil */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '2.2rem', color: 'var(--brand-navy)' }}>
                Espace Client • {user.firstName} {user.lastName}
              </h1>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="badge badge-info" style={{ fontSize: '0.8rem' }}>
                  Accéder au panel Admin →
                </Link>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {user.company ? `${user.company} • ` : ''}{user.email} {user.phone ? `• ${user.phone}` : ''}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/materiels" className="btn btn-primary">
              <Plus size={16} />
              <span>Nouvelle réservation</span>
            </Link>
            <Link href="/compte/profil" className="btn btn-outline">
              <span>Modifier mon profil</span>
            </Link>
          </div>
        </div>

        {/* 3 Cartes de métriques */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-amber)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Demandes en attente
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
                  {pendingCount}
                </div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
            </div>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
              Examen par l'agence sous 2h ouvrées
            </span>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-blue-accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Locations actives
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
                  {activeCount}
                </div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={24} />
              </div>
            </div>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
              Confirmées ou sorties sur chantier
            </span>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Locations terminées
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem' }}>
                  {completedCount}
                </div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
              Matériel restitué et caution libérée
            </span>
          </div>
        </div>

        {/* Liste des réservations du client */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header">
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)' }}>
              Historique de vos réservations ({reservations.length})
            </h2>
          </div>

          {reservations.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <Calendar size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Aucune réservation enregistrée</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Trouvez le matériel adapté à votre prochain chantier en quelques clics.
              </p>
              <Link href="/materiels" className="btn btn-primary">
                Consulter le catalogue
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Réf. & Date</th>
                    <th>Matériel</th>
                    <th>Période</th>
                    <th>Mise à disposition</th>
                    <th>Total TTC</th>
                    <th>Statut</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((res) => (
                    <tr key={res.id}>
                      <td>
                        <strong style={{ color: 'var(--brand-navy)', display: 'block' }}>{res.reservationNumber}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {format(res.createdAt, 'dd/MM/yyyy')}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={res.equipment.imageUrl}
                            alt={res.equipment.name}
                            style={{ width: '44px', height: '44px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <div>
                            <Link href={`/materiels/${res.equipment.slug}`} style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
                              {res.equipment.name}
                            </Link>
                            {res.unit && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Unité : {res.unit.internalCode}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          Du {format(res.startDate, 'dd/MM/yy')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Au {format(res.endDate, 'dd/MM/yy')} ({res.rentalDays} j)
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.85rem' }}>
                          {res.deliveryMode === 'DELIVERY_ON_SITE' ? 'Livraison chantier' : 'Retrait agence'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                          {res.totalAmount.toFixed(2)} €
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Caution : {res.depositAmount.toFixed(0)} €
                        </span>
                      </td>

                      <td>
                        <StatusBadge status={res.status} />
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/compte/reservations/${res.id}`} className="btn btn-outline btn-sm">
                          <span>Détails</span>
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
    </div>
  );
}
