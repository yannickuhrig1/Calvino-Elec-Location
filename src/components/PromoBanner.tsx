'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check, Tag, X, ArrowRight } from 'lucide-react';

interface Promo {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  bannerHighlight: string | null;
}

export function PromoBanner() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/promotions')
      .then((res) => res.json())
      .then((data) => {
        if (data.promotions && data.promotions.length > 0) {
          const bannerPromos = data.promotions.filter((p: any) => p.showInBanner);
          setPromos(bannerPromos.length > 0 ? bannerPromos : [data.promotions[0]]);
        }
      })
      .catch((e) => console.error('Error fetching promo banner:', e));
  }, []);

  if (dismissed || promos.length === 0) {
    return null;
  }

  const promo = promos[0];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderBottom: '1px solid rgba(217, 119, 6, 0.3)',
        position: 'relative',
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.25rem',
          fontSize: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: 'var(--brand-amber)',
              color: '#ffffff',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Sparkles size={12} />
            <span>Promo en cours</span>
          </span>

          <span style={{ fontWeight: 600, color: '#f8fafc' }}>
            {promo.bannerHighlight || promo.description || `Profitez d'une remise immédiate avec le code ${promo.code}`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => handleCopy(promo.code)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#1e293b',
              border: '1px dashed var(--brand-amber)',
              color: '#fef3c7',
              padding: '0.3rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Cliquez pour copier le code"
          >
            {copiedCode === promo.code ? (
              <>
                <Check size={14} style={{ color: '#10b981' }} />
                <span style={{ color: '#10b981' }}>Copié !</span>
              </>
            ) : (
              <>
                <Tag size={13} style={{ color: 'var(--brand-amber)' }} />
                <span>{promo.code}</span>
                <Copy size={12} style={{ opacity: 0.7 }} />
              </>
            )}
          </button>

          <Link
            href="/materiels"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--brand-amber-light)',
              fontWeight: 600,
              fontSize: '0.8rem',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            <span>En profiter</span>
            <ArrowRight size={13} />
          </Link>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
            }}
            title="Masquer"
            aria-label="Fermer le bandeau"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
