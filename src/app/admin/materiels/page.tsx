import React from 'react';
import Link from 'next/link';
import prisma from '@/backend/db/prisma';
import { Wrench, Plus, Check, X, ArrowRight, Eye, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminMaterielsPage() {
  const equipments = await prisma.equipment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      units: true,
      _count: {
        select: { reservations: true },
      },
    },
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--brand-navy)' }}>
            Catalogue des matériels & Tarifs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Gestion des fiches techniques, grilles tarifaires et état de publication.
          </p>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Matériel</th>
                <th>Catégorie</th>
                <th>Tarif Jour</th>
                <th>Week-end</th>
                <th>Caution</th>
                <th>Parc (Unités)</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Fiche publique</th>
              </tr>
            </thead>
            <tbody>
              {equipments.map((eq) => {
                const totalUnits = eq.units.length;
                const availableUnits = eq.units.filter((u) => u.status === 'AVAILABLE').length;

                return (
                  <tr key={eq.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={eq.imageUrl}
                          alt={eq.name}
                          style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ color: 'var(--brand-navy)', display: 'block' }}>{eq.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {eq.brand || 'Calvino'} • {eq.model || 'Standard'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        {eq.category.name}
                      </span>
                    </td>

                    <td>
                      <strong>{eq.priceDay.toFixed(2)} €</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> HT</span>
                    </td>

                    <td>
                      {eq.priceWeekend ? (
                        <span>{eq.priceWeekend.toFixed(2)} € HT</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--brand-amber-hover)' }}>
                        {eq.depositAmount.toFixed(0)} €
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: availableUnits > 0 ? '#047857' : '#b45309' }}>
                        {availableUnits} / {totalUnits} dispo.
                      </span>
                    </td>

                    <td>
                      {eq.published ? (
                        <span className="badge badge-confirmed" style={{ fontSize: '0.7rem' }}>
                          <Check size={11} />
                          En ligne
                        </span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          Brouillon
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/materiels/${eq.slug}`} target="_blank" className="btn btn-outline btn-sm" title="Voir la fiche client">
                        <Eye size={14} />
                        <span>Voir</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
