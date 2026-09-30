'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EquipmentFinancialStats,
  GlobalParcFinancials,
} from '@/lib/accounting';
import { EquipmentFinancialModal } from './EquipmentFinancialModal';
import {
  TrendingUp,
  Download,
  Printer,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Wrench,
  Search,
  Filter,
  ArrowUpRight,
  Edit2,
  RefreshCw,
  Coins,
  ShieldCheck,
  Layers,
  ChevronRight,
  Flame,
  Info,
  FileSpreadsheet,
} from 'lucide-react';

interface ClientProps {
  equipments: EquipmentFinancialStats[];
  parcFinancials: GlobalParcFinancials;
}

export function RentabiliteClient({
  equipments,
  parcFinancials,
}: ClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'STAR' | 'RENTABLE' | 'EN_COURS' | 'SOUS_EXPLOITE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'CA' | 'MARGE' | 'RECOUVREMENT' | 'PRIX'>('RECOUVREMENT');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentFinancialStats | null>(null);

  // Catégories uniques
  const categories = Array.from(new Set(equipments.map((e) => e.categoryName)));

  // Filtrage et tri
  const filteredEquipments = equipments
    .filter((eq) => {
      const matchSearch =
        eq.name.toLowerCase().includes(search.toLowerCase()) ||
        (eq.brand && eq.brand.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || eq.statutRentabilite === statusFilter;
      const matchCategory = categoryFilter === 'ALL' || eq.categoryName === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'CA') return b.caTotalHt - a.caTotalHt;
      if (sortBy === 'MARGE') return b.margeNetteHt - a.margeNetteHt;
      if (sortBy === 'PRIX') return b.purchasePriceHt - a.purchasePriceHt;
      return b.pourcentageRemboursement - a.pourcentageRemboursement;
    });

  const starsCount = equipments.filter((e) => e.statutRentabilite === 'STAR').length;
  const sousExploiteCount = equipments.filter((e) => e.statutRentabilite === 'SOUS_EXPLOITE').length;

  return (
    <div>
      {/* Header avec Actions d'Export */}
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
              Devis Réel MaxOutil : 4 777,49 € HT
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Mise à jour en temps réel
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--brand-navy)', letterSpacing: '-0.02em' }}>
            Rentabilité & Amortissements du Parc
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Suivi des seuils d'amortissement (Break-even), dotations mensuelles et marges nettes par machine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.refresh()}
            className="btn btn-outline btn-sm"
            title="Rafraîchir les calculs"
          >
            <RefreshCw size={14} />
            <span>Actualiser</span>
          </button>

          <a
            href="/api/admin/accounting/export-rentabilite-excel"
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
            href="/api/admin/accounting/export-rentabilite"
            className="btn btn-outline btn-sm"
            download
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Format texte brut CSV pour imports spécifiques"
          >
            <Download size={14} />
            <span>Format CSV Brut</span>
          </a>

          <Link
            href="/admin/comptabilite/imprimer"
            target="_blank"
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={14} />
            <span>Vue Imprimable / PDF</span>
          </Link>
        </div>
      </div>

      {/* 5 KPIs Principaux */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* KPI 1 : Valeur Brute Acquisition */}
        <div className="card" style={{ padding: '1.4rem', borderLeft: '5px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Investissement Matériel
              </span>
              <div
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: 'var(--brand-navy)',
                  marginTop: '0.25rem',
                  lineHeight: 1.1,
                }}
              >
                {parcFinancials.totalInvestissementHt.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                })}{' '}
                €
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Coins size={22} />
            </div>
          </div>
          <div
            style={{
              marginTop: '0.65rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            9 équipements acquis (Devis MaxOutil)
          </div>
        </div>

        {/* KPI 2 : Amortissement Cumulé & VNC */}
        <div className="card" style={{ padding: '1.4rem', borderLeft: '5px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Amortissement à date
              </span>
              <div
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: '#b45309',
                  marginTop: '0.25rem',
                  lineHeight: 1.1,
                }}
              >
                {parcFinancials.totalAmortissementCumuleHt.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                })}{' '}
                €
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#fffbeb',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={22} />
            </div>
          </div>
          <div
            style={{
              marginTop: '0.65rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            VNC restante : <strong>{parcFinancials.totalVncRestanteHt.toFixed(2)} € HT</strong>
          </div>
        </div>

        {/* KPI 3 : Chiffre d'Affaires Locations */}
        <div className="card" style={{ padding: '1.4rem', borderLeft: '5px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                CA Locations Encaissé
              </span>
              <div
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: '#047857',
                  marginTop: '0.25rem',
                  lineHeight: 1.1,
                }}
              >
                {parcFinancials.totalCaGenereHt.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                })}{' '}
                €
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowUpRight size={22} />
            </div>
          </div>
          <div
            style={{
              marginTop: '0.65rem',
              fontSize: '0.8rem',
              color: '#047857',
              fontWeight: 600,
            }}
          >
            {parcFinancials.nbEquipementsRentabilises} / {parcFinancials.nbEquipementsTotal} matériel(s) 100% remboursé(s)
          </div>
        </div>

        {/* KPI 4 : Marge Nette Globale */}
        <div className="card" style={{ padding: '1.4rem', borderLeft: '5px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Marge Nette Déduite
              </span>
              <div
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: parcFinancials.margeNetteGlobaleHt >= 0 ? '#047857' : '#b91c1c',
                  marginTop: '0.25rem',
                  lineHeight: 1.1,
                }}
              >
                {parcFinancials.margeNetteGlobaleHt > 0 ? '+' : ''}
                {parcFinancials.margeNetteGlobaleHt.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                })}{' '}
                €
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#eef2ff',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} />
            </div>
          </div>
          <div
            style={{
              marginTop: '0.65rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            CA − Amortissement doté − Entretien ({parcFinancials.totalMaintenanceHt} €)
          </div>
        </div>

        {/* KPI 5 : Taux de couverture global */}
        <div className="card" style={{ padding: '1.4rem', borderLeft: '5px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Remboursement Global
              </span>
              <div
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: 'var(--brand-navy)',
                  marginTop: '0.25rem',
                  lineHeight: 1.1,
                }}
              >
                {parcFinancials.tauxCouvertureGlobal.toFixed(1)}%
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#f5f3ff',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flame size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.65rem' }}>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#e2e8f0',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, parcFinancials.tauxCouvertureGlobal)}%`,
                  height: '100%',
                  backgroundColor: '#8b5cf6',
                  borderRadius: '999px',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'Analyse Intelligente / Insight du Dirigeant */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <strong style={{ display: 'block', color: 'var(--brand-navy)', fontSize: '0.95rem' }}>
              Diagnostic de performance CALVINO ELEC :
            </strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {starsCount > 0
                ? `${starsCount} machine(s) sur-performante(s) remboursée(s) ou en passe de l'être. `
                : ''}
              {sousExploiteCount > 0
                ? `${sousExploiteCount} machine(s) avec faible taux de rotation à mettre en avant.`
                : 'Très bonne répartition des sorties de matériel sur l\'ensemble du parc.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-confirmed" style={{ fontSize: '0.75rem' }}>
            {starsCount} Machine(s) Star
          </span>
          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
            {equipments.filter((e) => e.statutRentabilite === 'RENTABLE').length} En forte traction
          </span>
          {sousExploiteCount > 0 && (
            <span className="badge badge-pending" style={{ fontSize: '0.75rem' }}>
              {sousExploiteCount} À promouvoir
            </span>
          )}
        </div>
      </div>

      {/* Barre de Recherche & Filtres */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 1.5fr) repeat(auto-fit, minmax(180px, 1fr))',
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
              placeholder="Rechercher par nom de machine ou marque..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{
                paddingLeft: '2.4rem',
                width: '100%',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>

          {/* Filtre Catégorie */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input"
              style={{ width: '100%', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
            >
              <option value="ALL">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Statut de Rentabilité */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input"
              style={{ width: '100%', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
            >
              <option value="ALL">Tous les statuts de rentabilité</option>
              <option value="STAR">⭐ Machines Stars (100% remboursées)</option>
              <option value="RENTABLE">📈 Rentables (&gt;40% amorties)</option>
              <option value="EN_COURS">⏳ En cours d'amortissement</option>
              <option value="SOUS_EXPLOITE">⚠️ Sous-exploitées</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input"
              style={{ width: '100%', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
            >
              <option value="RECOUVREMENT">Trier par : % Remboursement</option>
              <option value="CA">Trier par : Chiffre d'Affaires HT</option>
              <option value="MARGE">Trier par : Marge Nette HT</option>
              <option value="PRIX">Trier par : Prix d'achat HT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau détaillé d'Amortissement & Seuil de Rentabilité */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div className="table-responsive">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Matériel & Marque</th>
                <th>Investissement HT</th>
                <th>Amort. Fiscal</th>
                <th>Tarif / Jour</th>
                <th>Progression Seuil (Break-Even)</th>
                <th>Jours Loués</th>
                <th>CA Encaissé</th>
                <th>Marge Nette</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipments.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Aucun matériel ne correspond aux critères de filtre.
                  </td>
                </tr>
              ) : (
                filteredEquipments.map((eq) => {
                  const percent = Math.min(100, Math.round(eq.pourcentageRemboursement));
                  const is100 = eq.isRentabilise;

                  return (
                    <tr key={eq.equipmentId} style={{ transition: 'background-color 0.15s ease' }}>
                      {/* 1. Matériel */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={eq.imageUrl}
                            alt={eq.name}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: 'var(--radius-sm)',
                              objectFit: 'cover',
                              border: '1px solid var(--border-light)',
                            }}
                          />
                          <div>
                            <strong style={{ color: 'var(--brand-navy)', display: 'block' }}>
                              {eq.name}
                            </strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {eq.brand || 'Calvino'} • {eq.categoryName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Prix d'achat HT */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                          {eq.purchasePriceHt.toFixed(2)} €
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          VNC : {eq.vncRestanteHt.toFixed(2)} €
                        </div>
                      </td>

                      {/* 3. Durée fiscale */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                          }}
                        >
                          {eq.amortizationYears} ans
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {eq.dotationMensuelleHt.toFixed(2)} €/mois
                        </div>
                      </td>

                      {/* 4. Tarif / Jour */}
                      <td>
                        <strong>{eq.priceDay.toFixed(0)} €</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> HT</span>
                      </td>

                      {/* 5. Progression Seuil de Rentabilité */}
                      <td style={{ minWidth: '180px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 700, color: is100 ? '#047857' : 'var(--brand-navy)' }}>
                            {eq.pourcentageRemboursement.toFixed(1)}% remboursé
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {eq.seuilRentabiliteJours} j seuil
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '7px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '999px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              backgroundColor: is100
                                ? '#059669'
                                : percent >= 50
                                ? '#2563eb'
                                : '#d97706',
                              borderRadius: '999px',
                              transition: 'width 0.5s ease-in-out',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {is100 ? (
                            <span style={{ color: '#047857', fontWeight: 600 }}>
                              Seuil franchi (+{eq.beneficeNetApresAmortissement} €)
                            </span>
                          ) : (
                            <span>Plus que {eq.joursRestantsPourRentabiliser} j pour amortir</span>
                          )}
                        </div>
                      </td>

                      {/* 6. Jours Loués */}
                      <td>
                        <strong>{eq.totalJoursLoues} j</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {eq.nbLocations} sortie(s)
                        </div>
                      </td>

                      {/* 7. CA Encaissé HT */}
                      <td>
                        <strong style={{ color: '#047857' }}>
                          {eq.caTotalHt.toFixed(2)} €
                        </strong>
                      </td>

                      {/* 8. Marge Nette */}
                      <td>
                        <strong style={{ color: eq.margeNetteHt >= 0 ? '#047857' : '#b45309' }}>
                          {eq.margeNetteHt > 0 ? '+' : ''}
                          {eq.margeNetteHt.toFixed(2)} €
                        </strong>
                        {eq.maintenanceCostsHt > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#b91c1c' }}>
                            - {eq.maintenanceCostsHt} € entret.
                          </div>
                        )}
                      </td>

                      {/* 9. Statut Rentabilité */}
                      <td>
                        {eq.statutRentabilite === 'STAR' && (
                          <span className="badge badge-confirmed" style={{ fontSize: '0.72rem' }}>
                            ⭐ Rentabilisé
                          </span>
                        )}
                        {eq.statutRentabilite === 'RENTABLE' && (
                          <span className="badge badge-in-progress" style={{ fontSize: '0.72rem' }}>
                            📈 Rentable
                          </span>
                        )}
                        {eq.statutRentabilite === 'EN_COURS' && (
                          <span className="badge badge-pending" style={{ fontSize: '0.72rem' }}>
                            ⏳ En cours
                          </span>
                        )}
                        {eq.statutRentabilite === 'SOUS_EXPLOITE' && (
                          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                            ⚠️ À promouvoir
                          </span>
                        )}
                      </td>

                      {/* 10. Bouton Modifier Paramètres Financiers */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedEquipment(eq)}
                          className="btn btn-outline btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.75rem',
                            padding: '0.35rem 0.65rem',
                          }}
                          title="Modifier le prix d'achat ou durée d'amortissement"
                        >
                          <Edit2 size={13} />
                          <span>Ajuster</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'édition des paramètres financiers */}
      {selectedEquipment && (
        <EquipmentFinancialModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
