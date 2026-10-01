'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SignaturePadModal } from '@/frontend/features/contracts/SignaturePadModal';
import {
  ArrowLeft,
  Printer,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Fuel,
  Gauge,
  Sparkles,
  PenTool,
  Upload,
  X,
  ShieldCheck,
  Clock,
  Layers,
  FileText
} from 'lucide-react';

interface EtatDesLieuxClientViewProps {
  reservation: any;
}

export function EtatDesLieuxClientView({ reservation }: EtatDesLieuxClientViewProps) {
  const [activeTab, setActiveTab] = useState<'DEPART' | 'RETOUR'>('DEPART');
  
  // Données existantes sauvegardées
  const checkinData = reservation.checkinDataJson ? JSON.parse(reservation.checkinDataJson) : null;
  const checkoutData = reservation.checkoutDataJson ? JSON.parse(reservation.checkoutDataJson) : null;

  // État formulaire DÉPART
  const [fuelLevel, setFuelLevel] = useState<number>(checkinData?.fuelLevel || 100);
  const [meterHours, setMeterHours] = useState<string>(checkinData?.meterHours || reservation.unit?.meterHours?.toString() || '');
  const [cleanliness, setCleanliness] = useState<string>(checkinData?.cleanliness || 'IMPECCABLE');
  const [generalNotes, setGeneralNotes] = useState<string>(checkinData?.generalNotes || '');
  const [photos, setPhotos] = useState<string[]>(checkinData?.photos || []);
  const [checkinSignature, setCheckinSignature] = useState<string | null>(checkinData?.signature || null);

  // État formulaire RETOUR
  const [returnFuelLevel, setReturnFuelLevel] = useState<number>(checkoutData?.fuelLevel || 100);
  const [returnMeterHours, setReturnMeterHours] = useState<string>(checkoutData?.meterHours || '');
  const [returnCleanliness, setReturnCleanliness] = useState<string>(checkoutData?.cleanliness || 'IMPECCABLE');
  const [returnNotes, setReturnNotes] = useState<string>(checkoutData?.returnNotes || '');
  const [returnPhotos, setReturnPhotos] = useState<string[]>(checkoutData?.photos || []);
  const [depositDecision, setDepositDecision] = useState<string>(checkoutData?.depositDecision || 'FULL_REFUND');
  const [penaltyAmount, setPenaltyAmount] = useState<number>(checkoutData?.penaltyAmount || 0);
  const [checkoutSignature, setCheckoutSignature] = useState<string | null>(checkoutData?.signature || null);

  // Modals & UI
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signTarget, setSignTarget] = useState<'CHECKIN' | 'CHECKOUT'>('CHECKIN');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Gestion des photos (converties en base64 compressées légères)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isReturn = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          if (isReturn) {
            setReturnPhotos((prev) => [...prev, result]);
          } else {
            setPhotos((prev) => [...prev, result]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number, isReturn = false) => {
    if (isReturn) {
      setReturnPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setPhotos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleOpenSignature = (target: 'CHECKIN' | 'CHECKOUT') => {
    setSignTarget(target);
    setIsSignModalOpen(true);
  };

  const handleSaveSignature = (dataUrl: string) => {
    if (signTarget === 'CHECKIN') {
      setCheckinSignature(dataUrl);
    } else {
      setCheckoutSignature(dataUrl);
    }
  };

  const handleSubmitCheckin = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const payload = {
        type: 'CHECKIN',
        data: {
          fuelLevel,
          meterHours,
          cleanliness,
          generalNotes,
          photos,
          signature: checkinSignature,
        },
      };

      const res = await fetch(`/api/admin/reservations/${reservation.id}/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveMessage('État des lieux de DÉPART enregistré avec succès ! Le matériel est en cours de location.');
        setTimeout(() => setSaveMessage(null), 5000);
      } else {
        alert('Erreur lors de la sauvegarde.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitCheckout = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const payload = {
        type: 'CHECKOUT',
        data: {
          fuelLevel: returnFuelLevel,
          meterHours: returnMeterHours,
          cleanliness: returnCleanliness,
          returnNotes,
          photos: returnPhotos,
          depositDecision,
          penaltyAmount: depositDecision === 'PARTIAL_PENALTY' ? penaltyAmount : 0,
          signature: checkoutSignature,
        },
      };

      const res = await fetch(`/api/admin/reservations/${reservation.id}/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveMessage('État des lieux de RETOUR validé ! La location est clôturée et le matériel est réintégré au parc.');
        setTimeout(() => setSaveMessage(null), 5000);
      } else {
        alert('Erreur lors de la sauvegarde.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau.');
    } finally {
      setIsSaving(false);
    }
  };

  const includedAccessories = reservation.equipment.includedAccessoriesJson
    ? JSON.parse(reservation.equipment.includedAccessoriesJson)
    : [];

  return (
    <div>
      {/* BARRE D'OUTILS HAUTE */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1rem 1.5rem',
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href={`/admin/reservations/${reservation.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#94A3B8',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>Retour dossier</span>
          </Link>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F8FAFC' }}>
            Fiche d'État des Lieux Numérique & Photos
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href={`/admin/reservations/${reservation.id}/contrat`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#1E293B',
              color: '#E2E8F0',
              textDecoration: 'none',
              padding: '0.5rem 0.85rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid #334155'
            }}
          >
            <FileText size={15} />
            <span>Voir Contrat</span>
          </Link>

          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.5rem 1.1rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <Printer size={15} />
            <span>Imprimer PV</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="no-print" style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '0.5rem',
          color: '#065F46',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* SÉLECTEUR D'ONGLETS (Départ vs Retour) */}
      <div className="no-print" style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #E2E8F0',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('DEPART')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: activeTab === 'DEPART' ? '#0F172A' : '#F1F5F9',
            color: activeTab === 'DEPART' ? '#FFFFFF' : '#475569',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          <span>1. État des Lieux de DÉPART (Remise)</span>
          {checkinData ? (
            <span style={{ fontSize: '0.7rem', backgroundColor: '#059669', color: '#FFF', padding: '2px 6px', borderRadius: '4px' }}>✓ Complété</span>
          ) : (
            <span style={{ fontSize: '0.7rem', backgroundColor: '#D97706', color: '#FFF', padding: '2px 6px', borderRadius: '4px' }}>À faire</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('RETOUR')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: activeTab === 'RETOUR' ? '#0F172A' : '#F1F5F9',
            color: activeTab === 'RETOUR' ? '#FFFFFF' : '#475569',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          <span>2. État des Lieux de RETOUR (Restitution)</span>
          {checkoutData ? (
            <span style={{ fontSize: '0.7rem', backgroundColor: '#059669', color: '#FFF', padding: '2px 6px', borderRadius: '4px' }}>✓ Restitué</span>
          ) : (
            <span style={{ fontSize: '0.7rem', backgroundColor: '#64748B', color: '#FFF', padding: '2px 6px', borderRadius: '4px' }}>En attente</span>
          )}
        </button>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="card" style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
        {/* BANDEAU RÉCAP MATÉRIEL & CLIENT */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '1.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>
              Dossier {reservation.reservationNumber}
            </span>
            <h2 style={{ fontSize: '1.4rem', color: '#0F172A', margin: '0.2rem 0' }}>
              {reservation.equipment.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Unité assignée : <strong>{reservation.unit?.internalCode || 'Non attribuée'}</strong> • Client : <strong>{reservation.customerCompany || reservation.customerName}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <div>Caution sous garantie : <strong style={{ color: '#D97706', fontSize: '1.1rem' }}>{reservation.depositAmount} €</strong></div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Dates : {format(new Date(reservation.startDate), 'dd/MM')} au {format(new Date(reservation.endDate), 'dd/MM/yyyy')}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ONGLET 1 : DÉPART */}
        {/* ================================================================= */}
        {activeTab === 'DEPART' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gauge size={18} color="#2563EB" />
                <span>Niveau de Carburant / Énergie au départ</span>
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[100, 75, 50, 25, 0].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFuelLevel(lvl)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.35rem',
                      border: fuelLevel === lvl ? '2px solid #2563EB' : '1px solid #CBD5E1',
                      backgroundColor: fuelLevel === lvl ? '#EFF6FF' : '#FFFFFF',
                      color: fuelLevel === lvl ? '#1E40AF' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    {lvl === 100 ? 'Plein (100%)' : `${lvl}%`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Relevé Compteur Horaire (heures d'utilisation)
                </label>
                <input
                  type="text"
                  value={meterHours}
                  onChange={(e) => setMeterHours(e.target.value)}
                  placeholder="Ex : 24.5"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '0.35rem',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  État de propreté initial
                </label>
                <select
                  value={cleanliness}
                  onChange={(e) => setCleanliness(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '0.35rem',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="IMPECCABLE">Impeccable / Comme neuf</option>
                  <option value="PROPRE">Propre et entretenu</option>
                  <option value="POUSSIEREUX">Poussiéreux (usage normal)</option>
                </select>
              </div>
            </div>

            {/* ACCESSOIRES FOURNIS */}
            {includedAccessories.length > 0 && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Accessoires remis au client :
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {includedAccessories.map((acc: string, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                      <CheckCircle2 size={16} />
                      <span>{acc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PHOTOS DU MATÉRIEL */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Camera size={16} color="#2563EB" />
                  <span>Photos du Matériel au départ (Smartphone / PC)</span>
                </label>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '0.35rem',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}>
                  <Upload size={14} />
                  <span>Ajouter photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={(e) => handlePhotoUpload(e, false)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {photos.length === 0 ? (
                <div style={{
                  padding: '1.5rem',
                  border: '2px dashed #CBD5E1',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  color: '#94A3B8',
                  fontSize: '0.85rem',
                  backgroundColor: '#F8FAFC'
                }}>
                  📸 Prenez des photos des 4 côtés du matériel pour attester de son état initial.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {photos.map((p, idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', height: '110px', border: '1px solid #CBD5E1' }}>
                      <img src={p} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx, false)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(220, 38, 38, 0.85)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '9999px',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* REMARQUES */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Observations / Rayures pré-existantes éventuelles
              </label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Ex : Légère rayure sur le carter gauche sans incidence sur le fonctionnement."
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '0.35rem',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* SIGNATURE CLIENT DÉPART */}
            <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  Signature du Client au départ (Prise en charge) :
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenSignature('CHECKIN')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.35rem',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.775rem',
                    cursor: 'pointer',
                  }}
                >
                  <PenTool size={13} />
                  <span>{checkinSignature ? 'Modifier signature' : 'Faire signer'}</span>
                </button>
              </div>

              {checkinSignature ? (
                <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #E2E8F0' }}>
                  <img src={checkinSignature} alt="Signature départ" style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }} />
                  <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>✓ Signature enregistrée</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem', fontStyle: 'italic', padding: '0.75rem' }}>
                  En attente de signature tactile du client
                </div>
              )}
            </div>

            {/* BOUTON ENREGISTRER DÉPART */}
            <button
              type="button"
              onClick={handleSubmitCheckin}
              disabled={isSaving}
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)'
              }}
            >
              <CheckCircle2 size={18} />
              <span>{isSaving ? 'Enregistrement en cours...' : 'Valider & Enregistrer l\'État des Lieux de Départ'}</span>
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 2 : RETOUR */}
        {/* ================================================================= */}
        {activeTab === 'RETOUR' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gauge size={18} color="#059669" />
                <span>Niveau de Carburant / Énergie restitué</span>
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[100, 75, 50, 25, 0].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setReturnFuelLevel(lvl)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.35rem',
                      border: returnFuelLevel === lvl ? '2px solid #059669' : '1px solid #CBD5E1',
                      backgroundColor: returnFuelLevel === lvl ? '#ECFDF5' : '#FFFFFF',
                      color: returnFuelLevel === lvl ? '#065F46' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    {lvl === 100 ? 'Plein (100%)' : `${lvl}%`}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Relevé Compteur Horaire au Retour
                </label>
                <input
                  type="text"
                  value={returnMeterHours}
                  onChange={(e) => setReturnMeterHours(e.target.value)}
                  placeholder="Ex : 32.0"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '0.35rem',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  État de propreté au retour
                </label>
                <select
                  value={returnCleanliness}
                  onChange={(e) => setReturnCleanliness(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '0.35rem',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="IMPECCABLE">Impeccable / Nettoyé</option>
                  <option value="NORMAL">Normal (poussière légère)</option>
                  <option value="SALE">Sale (nécessite forfait nettoyage 30€)</option>
                </select>
              </div>
            </div>

            {/* PHOTOS RETOUR */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Camera size={16} color="#059669" />
                  <span>Photos du Matériel au Retour</span>
                </label>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '0.35rem',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}>
                  <Upload size={14} />
                  <span>Ajouter photo retour</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={(e) => handlePhotoUpload(e, true)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {returnPhotos.length === 0 ? (
                <div style={{
                  padding: '1.5rem',
                  border: '2px dashed #CBD5E1',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  color: '#94A3B8',
                  fontSize: '0.85rem',
                  backgroundColor: '#F8FAFC'
                }}>
                  📸 Prenez des photos pour attester de la parfaite restitution sans dommage.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {returnPhotos.map((p, idx) => (
                    <div key={idx} style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', height: '110px', border: '1px solid #CBD5E1' }}>
                      <img src={p} alt={`Photo retour ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx, true)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(220, 38, 38, 0.85)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '9999px',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DÉCISION RESTITUTION CAUTION */}
            <div style={{
              marginBottom: '1.5rem',
              padding: '1.25rem',
              borderRadius: '0.5rem',
              backgroundColor: depositDecision === 'FULL_REFUND' ? '#ECFDF5' : '#FEF2F2',
              border: depositDecision === 'FULL_REFUND' ? '1px solid #A7F3D0' : '1px solid #FECACA'
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
                Décision sur le Dépôt de Garantie (Caution de {reservation.depositAmount} €) :
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: '#065F46' }}>
                  <input
                    type="radio"
                    name="deposit"
                    value="FULL_REFUND"
                    checked={depositDecision === 'FULL_REFUND'}
                    onChange={() => setDepositDecision('FULL_REFUND')}
                  />
                  <span>✓ Restitution intégrale immédiate (0 € retenu)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: '#991B1B' }}>
                  <input
                    type="radio"
                    name="deposit"
                    value="PARTIAL_PENALTY"
                    checked={depositDecision === 'PARTIAL_PENALTY'}
                    onChange={() => setDepositDecision('PARTIAL_PENALTY')}
                  />
                  <span>⚠ Retenue partielle pour dommage ou nettoyage</span>
                </label>
              </div>

              {depositDecision === 'PARTIAL_PENALTY' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Montant retenu sur la caution :</span>
                  <input
                    type="number"
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '120px',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '0.35rem',
                      border: '1px solid #DC2626',
                      fontWeight: 700,
                      color: '#DC2626'
                    }}
                  />
                  <span style={{ fontSize: '0.85rem' }}>€ TTC</span>
                </div>
              )}
            </div>

            {/* SIGNATURE RETOUR */}
            <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  Signature contradictoire de restitution :
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenSignature('CHECKOUT')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.35rem',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.775rem',
                    cursor: 'pointer',
                  }}
                >
                  <PenTool size={13} />
                  <span>{checkoutSignature ? 'Modifier signature' : 'Faire signer au retour'}</span>
                </button>
              </div>

              {checkoutSignature ? (
                <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #E2E8F0' }}>
                  <img src={checkoutSignature} alt="Signature retour" style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }} />
                  <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>✓ Signature de restitution enregistrée</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem', fontStyle: 'italic', padding: '0.75rem' }}>
                  En attente de signature tactile de clôture
                </div>
              )}
            </div>

            {/* BOUTON CLÔTURE RETOUR */}
            <button
              type="button"
              onClick={handleSubmitCheckout}
              disabled={isSaving}
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.3)'
              }}
            >
              <CheckCircle2 size={18} color="#34D399" />
              <span>{isSaving ? 'Clôture en cours...' : 'Clôturer la Location & Libérer la Caution'}</span>
            </button>
          </div>
        )}
      </div>

      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={handleSaveSignature}
        signerName={reservation.customerName}
        roleLabel={signTarget === 'CHECKIN' ? 'Signature de départ (Remise)' : 'Signature de retour (Restitution)'}
      />
    </div>
  );
}
