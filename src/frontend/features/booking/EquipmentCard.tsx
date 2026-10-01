import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Sparkles, Check, ArrowRight, Tag } from 'lucide-react';

interface EquipmentCardProps {
  equipment: {
    id: string;
    slug: string;
    name: string;
    summary: string;
    brand: string | null;
    model: string | null;
    imageUrl: string;
    priceDay: number;
    priceWeekend: number | null;
    priceWeek: number | null;
    depositAmount: number;
    pricingType: string;
    category: {
      name: string;
      slug: string;
    };
    unitsCount?: number;
    availableCount?: number;
  };
}

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const isAvailable = equipment.availableCount === undefined ? true : equipment.availableCount > 0;

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Photo du matériel */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '65%', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
        <img
          src={equipment.imageUrl}
          alt={equipment.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          loading="lazy"
        />
        
        {/* Badge Catégorie */}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span className="badge badge-info" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(239, 246, 255, 0.95)' }}>
            {equipment.category.name}
          </span>
        </div>

        {/* Badge Disponibilité */}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          {isAvailable ? (
            <span className="badge badge-confirmed" style={{ backgroundColor: 'rgba(236, 253, 245, 0.95)' }}>
              <Check size={12} />
              {equipment.availableCount !== undefined ? `${equipment.availableCount} dispo.` : 'En stock'}
            </span>
          ) : (
            <span className="badge badge-pending" style={{ backgroundColor: 'rgba(254, 243, 199, 0.95)' }}>
              Forte demande
            </span>
          )}
        </div>
      </div>

      {/* Contenu textuel */}
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
          {equipment.brand || 'Calvino Pro'} {equipment.model ? `• ${equipment.model}` : ''}
        </div>

        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          <Link href={`/materiels/${equipment.slug}`} style={{ color: 'var(--brand-navy)' }}>
            {equipment.name}
          </Link>
        </h3>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem', flexGrow: 1 }}>
          {equipment.summary}
        </p>

        {/* Tarifs et Caution */}
        <div style={{ 
          backgroundColor: 'var(--bg-surface-subtle)', 
          padding: '0.875rem 1rem', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '1rem',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Tarif journalier :
            </span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)' }}>
                {equipment.priceDay.toFixed(2)} €
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> HT / jour</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.35rem', borderTop: '1px dashed var(--border-light)' }}>
            <span>Caution (non débitée) :</span>
            <span style={{ fontWeight: 600, color: 'var(--brand-slate)' }}>{equipment.depositAmount.toFixed(0)} €</span>
          </div>

          {equipment.priceWeekend && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.2rem' }}>
              <span>Forfait Week-end :</span>
              <span style={{ fontWeight: 600, color: 'var(--brand-amber-hover)' }}>{equipment.priceWeekend.toFixed(2)} € HT</span>
            </div>
          )}
        </div>

        {/* Bouton d'action */}
        <Link 
          href={`/materiels/${equipment.slug}`} 
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          <span>Consulter & Réserver</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
