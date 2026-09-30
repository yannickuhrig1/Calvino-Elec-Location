import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  ChevronRight, 
  Wrench, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Building,
  TrendingUp,
  Receipt,
  Coins,
  FileSpreadsheet
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    pendingReservations,
    inProgressReservations,
    confirmedReservations,
    completedReservations,
    allUnits,
    allEquipments,
  ] = await Promise.all([
    prisma.reservation.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        equipment: true,
      },
    }),
    prisma.reservation.findMany({
      where: { status: 'IN_PROGRESS' },
      orderBy: { endDate: 'asc' },
      include: {
        equipment: true,
        unit: true,
      },
    }),
    prisma.reservation.findMany({
      where: { status: 'CONFIRMED' },
      orderBy: { startDate: 'asc' },
      include: {
        equipment: true,
        unit: true,
      },
    }),
    prisma.reservation.findMany({
      where: { status: 'COMPLETED' },
      include: {
        equipment: true,
      },
    }),
    prisma.equipmentUnit.findMany({
      include: { equipment: true },
    }),
    prisma.equipment.findMany({
      where: { published: true },
    }),
  ]);

  const allEquipmentsCount = allEquipments.length;
  const totalFleetValueHt = allEquipments.reduce((sum, e) => sum + (e.purchasePriceHt || 0), 0);
  const validReservations = [...inProgressReservations, ...confirmedReservations, ...completedReservations];
  const totalCaEncaisseHt = validReservations.reduce((sum, r) => sum + (r.basePrice || 0) + (r.deliveryFee || 0) - (r.promoDiscountAmount || 0), 0);
  const totalTvaCollectee = validReservations.reduce((sum, r) => sum + (r.taxAmount || 0), 0);

  const unitsInMaintenance = allUnits.filter((u) => u.status === 'MAINTENANCE').length;
  const unitsAvailable = allUnits.filter((u) => u.status === 'AVAILABLE').length;
  const unitsRented = allUnits.filter((u) => u.status === 'RENTED').length;

  return (
    <div>
      {/* Titre Dashboard */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--brand-navy)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            Tableau de bord de gestion
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Supervision en temps réel des réservations, de l'état du parc matériel et de la flotte d'engins.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/admin/reservations" className="btn btn-outline btn-sm">
            Toutes les réservations ({pendingReservations.length + inProgressReservations.length + confirmedReservations.length})
          </Link>
          <Link href="/admin/unites" className="btn btn-primary btn-sm">
            <Layers size={15} />
            <span>Voir le parc ({allUnits.length} unités)</span>
          </Link>
        </div>
      </div>

      {/* 4 Indicateurs Clés - Disposés de manière aérée */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem 1.6rem', borderLeft: '5px solid var(--brand-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Demandes en attente
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: pendingReservations.length > 0 ? '#b45309' : 'var(--brand-navy)', marginTop: '0.25rem', lineHeight: 1.1 }}>
                {pendingReservations.length}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: pendingReservations.length > 0 ? '#b45309' : 'var(--text-muted)', fontWeight: 600 }}>
            <span>Prioritaire : validation sous 2h</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem 1.6rem', borderLeft: '5px solid var(--brand-blue-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sur chantier (En cours)
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem', lineHeight: 1.1 }}>
                {inProgressReservations.length}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Truck size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Matériels actuellement déployés</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem 1.6rem', borderLeft: '5px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Confirmées à venir
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem', lineHeight: 1.1 }}>
                {confirmedReservations.length}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Unités affectées prêtes au départ</span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem 1.6rem', borderLeft: '5px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Parc en maintenance
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: unitsInMaintenance > 0 ? '#b91c1c' : 'var(--brand-navy)', marginTop: '0.25rem', lineHeight: 1.1 }}>
                {unitsInMaintenance}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Sur {allUnits.length} unités physiques du parc</span>
          </div>
        </div>
      </div>

      {/* SECTION FINANCIÈRE & COMPTABILITÉ : Accès Rapide MaxOutil & Facturation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Module Rentabilité */}
        <div
          className="card"
          style={{
            padding: '1.4rem 1.6rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--brand-navy)', margin: 0 }}>
                    Rentabilité & Amortissements
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Parc Matériel MaxOutil : {totalFleetValueHt.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € HT
                  </span>
                </div>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                9 machines
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Suivi des seuils de rentabilité (Break-even), dotations mensuelles et identification des machines Stars vs sous-exploitées.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--brand-navy)', fontWeight: 600 }}>
              Calcul linéaire 3 & 5 ans
            </span>
            <Link
              href="/admin/rentabilite"
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              <span>Consulter le bilan</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Module Comptabilité & Factures */}
        <div
          className="card"
          style={{
            padding: '1.4rem 1.6rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--brand-navy)', margin: 0 }}>
                    Comptabilité & Factures
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    CA Validé : {totalCaEncaisseHt.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € HT
                  </span>
                </div>
              </div>
              <span className="badge badge-confirmed" style={{ fontSize: '0.7rem' }}>
                TVA 20%
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
              Journal des écritures conforme PCG (411000, 706000, 708500, 445710), export en 1 clic pour Sage/EBP/Pennylane et vue imprimable bancaire.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--brand-navy)', fontWeight: 600 }}>
              Exports CSV & TVA
            </span>
            <Link
              href="/admin/comptabilite"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
            >
              <span>Accéder au journal</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION PRIORITAIRE : Demandes EN ATTENTE */}
      <div className="card" style={{ marginBottom: '2.5rem', overflow: 'hidden' }}>
        <div className="card-header" style={{ backgroundColor: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '1.15rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', color: '#92400e', fontWeight: 700, margin: 0 }}>
                Demandes en attente d'approbation ({pendingReservations.length})
              </h2>
            </div>
          </div>
          <span style={{ fontSize: '0.825rem', color: '#b45309', fontWeight: 600, backgroundColor: '#fef3c7', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
            Validation humaine & assignation machine sous 2h ouvrées
          </span>
        </div>

        {pendingReservations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brand-navy)' }}>Toutes les demandes ont été traitées !</p>
            <p style={{ fontSize: '0.875rem' }}>Aucune réservation en attente dans la file actuelle.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Réf. & Date reçue</th>
                  <th>Client & Contact</th>
                  <th>Matériel demandé</th>
                  <th>Période & Durée</th>
                  <th>Mode mise à disposition</th>
                  <th>Total TTC & Caution</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingReservations.map((res) => (
                  <tr key={res.id}>
                    {/* Réf & Date */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge" style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.85rem', backgroundColor: '#e2e8f0', color: 'var(--brand-navy)', padding: '0.3rem 0.6rem' }}>
                        {res.reservationNumber}
                      </span>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={12} />
                        <span>{format(res.createdAt, 'dd/MM/yyyy à HH:mm')}</span>
                      </div>
                    </td>

                    {/* Client & Contact */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                          {res.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '0.95rem' }}>{res.customerName}</div>
                          {res.customerCompany && (
                            <div style={{ fontSize: '0.775rem', color: 'var(--brand-slate-light)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                              <Building size={12} />
                              <span>{res.customerCompany}</span>
                            </div>
                          )}
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            {res.customerPhone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Matériel */}
                    <td>
                      <Link href={`/admin/reservations/${res.id}`} style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '0.95rem', display: 'inline-block' }}>
                        {res.equipment.name}
                      </Link>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Tarif catalogue : {res.equipment.priceDay.toFixed(2)} € HT/j
                      </div>
                    </td>

                    {/* Période & Durée */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--brand-navy)', fontSize: '0.875rem' }}>
                        <Calendar size={14} style={{ color: 'var(--brand-amber)' }} />
                        <span>Du {format(res.startDate, 'dd/MM/yyyy')} au {format(res.endDate, 'dd/MM/yyyy')}</span>
                      </div>
                      <div style={{ marginTop: '0.35rem' }}>
                        <span className="badge" style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.725rem', fontWeight: 700 }}>
                          {res.rentalDays} jour{res.rentalDays > 1 ? 's' : ''} de location
                        </span>
                      </div>
                    </td>

                    {/* Mode mise à disposition */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {res.deliveryMode === 'DELIVERY_ON_SITE' ? (
                        <span className="badge badge-in-progress" style={{ fontSize: '0.775rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.65rem' }}>
                          <Truck size={13} />
                          <span>Livraison sur chantier</span>
                        </span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#f8fafc', color: 'var(--brand-slate)', fontSize: '0.775rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-medium)', padding: '0.35rem 0.65rem' }}>
                          <Building size={13} />
                          <span>Retrait à l'agence</span>
                        </span>
                      )}
                    </td>

                    {/* Total & Caution */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                        {res.totalAmount.toFixed(2)} € <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TTC</span>
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#b45309', fontWeight: 600, marginTop: '0.2rem' }}>
                        Caution : {res.depositAmount.toFixed(0)} €
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link href={`/admin/reservations/${res.id}`} className="btn btn-primary btn-sm" style={{ padding: '0.55rem 1.1rem', fontSize: '0.825rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Traiter</span>
                        <ChevronRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grille 2 colonnes : Locations en cours & État du parc */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        {/* Locations actuellement sur chantier */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '1.15rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} style={{ color: 'var(--brand-blue-accent)' }} />
              <h2 style={{ fontSize: '1.1rem', color: 'var(--brand-navy)', margin: 0, fontWeight: 700 }}>
                Locations en cours sur chantier ({inProgressReservations.length})
              </h2>
            </div>
            <Link href="/admin/reservations?status=IN_PROGRESS" style={{ fontSize: '0.825rem', color: 'var(--brand-blue-accent)', fontWeight: 600 }}>
              Voir tout ({inProgressReservations.length}) →
            </Link>
          </div>

          {inProgressReservations.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Aucun matériel actuellement sorti sur chantier.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Unité & Matériel</th>
                    <th>Client & Contact</th>
                    <th>Retour prévu</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inProgressReservations.map((res) => (
                    <tr key={res.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.825rem', fontWeight: 800, color: 'var(--brand-blue-accent)', backgroundColor: 'var(--brand-blue-light)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {res.unit?.internalCode || 'Non assigné'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)' }}>
                          {res.equipment.name}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--brand-navy)' }}>{res.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{res.customerPhone}</div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--brand-navy)', fontSize: '0.875rem' }}>
                          <Calendar size={13} style={{ color: 'var(--brand-blue)' }} />
                          <span>{format(res.endDate, 'dd/MM/yyyy')}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          à {res.returnTime}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Link href={`/admin/reservations/${res.id}`} className="btn btn-outline btn-sm">
                          <span>Gérer</span>
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* État synthétique du parc matériel */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--brand-navy)', margin: 0, fontWeight: 700 }}>
              État du parc matériel ({allUnits.length} unités)
            </h2>
            <Link href="/admin/unites" style={{ fontSize: '0.8rem', color: 'var(--brand-blue-accent)', fontWeight: 600 }}>
              Inventaire complet →
            </Link>
          </div>

          {/* Barre de répartition visuelle du parc */}
          <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--border-light)', marginBottom: '0.65rem' }}>
              <div style={{ width: `${(unitsAvailable / allUnits.length) * 100}%`, backgroundColor: '#10b981' }} title={`Disponibles : ${unitsAvailable}`} />
              <div style={{ width: `${(unitsRented / allUnits.length) * 100}%`, backgroundColor: '#2563eb' }} title={`Sur chantier : ${unitsRented}`} />
              <div style={{ width: `${(confirmedReservations.length / allUnits.length) * 100}%`, backgroundColor: '#f59e0b' }} title={`Réservées : ${confirmedReservations.length}`} />
              <div style={{ width: `${(unitsInMaintenance / allUnits.length) * 100}%`, backgroundColor: '#ef4444' }} title={`Maintenance : ${unitsInMaintenance}`} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span style={{ color: '#047857' }}>● {unitsAvailable} disponibles</span>
              <span style={{ color: '#1d4ed8' }}>● {unitsRented} sorties</span>
              <span style={{ color: '#b45309' }}>● {confirmedReservations.length} réservées</span>
              <span style={{ color: '#b91c1c' }}>● {unitsInMaintenance} atelier</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 600, fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} />
                <span>Unités disponibles au dépôt</span>
              </div>
              <strong style={{ color: '#047857', fontSize: '1.15rem' }}>{unitsAvailable}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8', fontWeight: 600, fontSize: '0.875rem' }}>
                <Truck size={16} />
                <span>Unités louées sur le terrain</span>
              </div>
              <strong style={{ color: '#1d4ed8', fontSize: '1.15rem' }}>{unitsRented}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 600, fontSize: '0.875rem' }}>
                <Clock size={16} />
                <span>Unités réservées à venir</span>
              </div>
              <strong style={{ color: '#b45309', fontSize: '1.15rem' }}>{confirmedReservations.length}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontWeight: 600, fontSize: '0.875rem' }}>
                <AlertTriangle size={16} />
                <span>En révision / maintenance</span>
              </div>
              <strong style={{ color: '#b91c1c', fontSize: '1.15rem' }}>{unitsInMaintenance}</strong>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
            <Link href="/admin/unites" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
              <Layers size={15} />
              <span>Gérer les statuts individuels des machines</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
