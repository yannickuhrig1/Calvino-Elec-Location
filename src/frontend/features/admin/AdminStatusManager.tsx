'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Truck, 
  CheckCheck, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Lock,
  Layers
} from 'lucide-react';

interface UnitOption {
  id: string;
  internalCode: string;
  status: string;
  serialNumber: string | null;
  isAvailableOnDates: boolean;
}

interface AdminStatusManagerProps {
  reservation: {
    id: string;
    reservationNumber: string;
    status: string;
    unitId: string | null;
    depositAmount: number;
    adminNotes: string | null;
  };
  units: UnitOption[];
}

export function AdminStatusManager({ reservation, units }: AdminStatusManagerProps) {
  const router = useRouter();
  const [selectedUnitId, setSelectedUnitId] = useState(reservation.unitId || '');
  const [adminNotes, setAdminNotes] = useState(reservation.adminNotes || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const availableUnits = units.filter((u) => u.isAvailableOnDates);

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === 'CONFIRMED' && !selectedUnitId) {
      setError('Veuillez sélectionner une unité physique à assigner pour confirmer la réservation.');
      return;
    }

    if ((newStatus === 'REJECTED' || newStatus === 'CANCELLED') && !reason.trim()) {
      setError('Veuillez obligatoirement indiquer un motif de refus ou d’annulation.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          unitId: selectedUnitId || undefined,
          adminNotes,
          reason: reason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      setShowRejectModal(false);
      setReason('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’opération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', borderTop: '4px solid var(--brand-amber)' }}>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Pilotage du cycle de vie de la réservation</span>
        <span className="badge badge-neutral">Statut : {reservation.status}</span>
      </h2>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {/* CAS 1 : Réservation EN ATTENTE (PENDING) */}
      {reservation.status === 'PENDING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', fontSize: '0.875rem', color: '#92400e' }}>
            Cette demande est actuellement <strong>EN ATTENTE</strong>. Pour la confirmer, veuillez sélectionner l'unité physique spécifique du parc qui sera préparée pour ce client.
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <span>Unité physique à assigner pour cette période : *</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ({availableUnits.length} libre{availableUnits.length > 1 ? 's' : ''})
              </span>
            </label>
            <select
              className="form-select"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              required
            >
              <option value="">-- Choisir une unité physique disponible --</option>
              {units.map((u) => (
                <option
                  key={u.id}
                  value={u.id}
                  disabled={!u.isAvailableOnDates && u.id !== reservation.unitId}
                >
                  {u.internalCode} {u.serialNumber ? `(S/N: ${u.serialNumber})` : ''} -{' '}
                  {u.isAvailableOnDates
                    ? 'DISPONIBLE'
                    : u.status === 'MAINTENANCE'
                    ? 'EN MAINTENANCE'
                    : 'OCCUPÉ SUR CES DATES'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Notes internes administrateur (facultatif)</label>
            <textarea
              className="form-textarea"
              placeholder="Ex : Vérifier flexible haute pression 20m, départ convenu à 8h..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleUpdateStatus('CONFIRMED')}
              disabled={loading || !selectedUnitId}
              className="btn btn-primary"
            >
              {loading ? <Loader2 size={16} className="spin" /> : <CheckCircle2 size={16} />}
              <span>Confirmer la réservation (Assigner unité)</span>
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="btn btn-outline"
              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
            >
              <XCircle size={16} />
              <span>Refuser la demande</span>
            </button>
          </div>
        </div>
      )}

      {/* CAS 2 : Réservation CONFIRMÉE (CONFIRMED) */}
      {reservation.status === 'CONFIRMED' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', fontSize: '0.875rem', color: '#065f46' }}>
            Réservation confirmée avec succès. Dès que le client se présente pour le retrait ou lors de la livraison sur chantier, validez l'état des lieux et enregistrez le départ.
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleUpdateStatus('IN_PROGRESS')}
              disabled={loading}
              className="btn btn-blue"
            >
              {loading ? <Loader2 size={16} className="spin" /> : <Truck size={16} />}
              <span>Enregistrer la remise (Départ chantier)</span>
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="btn btn-outline"
              style={{ color: '#b91c1c' }}
            >
              <XCircle size={16} />
              <span>Annuler la réservation</span>
            </button>
          </div>
        </div>
      )}

      {/* CAS 3 : Matériel sur chantier (IN_PROGRESS) */}
      {reservation.status === 'IN_PROGRESS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe', fontSize: '0.875rem', color: '#1e40af' }}>
            Matériel actuellement entre les mains du locataire. Lors de sa restitution au dépôt, procédez au contrôle de propreté/état et validez le retour.
          </div>

          <div>
            <button
              onClick={() => handleUpdateStatus('COMPLETED')}
              disabled={loading}
              className="btn btn-success"
            >
              {loading ? <Loader2 size={16} className="spin" /> : <CheckCheck size={16} />}
              <span>Valider la restitution & Libérer la caution ({reservation.depositAmount.toFixed(0)} €)</span>
            </button>
          </div>
        </div>
      )}

      {/* CAS 4 : TERMINÉE / ANNULÉE / REFUSÉE */}
      {(reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED' || reservation.status === 'REJECTED') && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Ce dossier est clôturé sous le statut <strong>{reservation.status}</strong>. Aucune action supplémentaire n’est requise.
        </div>
      )}

      {/* MODAL REFUS / ANNULATION */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#b91c1c', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} />
              <span>Motif de refus ou d’annulation</span>
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Ce motif sera archivé dans l'historique d'audit contractuel de la réservation.
            </p>

            <div className="form-group">
              <label className="form-label">Précisez le motif *</label>
              <textarea
                className="form-textarea"
                placeholder="Ex : Indisponibilité technique imprévue, délai de préparation insuffisant, justificatifs non conformes..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="btn btn-outline"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('REJECTED')}
                disabled={loading || !reason.trim()}
                className="btn btn-danger"
              >
                {loading ? <Loader2 size={16} className="spin" /> : <XCircle size={16} />}
                <span>Confirmer le refus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
