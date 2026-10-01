import React from 'react';
import Link from 'next/link';
import prisma from '@/backend/db/prisma';
import { EquipmentCard } from '@/frontend/features/booking/EquipmentCard';
import { Search, Filter, Calendar, X, SlidersHorizontal, Info } from 'lucide-react';
import { parseISO, isValid } from 'date-fns';
import { checkEquipmentAvailability } from '@/backend/availability/availabilityService';

export const dynamic = 'force-dynamic';

interface MaterielsPageProps {
  searchParams: {
    q?: string;
    cat?: string;
    sort?: string;
    start?: string;
    end?: string;
  };
}

export default async function MaterielsPage({ searchParams }: MaterielsPageProps) {
  const query = searchParams.q?.trim() || '';
  const categorySlug = searchParams.cat || '';
  const sort = searchParams.sort || 'default';
  const startStr = searchParams.start || '';
  const endStr = searchParams.end || '';

  // Récupérer les catégories actives
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: { select: { equipments: true } },
    },
  });

  // Construction du filtre Prisma
  const where: any = {
    published: true,
    archived: false,
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (query) {
    where.OR = [
      { name: { contains: query } },
      { summary: { contains: query } },
      { description: { contains: query } },
      { brand: { contains: query } },
      { model: { contains: query } },
    ];
  }

  // Tri
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') {
    orderBy = { priceDay: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { priceDay: 'desc' };
  } else if (sort === 'name_asc') {
    orderBy = { name: 'asc' };
  }

  const rawEquipments = await prisma.equipment.findMany({
    where,
    orderBy,
    include: {
      category: true,
      units: {
        where: { status: { not: 'OUT_OF_SERVICE' } },
      },
    },
  });

  // Si des dates ont été fournies, calculer la disponibilité réelle pour chaque équipement
  let hasDateFilter = false;
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (startStr && endStr) {
    const s = parseISO(startStr);
    const e = parseISO(endStr);
    if (isValid(s) && isValid(e) && s <= e) {
      hasDateFilter = true;
      startDate = s;
      endDate = e;
    }
  }

  const equipmentsWithAvailability = await Promise.all(
    rawEquipments.map(async (eq) => {
      let availableUnitsCount = eq.units.filter((u) => u.status === 'AVAILABLE').length;

      if (hasDateFilter && startDate && endDate) {
        const avail = await checkEquipmentAvailability(eq.id, startDate, endDate);
        availableUnitsCount = avail.availableUnitsCount;
      }

      return {
        ...eq,
        availableUnitsCount,
      };
    })
  );

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* En-tête de la page */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>Accueil</Link>
            <span>/</span>
            <span style={{ color: 'var(--brand-navy)', fontWeight: 600 }}>Catalogue de location</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', color: 'var(--brand-navy)', marginBottom: '0.5rem' }}>
            Matériels & Engins de Chantier
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '750px' }}>
            Consultez nos matériels professionnels disponibles à la location. Tarifs dégressifs à la journée, forfait week-end et forfaits longue durée.
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', backgroundColor: '#ffffff' }}>
          <form method="GET" action="/materiels" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Recherche texte */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span>Mot-clé</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Compresseur, 250 bar, bétonnière..."
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Sélecteur Catégorie */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Catégorie</label>
              <select name="cat" defaultValue={categorySlug} className="form-select">
                <option value="">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name} ({c._count.equipments})
                  </option>
                ))}
              </select>
            </div>

            {/* Date début */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date début</label>
              <input
                type="date"
                name="start"
                defaultValue={startStr}
                className="form-input"
              />
            </div>

            {/* Date fin */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date fin</label>
              <input
                type="date"
                name="end"
                defaultValue={endStr}
                className="form-input"
              />
            </div>

            {/* Tri */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Trier par</label>
              <select name="sort" defaultValue={sort} className="form-select">
                <option value="default">Nouveautés & Recommandés</option>
                <option value="price_asc">Prix : croissant</option>
                <option value="price_desc">Prix : décroissant</option>
                <option value="name_asc">Nom alphabétique</option>
              </select>
            </div>

            {/* Bouton Filtrer */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                <span>Filtrer</span>
              </button>
              {(query || categorySlug || startStr || endStr || sort !== 'default') && (
                <Link href="/materiels" className="btn btn-outline" title="Réinitialiser les filtres">
                  <X size={16} />
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Pilules de catégories rapides */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
          <Link
            href="/materiels"
            className={`badge ${!categorySlug ? 'badge-confirmed' : 'badge-neutral'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', textDecoration: 'none' }}
          >
            Tous les matériels ({rawEquipments.length})
          </Link>
          {categories.map((c) => {
            const active = categorySlug === c.slug;
            return (
              <Link
                key={c.id}
                href={`/materiels?cat=${c.slug}${startStr ? `&start=${startStr}&end=${endStr}` : ''}`}
                className={`badge ${active ? 'badge-confirmed' : 'badge-neutral'}`}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                {c.name}
              </Link>
            );
          })}
        </div>

        {/* Alerte si filtre par date actif */}
        {hasDateFilter && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <Calendar size={18} style={{ flexShrink: 0 }} />
            <div>
              Disponibilités filtrées pour la période du <strong>{startStr}</strong> au <strong>{endStr}</strong>. Les badges indiquent le nombre d'unités physiques libres sur cet intervalle précis.
            </div>
          </div>
        )}

        {/* Grille des résultats */}
        {equipmentsWithAvailability.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <Search size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Aucun matériel ne correspond à votre recherche</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              Essayez de modifier vos mots-clés ou de réinitialiser les dates et catégories sélectionnées.
            </p>
            <Link href="/materiels" className="btn btn-outline">
              Voir tout le catalogue
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {equipmentsWithAvailability.map((eq) => (
              <EquipmentCard
                key={eq.id}
                equipment={{
                  id: eq.id,
                  slug: eq.slug,
                  name: eq.name,
                  summary: eq.summary,
                  brand: eq.brand,
                  model: eq.model,
                  imageUrl: eq.imageUrl,
                  priceDay: eq.priceDay,
                  priceWeekend: eq.priceWeekend,
                  priceWeek: eq.priceWeek,
                  depositAmount: eq.depositAmount,
                  pricingType: eq.pricingType,
                  category: {
                    name: eq.category.name,
                    slug: eq.category.slug,
                  },
                  availableCount: eq.availableUnitsCount,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
