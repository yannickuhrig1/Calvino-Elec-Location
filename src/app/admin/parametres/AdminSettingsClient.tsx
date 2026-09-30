'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle, Loader2, Save } from 'lucide-react';

interface Props {
  initialSettings: {
    companyName: string;
    phone: string;
    email: string;
    address: string;
    openingHoursJson: string;
    depositPolicy: string;
    deliveryPolicy: string;
    siret: string;
    tvaIntra: string;
    rcsCity: string;
    assuranceRcp: string;
  };
}

export function AdminSettingsClient({ initialSettings }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: initialSettings.companyName || '',
    phone: initialSettings.phone || '',
    email: initialSettings.email || '',
    address: initialSettings.address || '',
    depositPolicy: initialSettings.depositPolicy || '',
    deliveryPolicy: initialSettings.deliveryPolicy || '',
    siret: initialSettings.siret || '',
    tvaIntra: initialSettings.tvaIntra || '',
    rcsCity: initialSettings.rcsCity || '',
    assuranceRcp: initialSettings.assuranceRcp || '',
  });

  const [hours, setHours] = useState(() => {
    try {
      return JSON.parse(initialSettings.openingHoursJson || '{}');
    } catch {
      return {};
    }
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          openingHoursJson: JSON.stringify(hours),
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la sauvegarde des paramètres');
      }

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          <Check size={18} />
          <span>Paramètres de l'agence mis à jour avec succès.</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Identité commerciale */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          Coordonnées officielles de l'agence
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Raison sociale / Nom commercial</label>
            <input
              type="text"
              className="form-input"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Téléphone atelier / standard</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Courriel commercial</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Adresse du dépôt principal</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      {/* Mentions Légales & Fiscales */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          Mentions Légales & Fiscales (Factures & Contrats de location)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Numéro SIRET (14 chiffres)</label>
            <input
              type="text"
              className="form-input"
              value={formData.siret}
              onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
              placeholder="918 642 984 00018"
            />
          </div>

          <div className="form-group">
            <label className="form-label">N° TVA Intracommunautaire</label>
            <input
              type="text"
              className="form-input"
              value={formData.tvaIntra}
              onChange={(e) => setFormData({ ...formData, tvaIntra: e.target.value })}
              placeholder="FR84918642984"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Greffe d'immatriculation (RCS)</label>
            <input
              type="text"
              className="form-input"
              value={formData.rcsCity}
              onChange={(e) => setFormData({ ...formData, rcsCity: e.target.value })}
              placeholder="Ex : Metz"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assurance Responsabilité Civile Pro (RCP / Décennale)</label>
            <input
              type="text"
              className="form-input"
              value={formData.assuranceRcp}
              onChange={(e) => setFormData({ ...formData, assuranceRcp: e.target.value })}
              placeholder="Ex : Police Allianz Pro BTP n° 58493021"
            />
          </div>
        </div>
      </div>

      {/* Horaires d'ouverture */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          Horaires d'ouverture par jour
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map((jour) => (
            <div key={jour} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ textTransform: 'capitalize' }}>{jour}</label>
              <input
                type="text"
                className="form-input"
                value={hours[jour] || ''}
                onChange={(e) => setHours({ ...hours, [jour]: e.target.value })}
                placeholder="Ex : 07h30 - 18h30 ou Fermé"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Politiques contractuelles */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '1.25rem' }}>
          Politique de caution & Modalités de livraison
        </h2>

        <div className="form-group">
          <label className="form-label">Texte explicatif de la politique de caution</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={formData.depositPolicy}
            onChange={(e) => setFormData({ ...formData, depositPolicy: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Modalités et zones de livraison</label>
          <textarea
            className="form-textarea"
            rows={2}
            value={formData.deliveryPolicy}
            onChange={(e) => setFormData({ ...formData, deliveryPolicy: e.target.value })}
          />
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
        {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
        <span>Enregistrer les paramètres de l'agence</span>
      </button>
    </form>
  );
}
