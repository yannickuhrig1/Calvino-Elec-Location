'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle, Check } from 'lucide-react';
import { EquipmentFinancialStats } from '@/backend/accounting/accountingService';

interface ModalProps {
  equipment: EquipmentFinancialStats | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EquipmentFinancialModal({ equipment, onClose, onSuccess }: ModalProps) {
  const [price, setPrice] = useState(equipment ? equipment.purchasePriceHt.toString() : '0');
  const [years, setYears] = useState(equipment ? equipment.amortizationYears.toString() : '3');
  const [date, setDate] = useState(
    equipment?.purchaseDate ? new Date(equipment.purchaseDate).toISOString().slice(0, 10) : '2026-09-01'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!equipment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/equipment/${equipment.equipmentId}/financials`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchasePriceHt: parseFloat(price) || 0,
          amortizationYears: parseInt(years, 10) || 3,
          purchaseDate: date,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--brand-navy)', marginBottom: '0.2rem' }}>
              Paramètres Financiers
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {equipment.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-full)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Check size={16} />
              <span>Données financières mises à jour avec succès !</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--brand-slate)',
                  marginBottom: '0.4rem',
                }}
              >
                Prix d'acquisition HT (€) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Facture / Devis MaxOutil)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}
                >
                  € HT
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--brand-slate)',
                    marginBottom: '0.4rem',
                  }}
                >
                  Durée d'amortissement
                </label>
                <select
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="input"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  <option value="3">3 ans (Électroportatif)</option>
                  <option value="5">5 ans (Compresseur, HP)</option>
                  <option value="2">2 ans</option>
                  <option value="4">4 ans</option>
                  <option value="7">7 ans</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--brand-slate)',
                    marginBottom: '0.4rem',
                  }}
                >
                  Date de mise en service
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                  }}
                />
              </div>
            </div>

            {/* Aperçu du recalcul en temps réel */}
            <div
              style={{
                padding: '0.85rem',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                Simulateur d'amortissement automatique :
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Dotation mensuelle :</span>
                <strong>
                  {years && price
                    ? ((parseFloat(price) || 0) / (parseInt(years, 10) || 3) / 12).toFixed(2)
                    : 0}{' '}
                  € HT / mois
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Nouveau seuil de rentabilité :</span>
                <strong>
                  {price && equipment.priceDay > 0
                    ? Math.ceil((parseFloat(price) || 0) / equipment.priceDay)
                    : 0}{' '}
                  jours de location (à {equipment.priceDay} € HT/j)
                </strong>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-outline btn-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Save size={15} />
              <span>{loading ? 'Enregistrement...' : 'Valider les modifications'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
