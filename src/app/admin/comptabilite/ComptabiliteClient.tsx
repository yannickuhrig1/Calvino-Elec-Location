'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AccountingTransaction,
  AccountingSummary,
  computeAccountingSummary,
} from '@/lib/accounting';
import {
  Receipt,
  Download,
  Printer,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Coins,
  ShieldCheck,
  Building,
  User,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Percent,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  initialTransactions: AccountingTransaction[];
}

export function ComptabiliteClient({ initialTransactions }: Props) {
  const [period, setPeriod] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'SUMMARY' | 'JOURNAL'>('SUMMARY');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Filtrage des transactions
  const filteredTransactions = initialTransactions.filter((tx) => {
    // Filtre recherche
    const q = search.toLowerCase();
    const matchSearch =
      tx.reservationNumber.toLowerCase().includes(q) ||
      tx.customerName.toLowerCase().includes(q) ||
      (tx.customerCompany && tx.customerCompany.toLowerCase().includes(q)) ||
      tx.equipmentName.toLowerCase().includes(q);

    // Filtre statut
    const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;

    // Filtre dates/période
    const txDate = new Date(tx.date);
    const now = new Date();
    const currentYear = now.getFullYear();

    let matchPeriod = true;
    if (customStart && customEnd) {
      matchPeriod =
        txDate >= new Date(customStart) && txDate <= new Date(`${customEnd}T23:59:59`);
    } else if (period === 'CURRENT_MONTH') {
      matchPeriod =
        txDate.getFullYear() === currentYear && txDate.getMonth() === now.getMonth();
    } else if (period === 'T1') {
      matchPeriod = txDate.getFullYear() === currentYear && txDate.getMonth() <= 2;
    } else if (period === 'T2') {
      matchPeriod =
        txDate.getFullYear() === currentYear &&
        txDate.getMonth() >= 3 &&
        txDate.getMonth() <= 5;
    } else if (period === 'T3') {
      matchPeriod =
        txDate.getFullYear() === currentYear &&
        txDate.getMonth() >= 6 &&
        txDate.getMonth() <= 8;
    } else if (period === 'T4') {
      matchPeriod = txDate.getFullYear() === currentYear && txDate.getMonth() >= 9;
    } else if (period === 'YEAR') {
      matchPeriod = txDate.getFullYear() === currentYear;
    }

    return matchSearch && matchStatus && matchPeriod;
  });

  // Calcul du résumé comptable en temps réel sur la sélection
  const summary: AccountingSummary = computeAccountingSummary(filteredTransactions);

  // URL pour l'export Excel stylisé (.xlsx) avec filtres actifs
  const exportExcelUrl = `/api/admin/accounting/export-excel?period=${period}&status=${statusFilter}${
    customStart && customEnd ? `&from=${customStart}&to=${customEnd}` : ''
  }`;

  // URL pour l'export CSV brut
  const exportCsvUrl = `/api/admin/accounting/export?period=${period}&status=${statusFilter}${
    customStart && customEnd ? `&from=${customStart}&to=${customEnd}` : ''
  }`;

  return (
    <div>
      {/* En-tête */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span
              className="badge"
              style={{
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Plan Comptable Général (PCG) & TVA 20%
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Écritures équilibrées Débit / Crédit
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--brand-navy)', letterSpacing: '-0.02em' }}>
            Comptabilité & Journal des Ventes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Journal officiel conforme expert-comptable (Sage, EBP, Pennylane), récapitulatif TVA et gestion des cautions hors-bilan.
          </p>
        </div>

        {/* Boutons d'export et d'impression */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href={exportExcelUrl}
            download
            className="btn btn-primary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#047857',
              borderColor: '#047857',
              color: '#ffffff',
              fontWeight: 700,
              boxShadow: '0 2px 4px rgba(4, 120, 87, 0.2)',
            }}
          >
            <FileSpreadsheet size={16} />
            <span>Tableau Excel Stylisé (.xlsx)</span>
          </a>

          <a
            href={exportCsvUrl}
            download
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            title="Format texte brut pour imports comptables spécifiques"
          >
            <Download size={14} />
            <span>Format CSV Brut</span>
          </a>

          <Link
            href="/admin/comptabilite/imprimer"
            target="_blank"
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Printer size={15} />
            <span>Imprimer Bilan Bancaire</span>
          </Link>
        </div>
      </div>

      {/* 5 Cartes de Synthèse Comptable */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Prestations Location HT (706000) */}
        <div className="card" style={{ padding: '1.35rem', borderLeft: '5px solid #2563eb' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Location Matériel HT (706000)
          </span>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: 'var(--brand-navy)',
              marginTop: '0.25rem',
              lineHeight: 1.1,
            }}
          >
            {summary.totalVentesHt.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Base de location nette facturée
          </div>
        </div>

        {/* Frais de Livraison HT (708500) */}
        <div className="card" style={{ padding: '1.35rem', borderLeft: '5px solid #0891b2' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Livraisons Chantier HT (708500)
          </span>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#0e7490',
              marginTop: '0.25rem',
              lineHeight: 1.1,
            }}
          >
            {summary.totalLivraisonHt.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Ports et frais accessoires décomptés
          </div>
        </div>

        {/* TVA Collectée 20% (445710) */}
        <div className="card" style={{ padding: '1.35rem', borderLeft: '5px solid #d97706' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            TVA Collectée 20% (445710)
          </span>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#b45309',
              marginTop: '0.25rem',
              lineHeight: 1.1,
            }}
          >
            {summary.totalTvaCollectee.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Déclaration fiscale CA3 / TVA
          </div>
        </div>

        {/* Total TTC Clients Exigible (411000) */}
        <div className="card" style={{ padding: '1.35rem', borderLeft: '5px solid #059669' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Total TTC Clients (411000)
          </span>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#047857',
              marginTop: '0.25rem',
              lineHeight: 1.1,
            }}
          >
            {summary.totalTtcExigible.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
            {summary.transactionsCount} pièce(s) de vente
          </div>
        </div>

        {/* Cautions Hors Bilan (165000) */}
        <div className="card" style={{ padding: '1.35rem', borderLeft: '5px solid #64748b' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Cautions Sécurisées (Hors-Bilan)
          </span>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#334155',
              marginTop: '0.25rem',
              lineHeight: 1.1,
            }}
          >
            {summary.totalCautionsHorsBilan.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Empreintes CB / Chèques non encaissés
          </div>
        </div>
      </div>

      {/* Filtres par Période et Statuts */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Onglets rapides de Période */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {[
            { key: 'ALL', label: 'Tout l\'exercice' },
            { key: 'CURRENT_MONTH', label: 'Mois en cours' },
            { key: 'T1', label: 'Trimestre 1 (T1)' },
            { key: 'T2', label: 'Trimestre 2 (T2)' },
            { key: 'T3', label: 'Trimestre 3 (T3)' },
            { key: 'T4', label: 'Trimestre 4 (T4)' },
            { key: 'YEAR', label: 'Année 2026' },
          ].map((tab) => {
            const active = period === tab.key && !customStart;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setPeriod(tab.key);
                  setCustomStart('');
                  setCustomEnd('');
                }}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#ffffff' : 'var(--brand-slate)',
                  backgroundColor: active ? 'var(--brand-navy)' : '#f8fafc',
                  border: '1px solid',
                  borderColor: active ? 'var(--brand-navy)' : 'var(--border-light)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Barre de Recherche & Filtre Avancé */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1.5fr) minmax(160px, 1fr) auto auto',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          {/* Recherche texte */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Rechercher par n° de pièce, client, matériel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{
                paddingLeft: '2.4rem',
                width: '100%',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>

          {/* Filtre statut */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
              style={{ width: '100%', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
            >
              <option value="ALL">Tous les statuts validés</option>
              <option value="COMPLETED">Terminées / Réglées</option>
              <option value="IN_PROGRESS">Sur chantier (En cours)</option>
              <option value="CONFIRMED">Confirmées</option>
            </select>
          </div>

          {/* Sélection libre de dates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="input"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
              title="Date début"
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>à</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="input"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
              title="Date fin"
            />
          </div>

          {/* Sélecteur de Mode d'Affichage */}
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setViewMode('SUMMARY')}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: viewMode === 'SUMMARY' ? 700 : 500,
                backgroundColor: viewMode === 'SUMMARY' ? '#ffffff' : 'transparent',
                color: viewMode === 'SUMMARY' ? 'var(--brand-navy)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: viewMode === 'SUMMARY' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              Vue Factures
            </button>
            <button
              onClick={() => setViewMode('JOURNAL')}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: viewMode === 'JOURNAL' ? 700 : 500,
                backgroundColor: viewMode === 'JOURNAL' ? '#ffffff' : 'transparent',
                color: viewMode === 'JOURNAL' ? 'var(--brand-navy)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                boxShadow: viewMode === 'JOURNAL' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              Écritures PCG (Débit/Crédit)
            </button>
          </div>
        </div>
      </div>

      {/* Contenu : Vue Factures ou Vue Grand Livre PCG */}
      {viewMode === 'SUMMARY' ? (
        /* Tableau Vue Factures / Pièces de Vente */
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>N° Pièce</th>
                  <th>Date</th>
                  <th>Client / Entreprise</th>
                  <th>Matériel loué</th>
                  <th>Durée</th>
                  <th>Base HT (706000)</th>
                  <th>Livraison HT (708500)</th>
                  <th>Remise (709000)</th>
                  <th>TVA 20% (445710)</th>
                  <th>Total TTC (411000)</th>
                  <th>Caution (165000)</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Aucune transaction trouvée pour cette période.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id}>
                      {/* N° Pièce */}
                      <td>
                        <Link
                          href={`/admin/reservations/${tx.id}`}
                          style={{
                            fontWeight: 700,
                            color: 'var(--brand-blue-accent)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          {tx.reservationNumber}
                        </Link>
                      </td>

                      {/* Date */}
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {format(new Date(tx.date), 'dd/MM/yyyy')}
                      </td>

                      {/* Client */}
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--brand-navy)' }}>
                          {tx.customerCompany || tx.customerName}
                        </div>
                        {tx.customerCompany && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Attn : {tx.customerName}
                          </div>
                        )}
                      </td>

                      {/* Matériel */}
                      <td style={{ fontSize: '0.85rem' }}>
                        {tx.equipmentName}
                      </td>

                      {/* Durée */}
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {tx.rentalDays} j
                      </td>

                      {/* Base HT (706000) */}
                      <td>
                        <strong>{tx.basePriceHt.toFixed(2)} €</strong>
                      </td>

                      {/* Livraison HT (708500) */}
                      <td>
                        {tx.deliveryFeeHt > 0 ? (
                          <span>{tx.deliveryFeeHt.toFixed(2)} €</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      {/* Remise HT (709000) */}
                      <td>
                        {tx.promoDiscountHt > 0 ? (
                          <span style={{ color: '#b91c1c', fontWeight: 600 }}>
                            -{tx.promoDiscountHt.toFixed(2)} €
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>

                      {/* TVA (445710) */}
                      <td>
                        <span style={{ color: '#b45309', fontWeight: 600 }}>
                          {tx.tvaAmount.toFixed(2)} €
                        </span>
                      </td>

                      {/* Total TTC (411000) */}
                      <td>
                        <strong style={{ color: '#047857', fontSize: '0.95rem' }}>
                          {tx.totalTtc.toFixed(2)} €
                        </strong>
                      </td>

                      {/* Caution (165000) */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {tx.depositAmount.toFixed(0)} €
                        </span>
                      </td>

                      {/* Statut */}
                      <td>
                        {tx.status === 'COMPLETED' && (
                          <span className="badge badge-confirmed" style={{ fontSize: '0.7rem' }}>
                            Réglé
                          </span>
                        )}
                        {tx.status === 'IN_PROGRESS' && (
                          <span className="badge badge-in-progress" style={{ fontSize: '0.7rem' }}>
                            Sur chantier
                          </span>
                        )}
                        {tx.status === 'CONFIRMED' && (
                          <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
                            Confirmé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {/* Ligne de totalisation */}
              {filteredTransactions.length > 0 && (
                <tfoot>
                  <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800 }}>
                    <td colSpan={5} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      TOTAUX PÉRIODE SÉLECTIONNÉE ({filteredTransactions.length} pièces) :
                    </td>
                    <td>{summary.totalVentesHt.toFixed(2)} €</td>
                    <td>{summary.totalLivraisonHt.toFixed(2)} €</td>
                    <td style={{ color: '#b91c1c' }}>
                      {summary.totalRemisesHt > 0 ? `-${summary.totalRemisesHt.toFixed(2)} €` : '0.00 €'}
                    </td>
                    <td style={{ color: '#b45309' }}>{summary.totalTvaCollectee.toFixed(2)} €</td>
                    <td style={{ color: '#047857', fontSize: '1rem' }}>{summary.totalTtcExigible.toFixed(2)} €</td>
                    <td>{summary.totalCautionsHorsBilan.toFixed(0)} €</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      ) : (
        /* Vue Grand Livre / Écritures PCG Débit / Crédit */
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Journal</th>
                  <th>Date</th>
                  <th>N° Pièce</th>
                  <th>Compte PCG</th>
                  <th>Intitulé du Compte</th>
                  <th>Libellé de l'Écriture</th>
                  <th>Client / Société</th>
                  <th style={{ textAlign: 'right' }}>Débit (€)</th>
                  <th style={{ textAlign: 'right' }}>Crédit (€)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.flatMap((tx) =>
                  tx.rows.map((row, idx) => (
                    <tr key={`${tx.id}-${row.compteNum}-${idx}`}>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {row.journalCode}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {format(new Date(row.datePiece), 'dd/MM/yyyy')}
                      </td>
                      <td>
                        <strong>{row.pieceNumber}</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            backgroundColor: '#f1f5f9',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            color: 'var(--brand-navy)',
                          }}
                        >
                          {row.compteNum}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{row.compteLibelle}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--brand-slate)' }}>
                        {row.libelleEcriture}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {row.societeClient || row.nomClient}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: row.debit > 0 ? 700 : 400 }}>
                        {row.debit > 0 ? `${row.debit.toFixed(2)} €` : ''}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: row.credit > 0 ? 700 : 400 }}>
                        {row.credit > 0 ? `${row.credit.toFixed(2)} €` : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
