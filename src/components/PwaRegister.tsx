'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, Check, Share } from 'lucide-react';

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Enregistrement du Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker actif, scope:', registration.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // 2. Vérifier si l'application est déjà lancée en mode autonome (PWA installée)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) {
      return;
    }

    // 3. Détecter iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 4. Intercepter l'événement d'installation natif (Android / Chrome)
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // N'afficher que si l'utilisateur n'a pas déjà fermé la bannière dans les dernières 48h
      const dismissedAt = localStorage.getItem('calvino_pwa_dismissed');
      if (!dismissedAt || Date.now() - parseInt(dismissedAt, 10) > 48 * 3600 * 1000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Si sur iOS et pas installé, proposer discrètement après 3 secondes
    if (isIosDevice && !isStandaloneMode) {
      const dismissedAt = localStorage.getItem('calvino_pwa_dismissed');
      if (!dismissedAt || Date.now() - parseInt(dismissedAt, 10) > 48 * 3600 * 1000) {
        const timer = setTimeout(() => setShowPrompt(true), 3500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('calvino_pwa_dismissed', Date.now().toString());
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        left: '20px',
        maxWidth: '440px',
        margin: '0 auto',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '14px 18px',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        zIndex: 9999,
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <img
          src="/icon-192.png"
          alt="Calvino Location Icon"
          style={{ width: '42px', height: '42px', borderRadius: '9px', border: '1px solid #475569' }}
        />
        <div style={{ fontSize: '13px', lineHeight: 1.35 }}>
          <strong style={{ display: 'block', color: '#f8fafc', fontSize: '14px' }}>
            Installer CALVINO Location
          </strong>
          {isIos ? (
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>
              Touchez <Share size={12} style={{ display: 'inline', margin: '0 2px' }} /> puis <strong>« Sur l'écran d'accueil »</strong>
            </span>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>
              Accès rapide hors-ligne et gestion de vos réservations
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!isIos && deferredPrompt && (
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <Download size={14} />
            <span>Installer</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
