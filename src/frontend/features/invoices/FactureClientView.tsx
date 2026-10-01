'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Printer,
  ArrowLeft,
  FileText,
  FileCheck,
  CheckCircle,
  Building,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

interface FactureClientViewProps {
  reservation: any;
  settings: any;
}

export function FactureClientView({ reservation, settings }: FactureClientViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = reservation.invoiceIssuedAt
    ? new Date(reservation.invoiceIssuedAt)
    : new Date();

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
            Facture Officielle N° {reservation.invoiceNumber}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

      {/* FEUILLE FACTURE A4 */}
      <div className="invoice-paper" style={{
        maxWidth: '860px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        padding: '3.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        color: '#0F172A',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        lineHeight: 1.5,
      }}>
        {/* EN-TÊTE ÉMETTEUR & FACTURE */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: '2rem',
          borderBottom: '2px solid #0F172A',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
              CALVINO ELEC
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Division Location Matériel BTP
            </div>
            <div style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.45 }}>
              71 Rue de la Fontenelle<br />
              57420 Coin-lès-Cuvry (Moselle)<br />
              Tél : {settings.phone || '06 63 44 74 89'}<br />
              Email : {settings.email || 'calvinoelec@gmail.com'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.35rem',
              fontSize: '1rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '0.6rem'
            }}>
              FACTURE
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
              N° {reservation.invoiceNumber}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>
              Date d'émission : {format(invoiceDate, 'dd MMMM yyyy', { locale: fr })}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Dossier client : {reservation.reservationNumber}
            </div>
          </div>
        </div>

        {/* FACTURÉ À (CLIENT) & DATES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          <div style={{
            border: '1px solid #CBD5E1',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            backgroundColor: '#F8FAFC'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Facturé à l'attention de :
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
              {reservation.customerCompany || reservation.customerName}
            </div>
            {reservation.customerCompany && (
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Attn : {reservation.customerName}
              </div>
            )}
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.4rem', lineHeight: 1.4 }}>
              {reservation.customerAddress}<br />
              {reservation.customerPostalCode} {reservation.customerCity}<br />
              Tél : {reservation.customerPhone} • Email : {reservation.customerEmail}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            padding: '1rem',
            backgroundColor: '#F1F5F9',
            borderRadius: '0.5rem'
          }}>
            <div>
              <span style={{ color: '#64748B' }}>Période de prestation :</span><br />
              <strong>Du {format(new Date(reservation.startDate), 'dd/MM/yyyy')} au {format(new Date(reservation.endDate), 'dd/MM/yyyy')}</strong>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Mode de règlement :</span><br />
              <strong>Carte Bancaire / Chèque / Virement à réception</strong>
            </div>
            <div>
              <span style={{ color: '#64748B' }}>Date d'échéance :</span><br />
              <strong style={{ color: '#059669' }}>Règlement comptant à mise à disposition</strong>
            </div>
          </div>
        </div>

        {/* TABLEAU DES LIGNES DE FACTURATION */}
        <div style={{ marginBottom: '2.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderRadius: '0.35rem 0 0 0' }}>Désignation & Détails</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Quantité</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'right' }}>Prix Unit. HT</th>
                <th style={{ padding: '0.75rem 0.75rem', textAlign: 'right' }}>TVA</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderRadius: '0 0.35rem 0 0' }}>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {/* Ligne 1 : Loyer matériel */}
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>
                    Location : {reservation.equipment.name}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.15rem' }}>
                    Unité mise à disposition : {reservation.unit?.internalCode || 'Attribuée'} • {reservation.rentalDays} jour(s) de location
                  </div>
                </td>
                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>{reservation.rentalDays} j</td>
                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                  {(reservation.basePrice / reservation.rentalDays).toFixed(2)} €
                </td>
                <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>20,0 %</td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                  {reservation.basePrice.toFixed(2)} €
                </td>
              </tr>

              {/* Ligne 2 : Livraison (si applicable) */}
              {reservation.deliveryFee > 0 && (
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>
                      Forfait transport & livraison sur chantier
                    </div>
                    <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.15rem' }}>
                      Aller-retour site : {reservation.deliveryAddress || 'Chantier client Moselle'}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>1 forf.</td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>{reservation.deliveryFee.toFixed(2)} €</td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>20,0 %</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                    {reservation.deliveryFee.toFixed(2)} €
                  </td>
                </tr>
              )}

              {/* Ligne 3 : Remise promo (si applicable) */}
              {reservation.promoDiscountAmount > 0 && (
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#DC2626' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700 }}>
                      Remise commerciale ({reservation.promoCodeApplied || 'Offre Promotionnelle'})
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>-{reservation.promoDiscountAmount.toFixed(2)} €</td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>20,0 %</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                    -{reservation.promoDiscountAmount.toFixed(2)} €
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TOTAUX & RÉCAPITULATIF TVA */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          {/* MENTION CAUTION & RÈGLEMENT */}
          <div>
            <div style={{
              padding: '1rem',
              border: '1px solid #CBD5E1',
              borderRadius: '0.5rem',
              backgroundColor: '#F8FAFC',
              fontSize: '0.8rem',
              color: '#475569'
            }}>
              <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.25rem' }}>
                Informations Caution de Garantie (Hors-Bilan) :
              </strong>
              Dépôt de garantie enregistré : <strong>{reservation.depositAmount.toFixed(0)} €</strong> (non encaissé, non soumis à TVA). Restitution après inventaire et état des lieux contradictoire sans dommage.
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>
              <strong>Coordonnées bancaires pour virement :</strong><br />
              IBAN : FR76 1027 8000 1234 5678 9012 345 • BIC : CMCIFR2A<br />
              Titulaire du compte : CALVINO ELEC SASU
            </div>
          </div>

          {/* TABLEAU DES TOTAUX */}
          <div style={{
            border: '2px solid #0F172A',
            borderRadius: '0.5rem',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Total Hors Taxes (HT) :</span>
                <strong>{reservation.subtotalHt.toFixed(2)} €</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>TVA collectée à 20,00 % :</span>
                <strong>{reservation.taxAmount.toFixed(2)} €</strong>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '2px solid #0F172A',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#059669'
              }}>
                <span>TOTAL TTC :</span>
                <span>{reservation.totalAmount.toFixed(2)} €</span>
              </div>
            </div>
            <div style={{
              backgroundColor: '#ECFDF5',
              padding: '0.5rem 1rem',
              borderTop: '1px solid #A7F3D0',
              textAlign: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#065F46'
            }}>
              ✓ FACTURE ACQUITTÉE
            </div>
          </div>
        </div>

        {/* PIED DE PAGE LÉGAL OBLIGATOIRE */}
        <div style={{
          borderTop: '1px solid #CBD5E1',
          paddingTop: '1.25rem',
          fontSize: '0.7rem',
          color: '#64748B',
          textAlign: 'center',
          lineHeight: 1.45
        }}>
          <div>
            <strong>CALVINO ELEC SASU</strong> • Capital 5 000 € • SIRET : {settings.siret || '882 123 456 00012'} • RCS {settings.rcsCity || 'Metz B 882 123 456'} • TVA Intra : {settings.tvaIntra || 'FR 12 882123456'}
          </div>
          <div style={{ marginTop: '0.2rem' }}>
            Siège social : {settings.address || '71 Rue de la Fontenelle, 57420 Coin-lès-Cuvry'} • Assurance RCP : {settings.assuranceRcp || 'SMABTP N° 2026-CALV-4478'}
          </div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.65rem' }}>
            Dispositions légales : En cas de retard de paiement, application d'une pénalité égale à 3 fois le taux d'intérêt légal. Indemnité forfaitaire de compensation des frais de recouvrement en cas de retard de paiement pour les professionnels : 40 € (C. Com. Art. L. 441-6).
          </div>
        </div>
      </div>

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
          .invoice-paper {
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
