'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SignaturePadModal } from '@/components/SignaturePadModal';
import {
  Printer,
  ArrowLeft,
  PenTool,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';

interface ContratClientViewProps {
  reservation: any;
  settings: any;
}

export function ContratClientView({ reservation, settings }: ContratClientViewProps) {
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(
    reservation.clientSignatureDataUrl || null
  );
  const [signedAt, setSignedAt] = useState<string | null>(
    reservation.contractSignedAt || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSignature = async (dataUrl: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/reservations/${reservation.id}/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureDataUrl: dataUrl,
          signerName: reservation.customerName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSignatureUrl(dataUrl);
        setSignedAt(data.contractSignedAt);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert('Erreur lors de l\'enregistrement de la signature.');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const includedAccessories = reservation.equipment.includedAccessoriesJson
    ? JSON.parse(reservation.equipment.includedAccessoriesJson)
    : [];

  return (
    <div>
      {/* BARRE D'OUTILS HAUTE (Masquée à l'impression) */}
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
            Contrat de Location N° CTR-{reservation.reservationNumber}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {signatureUrl ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(5, 150, 105, 0.2)',
              color: '#34D399',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              <CheckCircle2 size={14} />
              <span>Contrat Signé</span>
            </div>
          ) : (
            <button
              onClick={() => setIsSignModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.3)'
              }}
            >
              <PenTool size={15} />
              <span>Faire signer sur l'écran</span>
            </button>
          )}

          <Link
            href={`/admin/reservations/${reservation.id}/facture`}
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
            <span>Voir Facture</span>
          </Link>

          <Link
            href={`/admin/reservations/${reservation.id}/etat-des-lieux`}
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
            <FileCheck size={15} />
            <span>État des Lieux</span>
          </Link>

          <button
            onClick={handlePrint}
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
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Printer size={15} />
            <span>Imprimer / PDF</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="no-print" style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '0.5rem',
          color: '#065F46',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={16} />
          <span>Signature enregistrée avec succès sur le contrat et archivée dans le dossier !</span>
        </div>
      )}

      {/* FEUILLE DE CONTRAT A4 IMPRIMABLE */}
      <div className="contract-paper" style={{
        maxWidth: '860px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        padding: '3rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        color: '#0F172A',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        lineHeight: 1.5,
      }}>
        {/* EN-TÊTE OFFICIEL */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: '1.5rem',
          borderBottom: '2px solid #0F172A',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                CALVINO ELEC
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>
                Division Location BTP
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.35rem', lineHeight: 1.4 }}>
              <strong>{settings.companyName || 'CALVINO ELEC'}</strong> • SASU au capital de 5 000 €<br />
              SIRET : {settings.siret || '882 123 456 00012'} • RCS {settings.rcsCity || 'Metz B 882 123 456'}<br />
              {settings.address || '71 Rue de la Fontenelle, 57420 Coin-lès-Cuvry'}<br />
              Tél : {settings.phone || '06 63 44 74 89'} • Email : {settings.email || 'calvinoelec@gmail.com'}<br />
              Assurance RCP : {settings.assuranceRcp || 'SMABTP N° 2026-CALV-4478'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              padding: '0.5rem 1rem',
              borderRadius: '0.35rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '0.5rem'
            }}>
              Contrat de Location
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
              N° CTR-{reservation.reservationNumber}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
              Date d'établissement : {format(new Date(reservation.createdAt), 'dd MMMM yyyy', { locale: fr })}
            </div>
          </div>
        </div>

        {/* CADRE 1 & 2 : LES PARTIES CONTRACTANTES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* LE LOUEUR */}
          <div style={{
            border: '1px solid #E2E8F0',
            borderRadius: '0.5rem',
            padding: '1rem',
            backgroundColor: '#F8FAFC'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Le Loueur
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>CALVINO ELEC</div>
            <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '0.25rem' }}>
              Représenté par M. Gaëtan CALVINO<br />
              71 Rue de la Fontenelle<br />
              57420 Coin-lès-Cuvry (Moselle)<br />
              Tél : 06 63 44 74 89
            </div>
          </div>

          {/* LE LOCATAIRE */}
          <div style={{
            border: '1px solid #E2E8F0',
            borderRadius: '0.5rem',
            padding: '1rem',
            backgroundColor: '#F8FAFC'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Le Locataire
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
              {reservation.customerCompany ? `${reservation.customerCompany}` : reservation.customerName}
            </div>
            {reservation.customerCompany && (
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>
                Contact : {reservation.customerName}
              </div>
            )}
            <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '0.25rem' }}>
              {reservation.customerAddress}<br />
              {reservation.customerPostalCode} {reservation.customerCity}<br />
              Tél : {reservation.customerPhone} • Email : {reservation.customerEmail}
            </div>
          </div>
        </div>

        {/* CADRE 3 : MATÉRIEL & CONDITIONS DE MISE À DISPOSITION */}
        <div style={{
          border: '1px solid #CBD5E1',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            1. Objet du Contrat & Matériel Mis à Disposition
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  {reservation.equipment.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Catégorie : <strong>{reservation.equipment.category?.name}</strong> • Modèle : {reservation.equipment.model || reservation.equipment.brand || 'Conforme devis'}
                </div>
                {reservation.unit && (
                  <div style={{ fontSize: '0.85rem', color: '#0F172A', marginTop: '0.35rem' }}>
                    Unité physique : <strong style={{ color: '#2563EB' }}>{reservation.unit.internalCode}</strong>
                    {reservation.unit.serialNumber && ` (N° Série : ${reservation.unit.serialNumber})`}
                  </div>
                )}
                {includedAccessories.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#334155' }}>
                    <strong>Accessoires inclus :</strong> {includedAccessories.join(', ')}
                  </div>
                )}
              </div>

              <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '1rem', fontSize: '0.825rem' }}>
                <div style={{ color: '#64748B', marginBottom: '0.2rem' }}>Mode de mise à disposition :</div>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>
                  {reservation.deliveryMode === 'DELIVERY_ON_SITE' ? '🚚 Livraison sur chantier' : '🏢 Retrait au dépôt (Coin-lès-Cuvry)'}
                </div>
                {reservation.deliveryAddress && (
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem' }}>
                    Adresse : {reservation.deliveryAddress}
                  </div>
                )}
              </div>
            </div>

            {/* PÉRIODE */}
            <div style={{
              marginTop: '1rem',
              paddingTop: '0.85rem',
              borderTop: '1px dashed #E2E8F0',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              fontSize: '0.825rem'
            }}>
              <div>
                <span style={{ color: '#64748B' }}>Date & Heure de Départ :</span><br />
                <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>
                  {format(new Date(reservation.startDate), 'dd/MM/yyyy')} à {reservation.pickupTime || '08:30'}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Date & Heure de Retour :</span><br />
                <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>
                  {format(new Date(reservation.endDate), 'dd/MM/yyyy')} à {reservation.returnTime || '18:00'}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748B' }}>Durée de Location :</span><br />
                <strong style={{ fontSize: '0.9rem', color: '#2563EB' }}>
                  {reservation.rentalDays} jour(s) facturé(s)
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* CADRE 4 : DÉCOMPOSITION FINANCIÈRE & CAUTION */}
        <div style={{
          border: '1px solid #CBD5E1',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '0.6rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            2. Modalités Financières & Dépôt de Garantie (Caution)
          </div>
          <div style={{ padding: '1rem', backgroundColor: '#FFFFFF' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '0.5rem' }}>Désignation de la prestation</th>
                  <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Montant HT</th>
                  <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Taux TVA</th>
                  <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Montant TTC</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.5rem 0' }}>Location {reservation.equipment.name} ({reservation.rentalDays} j)</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{reservation.basePrice.toFixed(2)} €</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>20,0 %</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{(reservation.basePrice * 1.2).toFixed(2)} €</td>
                </tr>
                {reservation.deliveryFee > 0 && (
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.5rem 0' }}>Forfait transport & livraison sur site</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{reservation.deliveryFee.toFixed(2)} €</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>20,0 %</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{(reservation.deliveryFee * 1.2).toFixed(2)} €</td>
                  </tr>
                )}
                {reservation.promoDiscountAmount > 0 && (
                  <tr style={{ borderBottom: '1px solid #F1F5F9', color: '#DC2626' }}>
                    <td style={{ padding: '0.5rem 0' }}>Remise commerciale ({reservation.promoCodeApplied || 'Offre'})</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>-{reservation.promoDiscountAmount.toFixed(2)} €</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>20,0 %</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>-{(reservation.promoDiscountAmount * 1.2).toFixed(2)} €</td>
                  </tr>
                )}
                <tr style={{ fontWeight: 800, fontSize: '0.95rem', borderTop: '2px solid #0F172A' }}>
                  <td style={{ paddingTop: '0.6rem' }}>TOTAL LOCATION EXIGIBLE</td>
                  <td style={{ paddingTop: '0.6rem', textAlign: 'right' }}>{reservation.subtotalHt.toFixed(2)} € HT</td>
                  <td style={{ paddingTop: '0.6rem', textAlign: 'right' }}>TVA {reservation.taxAmount.toFixed(2)} €</td>
                  <td style={{ paddingTop: '0.6rem', textAlign: 'right', color: '#047857', fontSize: '1.05rem' }}>
                    {reservation.totalAmount.toFixed(2)} € TTC
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ENCADRÉ CAUTION */}
            <div style={{
              marginTop: '1rem',
              padding: '0.85rem',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '0.35rem',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <strong style={{ color: '#92400E' }}>DÉPÔT DE GARANTIE / CAUTION (NON DÉBITÉE) :</strong>
                <p style={{ margin: '0.15rem 0 0 0', color: '#78350F', fontSize: '0.75rem' }}>
                  Conservée jusqu'à restitution et état des lieux contradictoire sans réserve.
                </p>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#B45309' }}>
                {reservation.depositAmount.toFixed(0)} €
              </div>
            </div>
          </div>
        </div>

        {/* CADRE 5 : CONDITIONS GÉNÉRALES RÉSUMÉES (VALEUR LÉGALE) */}
        <div style={{
          border: '1px solid #E2E8F0',
          borderRadius: '0.5rem',
          padding: '0.85rem',
          backgroundColor: '#F8FAFC',
          fontSize: '0.7rem',
          color: '#475569',
          lineHeight: 1.4,
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0F172A', marginBottom: '0.35rem' }}>
            Conditions Générales Applicables & Engagements :
          </div>
          <p style={{ margin: '0 0 0.35rem 0' }}>
            <strong>Article 1 - Propriété & Garde juridique :</strong> Le matériel loué reste la propriété exclusive de CALVINO ELEC. Le Locataire assume la garde matérielle et juridique de l'équipement dès sa mise à disposition jusqu'à sa restitution effective. La sous-location est formellement interdite.
          </p>
          <p style={{ margin: '0 0 0.35rem 0' }}>
            <strong>Article 2 - Utilisation & Sécurité :</strong> Le Locataire s'engage à utiliser le matériel conformément aux prescriptions techniques du constructeur et règles de l'art BTP, muni des Équipements de Protection Individuelle (EPI).
          </p>
          <p style={{ margin: '0 0 0.35rem 0' }}>
            <strong>Article 3 - Restitution & Carburant :</strong> Le matériel doit être restitué en parfait état de fonctionnement et de propreté au terme prévu. Tout retard non convenu préalablement sera facturé au tarif journalier en vigueur. Les consommables (carburant, disques) non fournis restent à la charge du locataire.
          </p>
          <p style={{ margin: 0 }}>
            <strong>Article 4 - Dépôt de garantie :</strong> La caution garantit la restitution du matériel en bon état. En cas de dommage, perte ou vol, CALVINO ELEC se réserve le droit d'encaisser la caution à due concurrence des frais de réparation ou de remplacement à neuf.
          </p>
        </div>

        {/* CADRE 6 : SIGNATURES DES PARTIES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          paddingTop: '0.5rem'
        }}>
          {/* SIGNATURE LOUEUR */}
          <div style={{
            border: '1px solid #CBD5E1',
            borderRadius: '0.5rem',
            padding: '1rem',
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
              Pour le Loueur : CALVINO ELEC
            </div>
            <div style={{ textAlign: 'center', color: '#059669', fontSize: '0.8rem' }}>
              <div style={{
                display: 'inline-block',
                border: '2px solid #059669',
                padding: '0.4rem 0.85rem',
                borderRadius: '0.35rem',
                fontWeight: 800,
                transform: 'rotate(-4deg)',
                letterSpacing: '0.5px'
              }}>
                CALVINO ELEC<br />
                <span style={{ fontSize: '0.7rem' }}>Contrat Validé le {format(new Date(), 'dd/MM/yyyy')}</span>
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
              Signature & Cachet de l'entreprise
            </div>
          </div>

          {/* SIGNATURE LOCATAIRE */}
          <div style={{
            border: signatureUrl ? '2px solid #059669' : '1px dashed #94A3B8',
            borderRadius: '0.5rem',
            padding: '1rem',
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: signatureUrl ? '#F0FDF4' : '#FFFFFF',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                Pour le Locataire : {reservation.customerName}
              </span>
              {signatureUrl && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669' }}>
                  ✓ Signé
                </span>
              )}
            </div>

            {signatureUrl ? (
              <div style={{ textAlign: 'center' }}>
                <img
                  src={signatureUrl}
                  alt="Signature Client"
                  style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
                />
                {signedAt && (
                  <div style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 600 }}>
                    Signé numériquement le {format(new Date(signedAt), 'dd/MM/yyyy à HH:mm')}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                Mention manuscrite : « Bon pour accord »<br />
                (En attente de signature tactile ou manuscrite)
              </div>
            )}

            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
              Signature précédée de la mention « Bon pour accord »
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE SIGNATURE TACTILE */}
      <SignaturePadModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSave={handleSaveSignature}
        signerName={reservation.customerName}
        roleLabel={`Locataire • Contrat N° CTR-${reservation.reservationNumber}`}
      />

      {/* STYLES SPÉCIFIQUES POUR L'IMPRESSION A4 */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #FFFFFF !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          header, footer, nav, aside {
            display: none !important;
          }
          .contract-paper {
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 1.2cm;
          }
        }
      `}</style>
    </div>
  );
}
