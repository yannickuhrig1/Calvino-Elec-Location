'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Send, 
  Eye, 
  Check, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Loader2, 
  X, 
  Smartphone, 
  Laptop,
  CheckCircle2
} from 'lucide-react';

interface Props {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  reservationNumber: string;
}

type EmailType = 'CONFIRMATION' | 'REMINDER_RETURN' | 'COMPLETION' | 'ADMIN_ALERT';

export function ReservationEmailHub({
  reservationId,
  customerEmail,
  customerName,
  reservationNumber,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sendingType, setSendingType] = useState<EmailType | 'CUSTOM' | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Aperçu
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedPreviewType, setSelectedPreviewType] = useState<EmailType>('CONFIRMATION');
  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Message personnalisé
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customSubject, setCustomSubject] = useState(`[Calvino Location] Information concernant votre dossier ${reservationNumber}`);
  const [customMessage, setCustomMessage] = useState('');

  // Charger les aperçus
  const loadPreviews = async () => {
    setLoadingPreview(true);
    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/email`);
      if (res.ok) {
        const data = await res.json();
        setPreviewData(data);
      }
    } catch (err) {
      console.error('Erreur chargement aperçus email:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleOpenPreview = async (type: EmailType) => {
    setSelectedPreviewType(type);
    setPreviewModalOpen(true);
    if (!previewData) {
      await loadPreviews();
    }
  };

  const handleSendEmail = async (type: EmailType) => {
    setSendingType(type);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailType: type }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’envoi');
      }

      setFeedback({
        type: 'success',
        message: data.message || 'Email transmis avec succès !',
      });
      router.refresh();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Impossible d’envoyer l’email.',
      });
    } finally {
      setSendingType(null);
    }
  };

  const handleSendCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingType('CUSTOM');
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/reservations/${reservationId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType: 'CUSTOM',
          customSubject,
          customMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l’envoi');
      }

      setFeedback({
        type: 'success',
        message: data.message || 'Message personnalisé transmis avec succès !',
      });
      setCustomModalOpen(false);
      setCustomMessage('');
      router.refresh();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Impossible d’envoyer le message.',
      });
    } finally {
      setSendingType(null);
    }
  };

  const currentPreview = previewData?.previews?.[selectedPreviewType];

  return (
    <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={20} style={{ color: 'var(--brand-amber)' }} />
            <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-navy)', margin: 0 }}>
              Centre d'Emails & Notifications Automatisées
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
            Destinataire client : <strong>{customerName}</strong> ({customerEmail})
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCustomModalOpen(true)}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Send size={14} />
          <span>Écrire un message personnalisé</span>
        </button>
      </div>

      {feedback && (
        <div 
          className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}
          style={{ marginBottom: '1.25rem' }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Cartes d'action email */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        
        {/* 1. Confirmation */}
        <div style={{
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ color: '#059669' }} />
              <strong style={{ fontSize: '0.95rem', color: 'var(--brand-navy)' }}>Confirmation de Réservation</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Envoie la validation formelle, les dates/heures, l'adresse de retrait, la liste des pièces justificatives et le lien de signature du contrat en ligne.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => handleOpenPreview('CONFIRMATION')}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
            >
              <Eye size={13} style={{ marginRight: '4px' }} />
              Aperçu
            </button>
            <button
              type="button"
              disabled={sendingType !== null}
              onClick={() => handleSendEmail('CONFIRMATION')}
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2, padding: '0.4rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#059669', borderColor: '#059669' }}
            >
              {sendingType === 'CONFIRMATION' ? <Loader2 size={13} className="spin" /> : <Send size={13} style={{ marginRight: '4px' }} />}
              Envoyer
            </button>
          </div>
        </div>

        {/* 2. Rappel de Restitution */}
        <div style={{
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Clock size={18} style={{ color: '#d97706' }} />
              <strong style={{ fontSize: '0.95rem', color: 'var(--brand-navy)' }}>Rappel Restitution 24h</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Rappelle au client la date et l'heure limite de retour, avec checklist (nettoyage machine, plein carburant/batterie, restitution de tous les accessoires).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => handleOpenPreview('REMINDER_RETURN')}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
            >
              <Eye size={13} style={{ marginRight: '4px' }} />
              Aperçu
            </button>
            <button
              type="button"
              disabled={sendingType !== null}
              onClick={() => handleSendEmail('REMINDER_RETURN')}
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2, padding: '0.4rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#d97706', borderColor: '#d97706' }}
            >
              {sendingType === 'REMINDER_RETURN' ? <Loader2 size={13} className="spin" /> : <Send size={13} style={{ marginRight: '4px' }} />}
              Envoyer
            </button>
          </div>
        </div>

        {/* 3. Facture & Clôture */}
        <div style={{
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: '#2563eb' }} />
              <strong style={{ fontSize: '0.95rem', color: 'var(--brand-navy)' }}>Facture & Clôture Caution</strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Transmet la facture officielle acquittée (FAC-2026-XXXX), notifie l'annulation de l'empreinte de caution et invite le client à déposer un avis positif.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => handleOpenPreview('COMPLETION')}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
            >
              <Eye size={13} style={{ marginRight: '4px' }} />
              Aperçu
            </button>
            <button
              type="button"
              disabled={sendingType !== null}
              onClick={() => handleSendEmail('COMPLETION')}
              className="btn btn-primary btn-sm"
              style={{ flex: 1.2, padding: '0.4rem 0.5rem', fontSize: '0.8rem', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
            >
              {sendingType === 'COMPLETION' ? <Loader2 size={13} className="spin" /> : <Send size={13} style={{ marginRight: '4px' }} />}
              Envoyer
            </button>
          </div>
        </div>

      </div>

      {/* Modal d'Aperçu Email */}
      {previewModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: previewDevice === 'desktop' ? '800px' : '440px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            transition: 'max-width 0.3s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #1e293b'
            }}>
              <div>
                <strong style={{ fontSize: '1rem', display: 'block' }}>
                  Aperçu Email : {previewData?.previews?.[selectedPreviewType]?.title || 'Chargement...'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Objet : {previewData?.previews?.[selectedPreviewType]?.subject}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    style={{
                      backgroundColor: previewDevice === 'desktop' ? '#334155' : 'transparent',
                      color: '#ffffff',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Vue Ordinateur"
                  >
                    <Laptop size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    style={{
                      backgroundColor: previewDevice === 'mobile' ? '#334155' : 'transparent',
                      color: '#ffffff',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Vue Smartphone"
                  >
                    <Smartphone size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Onglets sélecteur de template */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '0.5rem 1rem', gap: '0.5rem', overflowX: 'auto' }}>
              {(['CONFIRMATION', 'REMINDER_RETURN', 'COMPLETION', 'ADMIN_ALERT'] as EmailType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedPreviewType(t)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: selectedPreviewType === t ? '#0f172a' : '#e2e8f0',
                    color: selectedPreviewType === t ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t === 'CONFIRMATION' && '1. Confirmation'}
                  {t === 'REMINDER_RETURN' && '2. Rappel 24h'}
                  {t === 'COMPLETION' && '3. Facture & Clôture'}
                  {t === 'ADMIN_ALERT' && '4. Alerte Admin'}
                </button>
              ))}
            </div>

            {/* Modal Body / Iframe Email Content */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f1f5f9', padding: '1rem', minHeight: '380px' }}>
              {loadingPreview ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: '#64748b' }}>
                  <Loader2 size={24} className="spin" />
                  <span>Génération de l'aperçu...</span>
                </div>
              ) : currentPreview ? (
                <iframe
                  srcDoc={currentPreview.html}
                  style={{
                    width: '100%',
                    height: '480px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                  }}
                  title="Aperçu Email"
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Impossible de charger l'aperçu.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Destinataire : <strong>{currentPreview?.recipient}</strong>
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  disabled={sendingType !== null}
                  onClick={() => {
                    handleSendEmail(selectedPreviewType);
                    setPreviewModalOpen(false);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                >
                  <Send size={13} style={{ marginRight: '4px' }} />
                  Envoyer cet email maintenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Message Personnalisé */}
      {customModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '560px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <form onSubmit={handleSendCustomEmail}>
              <div style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <strong style={{ fontSize: '1.05rem' }}>Envoyer un message au client</strong>
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Destinataire</label>
                  <input
                    type="text"
                    disabled
                    className="form-input"
                    value={`${customerName} <${customerEmail}>`}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Objet du message</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label">Votre message</label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Bonjour, nous vous informons que le matériel sera prêt dès 08h00..."
                    required
                  />
                </div>
              </div>

              <div style={{
                padding: '1rem 1.5rem',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem'
              }}>
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={sendingType === 'CUSTOM'}
                  className="btn btn-primary btn-sm"
                >
                  {sendingType === 'CUSTOM' ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
                  <span>Envoyer au client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
