import React from 'react';
import prisma from '@/backend/db/prisma';
import { Users, Mail, Phone, Building, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { reservations: true },
      },
    },
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-navy)' }}>
          Répertoire des clients inscrits ({users.length})
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Visualisation des comptes clients et de leur historique de location.
        </p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Client</th>
                <th>Société</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Inscrit le</th>
                <th>Rôle</th>
                <th>Réservations</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong style={{ color: 'var(--brand-navy)' }}>
                      {u.firstName} {u.lastName}
                    </strong>
                    {u.city && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        {u.city} {u.postalCode ? `(${u.postalCode})` : ''}
                      </span>
                    )}
                  </td>

                  <td>
                    {u.company ? (
                      <span style={{ fontWeight: 600 }}>{u.company}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Particulier</span>
                    )}
                  </td>

                  <td>
                    <a href={`mailto:${u.email}`} style={{ color: 'var(--brand-blue-accent)' }}>
                      {u.email}
                    </a>
                  </td>

                  <td>
                    {u.phone ? (
                      <a href={`tel:${u.phone}`}>{u.phone}</a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>

                  <td>
                    <span style={{ fontSize: '0.85rem' }}>
                      {format(u.createdAt, 'dd/MM/yyyy')}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-confirmed' : 'badge-neutral'}`}>
                      {u.role}
                    </span>
                  </td>

                  <td>
                    <strong style={{ color: 'var(--brand-navy)' }}>
                      {u._count.reservations}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
