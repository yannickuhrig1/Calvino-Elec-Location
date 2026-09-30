import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { UnitStatusChanger } from './UnitStatusChanger';
import { Layers, Wrench, Clock, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminUnitesPage() {
  const units = await prisma.equipmentUnit.findMany({
    orderBy: { internalCode: 'asc' },
    include: {
      equipment: true,
      reservations: {
        where: {
          status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        },
        orderBy: { endDate: 'desc' },
        take: 1,
      },
    },
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--brand-navy)' }}>
            Parc d’unités physiques ({units.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Suivi individuel par numéro de série, état d’entretien et affectation de chaque engin.
          </p>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Code interne</th>
                <th>Modèle / Modèle constructeur</th>
                <th>N° de série</th>
                <th>Heures / Entretien</th>
                <th>Affectation actuelle</th>
                <th>Statut du parc</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => {
                const currentRes = unit.reservations[0];
                return (
                  <tr key={unit.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <code style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-navy)', backgroundColor: '#e2e8f0', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                        {unit.internalCode}
                      </code>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                        {unit.equipment.name}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {unit.equipment.brand} • {unit.equipment.model}
                      </span>
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                        {unit.serialNumber || 'Non renseigné'}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {unit.meterHours !== null && unit.meterHours !== undefined ? (
                          <strong>{unit.meterHours} h</strong>
                        ) : (
                          '-'
                        )}
                      </div>
                      {unit.notes && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', maxWidth: '320px', marginTop: '0.2rem' }}>
                          {unit.notes}
                        </span>
                      )}
                    </td>

                    <td>
                      {currentRes ? (
                        <div style={{ fontSize: '0.85rem' }}>
                          <Link href={`/admin/reservations/${currentRes.id}`} style={{ fontWeight: 700, color: 'var(--brand-blue-accent)' }}>
                            {currentRes.reservationNumber}
                          </Link>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {currentRes.customerName}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aucune location active</span>
                      )}
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      <UnitStatusChanger unitId={unit.id} currentStatus={unit.status} />
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
