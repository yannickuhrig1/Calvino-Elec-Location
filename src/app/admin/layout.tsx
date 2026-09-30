import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileText, 
  Wrench, 
  Layers, 
  Calendar, 
  Users, 
  Settings, 
  ArrowLeft,
  Clock,
  Sparkles
} from 'lucide-react';
import { AdminNavClient } from './AdminNavClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/connexion');
  }

  if (user.role !== 'ADMIN') {
    redirect('/compte');
  }

  // Nombre de demandes en attente pour badge alerte
  const pendingCount = await prisma.reservation.count({
    where: { status: 'PENDING' },
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', backgroundColor: '#f1f5f9' }}>
      {/* Barre supérieure Admin */}
      <div style={{ backgroundColor: 'var(--brand-navy)', color: '#ffffff', padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="container-admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-pending" style={{ fontSize: '0.75rem' }}>
              Console d'Administration
            </span>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Connecté en tant que <strong>{user.firstName} {user.lastName}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" className="btn btn-outline btn-sm" style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)', fontSize: '0.8rem' }}>
              <ArrowLeft size={14} />
              <span>Voir le site public</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-admin" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
          {/* Menu latéral gauche Admin */}
          <aside className="card" style={{ padding: '1rem', backgroundColor: '#ffffff', position: 'sticky', top: '90px' }}>
            <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Gestion Calvino Location
              </div>
            </div>

            <AdminNavClient pendingCount={pendingCount} />
          </aside>

          {/* Contenu principal de la page admin */}
          <main style={{ minWidth: 0 }}>{children}</main>
        </div>
      </div>
    </div>
  );
}
