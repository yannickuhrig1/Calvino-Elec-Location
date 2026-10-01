'use client';

import React from 'react';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { EquipmentFinancialStats, GlobalParcFinancials, AccountingSummary } from '@/backend/accounting/accountingService';

interface PrintProps {
  equipments: EquipmentFinancialStats[];
  parcFinancials: GlobalParcFinancials;
  accountingSummary: AccountingSummary;
  generationDate: string;
}

export function PrintClientView({
  equipments,
  parcFinancials,
  accountingSummary,
  generationDate,
}: PrintProps) {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>
      {/* Barre d'action supérieure (masquée à l'impression) */}
      <div
        className="no-print"
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/admin/comptabilite"
            className="btn btn-outline btn-sm"
            style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            <ArrowLeft size={16} />
            <span>Retour à la comptabilité</span>
          </Link>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            Aperçu avant impression (Format A4 optimisé pour banques et experts-comptables)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href="/api/admin/accounting/export-rentabilite"
            download
            className="btn btn-outline btn-sm"
            style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
          >
            <Download size={15} />
            <span>Télécharger CSV</span>
          </a>
          <button
            onClick={() => window.print()}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Printer size={16} />
            <span>Imprimer / Enregistrer en PDF</span>
          </button>
        </div>
      </div>

      {/* Feuille de document officielle */}
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '2.5rem 3rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1.5,
        }}
      >
        {/* Entête officielle de l'entreprise */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #0f172a',
            paddingBottom: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              CALVINO <span style={{ color: '#d97706' }}>ELEC</span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginTop: '0.15rem' }}>
              Division Location de Matériel Professionnel du BTP
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem', lineHeight: 1.4 }}>
              71 RUE DE LA FONTENELLE<br />
              57420 COIN-LES-CUVRY (Moselle)<br />
              Tél : 06 63 44 74 89 • Email : calvinoelec@gmail.com
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#f1f5f9',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Document Financier Certifié
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
              Date d'émission : <strong>{generationDate}</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Exercice fiscal 2026 • Référence : CALV-FIN-2026
            </div>
          </div>
        </div>

        {/* Titre du document */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            BILAN D'EXPLOITATION, AMORTISSEMENTS & SEUILS DE RENTABILITÉ
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '700px', margin: '0.35rem auto 0' }}>
            Synthèse comptable établie sur la base des montants réels d'investissement (Devis MaxOutil de 4 777,49 € HT),
            des dotations linéaires aux amortissements et du journal des locations.
          </p>
        </div>

        {/* Cadre de Synthèse 4 Blocs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Investissement Brut Parc
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
              {parcFinancials.totalInvestissementHt.toFixed(2)} € HT
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>9 machines en exploitation</div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Amortissement à date
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#b45309', marginTop: '0.2rem' }}>
              {parcFinancials.totalAmortissementCumuleHt.toFixed(2)} € HT
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              VNC : {parcFinancials.totalVncRestanteHt.toFixed(2)} €
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              CA Locations Encaissé
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857', marginTop: '0.2rem' }}>
              {parcFinancials.totalCaGenereHt.toFixed(2)} € HT
            </div>
            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
              {parcFinancials.tauxCouvertureGlobal.toFixed(1)}% remboursé
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Marge Nette Déduite
            </div>
            <div
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: parcFinancials.margeNetteGlobaleHt >= 0 ? '#047857' : '#b91c1c',
                marginTop: '0.2rem',
              }}
            >
              {parcFinancials.margeNetteGlobaleHt > 0 ? '+' : ''}
              {parcFinancials.margeNetteGlobaleHt.toFixed(2)} €
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Amort. & entretiens déduits
            </div>
          </div>
        </div>

        {/* Section 1 : Tableau d'Amortissement & Rentabilité du Parc */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
            1. Tableau des Amortissements Linéaires & Seuils de Rentabilité par Équipement
          </h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8rem',
              border: '1px solid #cbd5e1',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0.6rem' }}>Équipement</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Prix Achat HT</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Durée</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Dot. Mens.</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Amorti</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>VNC</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Tarif/j</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Seuil</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>Loué</th>
                <th style={{ padding: '0.5rem 0.6rem' }}>CA HT</th>
                <th style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>Progression</th>
              </tr>
            </thead>
            <tbody>
              {equipments.map((eq, i) => {
                const percent = Math.min(100, Math.round(eq.pourcentageRemboursement));
                return (
                  <tr
                    key={eq.equipmentId}
                    style={{
                      backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>{eq.name}</td>
                    <td style={{ padding: '0.5rem 0.6rem' }}>{eq.purchasePriceHt.toFixed(2)} €</td>
                    <td style={{ padding: '0.5rem 0.6rem' }}>{eq.amortizationYears} ans</td>
                    <td style={{ padding: '0.5rem 0.6rem' }}>{eq.dotationMensuelleHt.toFixed(2)} €</td>
                    <td style={{ padding: '0.5rem 0.6rem' }}>{eq.amortissementCumuleHt.toFixed(2)} €</td>
                    <td style={{ padding: '0.5rem 0.6rem' }}>{eq.vncRestanteHt.toFixed(2)} €</td>
                    <td style={{ padding: '0.5rem 0.6rem' }}>{eq.priceDay} €</td>
                    <td style={{ padding: '0.5rem 0.6rem', fontWeight: 700 }}>{eq.seuilRentabiliteJours} j</td>
                    <td style={{ padding: '0.5rem 0.6rem' }}>{eq.totalJoursLoues} j</td>
                    <td style={{ padding: '0.5rem 0.6rem', fontWeight: 600, color: '#047857' }}>
                      {eq.caTotalHt.toFixed(2)} €
                    </td>
                    <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 700 }}>
                      <span style={{ color: eq.isRentabilise ? '#047857' : '#2563eb' }}>
                        {percent}% {eq.isRentabilise ? '✓' : ''}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 800, borderTop: '2px solid #0f172a' }}>
                <td style={{ padding: '0.6rem' }}>TOTAL GÉNÉRAL DU PARC</td>
                <td style={{ padding: '0.6rem' }}>{parcFinancials.totalInvestissementHt.toFixed(2)} €</td>
                <td style={{ padding: '0.6rem' }}>-</td>
                <td style={{ padding: '0.6rem' }}>-</td>
                <td style={{ padding: '0.6rem' }}>{parcFinancials.totalAmortissementCumuleHt.toFixed(2)} €</td>
                <td style={{ padding: '0.6rem' }}>{parcFinancials.totalVncRestanteHt.toFixed(2)} €</td>
                <td style={{ padding: '0.6rem' }}>-</td>
                <td style={{ padding: '0.6rem' }}>-</td>
                <td style={{ padding: '0.6rem' }}>-</td>
                <td style={{ padding: '0.6rem', color: '#047857' }}>
                  {parcFinancials.totalCaGenereHt.toFixed(2)} €
                </td>
                <td style={{ padding: '0.6rem', textAlign: 'right', color: '#047857' }}>
                  {parcFinancials.tauxCouvertureGlobal.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 2 : Synthèse Comptable des Ventes & TVA */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
            2. Récapitulatif Comptable des Ventes & TVA Collectée (Plan Comptable Général)
          </h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              border: '1px solid #cbd5e1',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '0.6rem', textAlign: 'left' }}>Compte PCG</th>
                <th style={{ padding: '0.6rem', textAlign: 'left' }}>Intitulé comptable</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>Débit (€)</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>Crédit (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>411000</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>Clients - Créances et règlements TTC</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 700 }}>
                  {accountingSummary.totalTtcExigible.toFixed(2)} €
                </td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>706000</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>Prestations de services - Location de matériel HT</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>-</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 700 }}>
                  {accountingSummary.totalVentesHt.toFixed(2)} €
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>708500</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>Ports et frais accessoires facturés HT (Livraisons)</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>-</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 700 }}>
                  {accountingSummary.totalLivraisonHt.toFixed(2)} €
                </td>
              </tr>
              {accountingSummary.totalRemisesHt > 0 && (
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.5rem 0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>709000</td>
                  <td style={{ padding: '0.5rem 0.6rem' }}>Rabais, remises et ristournes accordés (Codes promo)</td>
                  <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 700 }}>
                    {accountingSummary.totalRemisesHt.toFixed(2)} €
                  </td>
                  <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>-</td>
                </tr>
              )}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem 0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>445710</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>TVA collectée à 20,0 %</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>-</td>
                <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 700, color: '#b45309' }}>
                  {accountingSummary.totalTvaCollectee.toFixed(2)} €
                </td>
              </tr>
              <tr style={{ backgroundColor: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
                <td style={{ padding: '0.5rem 0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>165000</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>
                  <em>Cautions / Dépôts de garantie (Engagements hors bilan non imposables)</em>
                </td>
                <td colSpan={2} style={{ padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 700 }}>
                  {accountingSummary.totalCautionsHorsBilan.toFixed(2)} € (Sécurisées)
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 800 }}>
                <td colSpan={2} style={{ padding: '0.6rem' }}>TOTAL DES ÉCRITURES ÉQUILIBRÉES :</td>
                <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                  {(accountingSummary.totalTtcExigible + accountingSummary.totalRemisesHt).toFixed(2)} €
                </td>
                <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                  {(
                    accountingSummary.totalVentesHt +
                    accountingSummary.totalLivraisonHt +
                    accountingSummary.totalTvaCollectee
                  ).toFixed(2)} €
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signature et Mention Légale */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #cbd5e1',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              <strong>Attestation de conformité :</strong><br />
              Le présent état récapitule fidèlement l'amortissement du parc matériel et le journal des écritures de ventes pour l'exercice en cours de la société CALVINO ELEC.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Fait à Coin-lès-Cuvry, le {generationDate}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              Pour CALVINO ELEC, Le Dirigeant :
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.75rem' }}>
              Gaëtan CALVINO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
