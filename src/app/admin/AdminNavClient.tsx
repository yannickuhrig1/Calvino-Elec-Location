'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Wrench, 
  Layers, 
  Calendar, 
  Users, 
  Settings,
  TrendingUp,
  Receipt,
  Tag
} from 'lucide-react';

interface NavProps {
  pendingCount: number;
}

export function AdminNavClient({ pendingCount }: NavProps) {
  const pathname = usePathname();

  const links = [
    {
      href: '/admin',
      label: 'Tableau de bord',
      icon: <LayoutDashboard size={18} />,
      exact: true,
    },
    {
      href: '/admin/reservations',
      label: 'Réservations',
      icon: <FileText size={18} />,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'badge-pending',
    },
    {
      href: '/admin/rentabilite',
      label: 'Rentabilité & Amortissements',
      icon: <TrendingUp size={18} />,
    },
    {
      href: '/admin/comptabilite',
      label: 'Comptabilité & Factures',
      icon: <Receipt size={18} />,
    },
    {
      href: '/admin/materiels',
      label: 'Matériels & Tarifs',
      icon: <Wrench size={18} />,
    },
    {
      href: '/admin/promotions',
      label: 'Promotions & Codes',
      icon: <Tag size={18} />,
    },
    {
      href: '/admin/unites',
      label: 'Parc d’unités physiques',
      icon: <Layers size={18} />,
    },
    {
      href: '/admin/calendrier',
      label: 'Calendrier des sorties',
      icon: <Calendar size={18} />,
    },
    {
      href: '/admin/clients',
      label: 'Clients inscrits',
      icon: <Users size={18} />,
    },
    {
      href: '/admin/parametres',
      label: 'Paramètres agence',
      icon: <Settings size={18} />,
    },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {links.map((link) => {
        const active = isLinkActive(link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: active ? 700 : 500,
              color: active ? '#ffffff' : 'var(--brand-slate)',
              backgroundColor: active ? 'var(--brand-navy)' : 'transparent',
              transition: 'all 0.15s ease',
              textDecoration: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ color: active ? 'var(--brand-amber)' : 'var(--text-muted)' }}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </div>

            {link.badge !== null && link.badge !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#f59e0b',
                  color: '#0f172a',
                }}
              >
                {link.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
