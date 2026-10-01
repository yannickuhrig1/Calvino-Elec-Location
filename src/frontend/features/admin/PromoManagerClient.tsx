'use client';

import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Sparkles, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  Percent, 
  Coins, 
  AlertCircle,
  CheckCircle2,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minAmountHt: number | null;
  minRentalDays: number | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string | null;
  active: boolean;
  showInBanner: boolean;
  bannerHighlight: string | null;
  createdAt: string;
  _count?: {
    reservations: number;
  };
}

interface PromoManagerClientProps {
  initialPromoCodes: PromoCode[];
  stats: {
    totalCodes: number;
    activeCodes: number;
    totalUses: number;
    totalDiscountGiven: number;
  };
}

export function PromoManagerClient({ initialPromoCodes, stats: initialStats }: PromoManagerClientProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [stats, setStats] = useState(initialStats);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Formulaire de création
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('10');
  const [minAmountHt, setMinAmountHt] = useState('');
  const [minRentalDays, setMinRentalDays] = useState('1');
  const [maxUses, setMaxUses] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [showInBanner, setShowInBanner] = useState(false);
  const [bannerHighlight, setBannerHighlight] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const refreshData = async () => {
    try {
      const res = await fetch('/api/admin/promotions');
      if (res.ok) {
        const data = await res.json();
        setPromoCodes(data.promoCodes);
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !current }),
      });
      if (res.ok) {
        showToast('success', `Code promo ${!current ? 'activé' : 'désactivé'}.`);
        refreshData();
      }
    } catch (e) {
      showToast('error', 'Erreur lors de la modification.');
    }
  };

  const handleToggleBanner = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showInBanner: !current }),
      });
      if (res.ok) {
        showToast('success', !current ? 'Code affiché dans le bandeau public !' : 'Code retiré du bandeau.');
        refreshData();
      }
    } catch (e) {
      showToast('error', 'Erreur lors de la modification.');
    }
  };

  const handleDelete = async (id: string, promoCodeStr: string) => {
    if (!confirm(`Confirmer la suppression du code promo "${promoCodeStr}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('success', 'Code promo supprimé.');
        refreshData();
      }
    } catch (e) {
      showToast('error', 'Erreur lors de la suppression.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          description,
          discountType,
          discountValue: parseFloat(discountValue),
          minAmountHt: minAmountHt ? parseFloat(minAmountHt) : null,
          minRentalDays: minRentalDays ? parseInt(minRentalDays, 10) : null,
          maxUses: maxUses ? parseInt(maxUses, 10) : null,
          validUntil: validUntil || null,
          showInBanner,
          bannerHighlight,
          active: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création.');
      }

      showToast('success', `Code promo ${code} créé avec succès !`);
      setShowCreateModal(false);
      // Reset form
      setCode('');
      setDescription('');
      setDiscountValue('10');
      setMinAmountHt('');
      setMinRentalDays('1');
      setMaxUses('');
      setValidUntil('');
      setShowInBanner(false);
      setBannerHighlight('');
      refreshData();
    } catch (err: any) {
      showToast('error', err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: notification.type === 'success' ? '#047857' : '#b91c1c',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: 'var(--shadow-xl)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Titre et Bouton Créer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--brand-navy)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            Promotions & Codes Avantages
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Gestion des remises commerciales, bandeau promotionnel public et analyse des retombées.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          <Plus size={18} />
          <span>Créer un Code Promo</span>
        </button>
      </div>

      {/* 4 Indicateurs Clés */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem 1.6rem', borderLeft: '5px solid var(--brand-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Codes Actifs
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem', lineHeight: 1.1 }}>
                {stats.activeCodes} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {stats.totalCodes}</span>
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Campagnes promotionnelles en vigueur
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem 1.6rem', borderLeft: '5px solid var(--brand-blue-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Utilisations Totales
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.25rem', lineHeight: 1.1 }}>
                {stats.totalUses}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Réservations ayant bénéficié d'une offre
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem 1.6rem', borderLeft: '5px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Remises Accordées
              </span>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#047857', marginTop: '0.25rem', lineHeight: 1.1 }}>
                {stats.totalDiscountGiven.toFixed(2)} €
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total HT économisé par vos clients
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem 1.6rem', borderLeft: '5px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bandeau Public
              </span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '0.65rem' }}>
                {promoCodes.some((p) => p.active && p.showInBanner) ? (
                  <span style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Eye size={18} />
                    <span>Actif en ligne</span>
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <EyeOff size={18} />
                    <span>Masqué</span>
                  </span>
                )}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f3e8ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Diffusion en tête de toutes les pages
          </div>
        </div>
      </div>

      {/* Tableau des Codes Promos */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={18} style={{ color: 'var(--brand-amber)' }} />
            <h2 style={{ fontSize: '1.15rem', color: 'var(--brand-navy)', margin: 0, fontWeight: 700 }}>
              Liste des codes promotionnels ({promoCodes.length})
            </h2>
          </div>
        </div>

        {promoCodes.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucun code promo créé pour l'instant. Cliquez sur le bouton ci-dessus pour lancer votre première offre.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Code promo</th>
                  <th>Réduction</th>
                  <th>Conditions</th>
                  <th>Utilisations</th>
                  <th>Validité</th>
                  <th>Bandeau Public</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((promo) => (
                  <tr key={promo.id}>
                    {/* Code promo */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-navy)', backgroundColor: '#f1f5f9', padding: '0.35rem 0.65rem', borderRadius: '4px', letterSpacing: '0.05em' }}>
                          {promo.code}
                        </code>
                        {promo.showInBanner && (
                          <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.7rem', fontWeight: 700 }}>
                            ⭐ En vedette
                          </span>
                        )}
                      </div>
                      {promo.description && (
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '280px' }}>
                          {promo.description}
                        </div>
                      )}
                    </td>

                    {/* Réduction */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#047857' }}>
                        {promo.discountType === 'PERCENTAGE' ? (
                          <span>-{promo.discountValue} %</span>
                        ) : (
                          <span>-{promo.discountValue.toFixed(2)} € HT</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        sur le loyer matériel
                      </span>
                    </td>

                    {/* Conditions */}
                    <td>
                      <div style={{ fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {promo.minRentalDays ? (
                          <span>• Dès {promo.minRentalDays} jour{promo.minRentalDays > 1 ? 's' : ''}</span>
                        ) : (
                          <span>• Dès 1 jour</span>
                        )}
                        {promo.minAmountHt && (
                          <span>• Min. {promo.minAmountHt.toFixed(0)} € HT d'achat</span>
                        )}
                      </div>
                    </td>

                    {/* Utilisations */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
                        {promo.usedCount} fois
                      </div>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {promo.maxUses ? `Limite : ${promo.maxUses}` : 'Sans limite d’usage'}
                      </span>
                    </td>

                    {/* Validité */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {promo.validUntil ? (
                        <div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                            {format(new Date(promo.validUntil), 'dd/MM/yyyy')}
                          </div>
                          <span style={{ fontSize: '0.725rem', color: new Date(promo.validUntil) < new Date() ? '#b91c1c' : 'var(--text-muted)' }}>
                            {new Date(promo.validUntil) < new Date() ? 'Expiré' : 'Date limite'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Permanente</span>
                      )}
                    </td>

                    {/* Toggle Bandeau */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleBanner(promo.id, promo.showInBanner)}
                        className={`btn btn-sm ${promo.showInBanner ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '0.775rem', padding: '0.35rem 0.7rem' }}
                      >
                        {promo.showInBanner ? '⭐ Affiché' : 'Masqué'}
                      </button>
                    </td>

                    {/* Toggle Statut */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(promo.id, promo.active)}
                        className={`btn btn-sm ${promo.active ? 'btn-outline' : 'btn-dark'}`}
                        style={{ 
                          fontSize: '0.775rem', 
                          padding: '0.35rem 0.7rem',
                          color: promo.active ? '#047857' : undefined,
                          borderColor: promo.active ? '#a7f3d0' : undefined,
                          backgroundColor: promo.active ? '#ecfdf5' : undefined,
                        }}
                      >
                        {promo.active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(promo.id, promo.code)}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#b91c1c', borderColor: '#fecaca', padding: '0.35rem 0.6rem' }}
                        title="Supprimer ce code promo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Création Code Promo */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '2rem',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={20} style={{ color: 'var(--brand-amber)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                  Nouveau Code Promotionnel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Code promotionnel (ex: BIENVENUE10, CHANTIER50)</label>
                <input
                  type="text"
                  required
                  placeholder="EXEMPLE15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 800 }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description commerciale</label>
                <input
                  type="text"
                  placeholder="Ex : -10% sur toute la flotte pour votre première location"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Type de réduction</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="PERCENTAGE">Pourcentage (%)</option>
                    <option value="FIXED_AMOUNT">Montant fixe (€ HT)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Valeur de la remise</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="10"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="form-input"
                    />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {discountType === 'PERCENTAGE' ? '%' : '€ HT'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Durée min. (jours)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={minRentalDays}
                    onChange={(e) => setMinRentalDays(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Montant min. HT (€)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Facultatif (ex: 150)"
                    value={minAmountHt}
                    onChange={(e) => setMinAmountHt(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nombre max d'utilisations</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Illimité"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date limite d'expiration</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Option Bandeau Public */}
              <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={showInBanner}
                    onChange={(e) => setShowInBanner(e.target.checked)}
                  />
                  <span>Afficher en vedette dans le bandeau supérieur public</span>
                </label>
                {showInBanner && (
                  <div style={{ marginTop: '0.65rem' }}>
                    <input
                      type="text"
                      placeholder="Texte accroche bandeau (ex : Offre Flash : -10% avec le code...)"
                      value={bannerHighlight}
                      onChange={(e) => setBannerHighlight(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.825rem' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Création en cours...' : 'Créer et activer le code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
