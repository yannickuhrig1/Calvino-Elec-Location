'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Wrench, 
  Menu, 
  X, 
  User, 
  ShieldCheck, 
  LogOut, 
  Search, 
  Calendar, 
  HelpCircle, 
  PhoneCall,
  FileCheck
} from 'lucide-react';

interface HeaderClientProps {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  } | null;
}

export function HeaderClient({ user }: HeaderClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (e) {
      console.error(e);
    }
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      {/* Bandeau d'information et de transparence démo */}
      <div className="demo-badge-banner">
        <span className="demo-badge-pill">Mode Démonstration</span>
        <span>
          Calvino Location • Matériel professionnel de chantier & bricolage • Devis en temps réel & validation sous 2h ouvrées
        </span>
      </div>

      <header className="site-header">
        <div className={`${pathname.startsWith('/admin') ? 'container-admin' : 'container'} header-inner`}>
          {/* Logo Calvino Location */}
          <Link href="/" className="brand-logo-link" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-mark">
              <Wrench size={24} />
            </div>
            <div className="brand-text-col">
              <span className="brand-name">
                CALVINO <span>LOCATION</span>
              </span>
              <span className="brand-baseline">Location Matériel & Engins</span>
            </div>
          </Link>

          {/* Navigation Bureau */}
          <nav className="nav-links">
            <Link 
              href="/materiels" 
              className={`nav-link ${isActive('/materiels') ? 'active' : ''}`}
            >
              Matériels & Tarifs
            </Link>
            <Link 
              href="/presentation" 
              className={`nav-link ${isActive('/presentation') ? 'active' : ''}`}
              style={{ color: '#d97706', fontWeight: 700 }}
            >
              Présentation & Admin
            </Link>
            <Link 
              href="/comment-ca-marche" 
              className={`nav-link ${isActive('/comment-ca-marche') ? 'active' : ''}`}
            >
              Comment ça marche
            </Link>
            <Link 
              href="/tarifs-et-conditions" 
              className={`nav-link ${isActive('/tarifs-et-conditions') ? 'active' : ''}`}
            >
              Conditions & Caution
            </Link>
            <Link 
              href="/zone-intervention-moselle" 
              className={`nav-link ${isActive('/zone-intervention-moselle') ? 'active' : ''}`}
            >
              Zone Moselle 57
            </Link>
            <Link 
              href="/contact" 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            >
              Contact & Agence
            </Link>
          </nav>

          {/* Actions & Profil */}
          <div className="header-actions">
            <Link 
              href="/suivi" 
              className="btn btn-outline btn-sm"
              title="Suivre une réservation avec votre code secret"
            >
              <FileCheck size={16} />
              <span>Suivi direct</span>
            </Link>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {user.role === 'ADMIN' ? (
                  <Link href="/admin" className="btn btn-primary btn-sm">
                    <ShieldCheck size={16} />
                    <span>Admin</span>
                  </Link>
                ) : (
                  <Link href="/compte" className="btn btn-outline btn-sm">
                    <User size={16} />
                    <span>Mon Compte ({user.firstName})</span>
                  </Link>
                )}

                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.4rem 0.5rem' }}
                  title="Déconnexion"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link href="/connexion" className="btn btn-dark btn-sm">
                  <User size={16} />
                  <span>Connexion</span>
                </Link>
              </div>
            )}

            {/* Menu burger mobile */}
            <button
              className="btn btn-outline btn-sm"
              style={{ display: 'none' }}
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant si ouvert */}
        {mobileMenuOpen && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#ffffff', 
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <Link href="/materiels" onClick={() => setMobileMenuOpen(false)} className="nav-link">
              Matériels & Tarifs
            </Link>
            <Link href="/presentation" onClick={() => setMobileMenuOpen(false)} className="nav-link" style={{ color: '#d97706', fontWeight: 700 }}>
              Présentation & Admin
            </Link>
            <Link href="/comment-ca-marche" onClick={() => setMobileMenuOpen(false)} className="nav-link">
              Comment ça marche
            </Link>
            <Link href="/tarifs-et-conditions" onClick={() => setMobileMenuOpen(false)} className="nav-link">
              Conditions & Caution
            </Link>
            <Link href="/zone-intervention-moselle" onClick={() => setMobileMenuOpen(false)} className="nav-link">
              Zone Moselle 57 & Livraison
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="nav-link">
              Contact & Agence
            </Link>
            <Link href="/suivi" onClick={() => setMobileMenuOpen(false)} className="nav-link">
              Suivi direct de réservation
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
