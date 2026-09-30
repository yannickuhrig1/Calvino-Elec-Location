'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Truck,
  MapPin,
  ShieldCheck,
  Info,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Mail,
  Building,
  Loader2,
  Lock,
  Tag,
  Sparkles,
  Percent,
  Ban
} from 'lucide-react';
import { calculateRentalPricing } from '@/lib/pricing';
import { RentalCalendar } from '@/components/RentalCalendar';

interface BookingFormProps {
  equipment: {
    id: string;
    slug: string;
    name: string;
    pricingType: string;
    priceHalfDay?: number | null;
    priceDay: number;
    priceWeekend?: number | null;
    priceWeek?: number | null;
    depositAmount: number;
    deliveryAvailable: boolean;
    deliveryFlatFee: number;
    minDurationHours: number;
  };
  currentUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    company?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
  } | null;
}

// Helpers de gestion des jours ouvrés (Lundi à Vendredi uniquement)
const formatLocalYMD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNextWorkingDay = (d: Date): Date => {
  const next = new Date(d);
  const day = next.getDay();
  if (day === 6) {
    next.setDate(next.getDate() + 2); // Samedi -> Lundi
  } else if (day === 0) {
    next.setDate(next.getDate() + 1); // Dimanche -> Lundi
  }
  return next;
};

const checkIsWeekend = (dateVal: string | Date): boolean => {
  if (typeof dateVal === 'string') {
    const [y, m, d] = dateVal.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const day = dt.getDay();
    return day === 0 || day === 6;
  }
  const day = dateVal.getDay();
  return day === 0 || day === 6;
};

export function BookingForm({ equipment, currentUser }: BookingFormProps) {
  const router = useRouter();

  // Dates par défaut : Prochains jours ouvrés (jamais samedi ni dimanche)
  const defaultStartDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getNextWorkingDay(tomorrow);
  }, []);

  const defaultEndDate = useMemo(() => {
    const end = new Date(defaultStartDate);
    end.setDate(end.getDate() + 1);
    return getNextWorkingDay(end);
  }, [defaultStartDate]);

  const [startDate, setStartDate] = useState(() => formatLocalYMD(defaultStartDate));
  const [endDate, setEndDate] = useState(() => formatLocalYMD(defaultEndDate));
  const [pickupTime, setPickupTime] = useState('08:30');
  const [returnTime, setReturnTime] = useState('17:30');
  const [deliveryMode, setDeliveryMode] = useState<'PICKUP_DEPOT' | 'DELIVERY_ON_SITE'>('PICKUP_DEPOT');
  const [deliveryAddress, setDeliveryAddress] = useState('');


  // Coordonnées client
  const [customerName, setCustomerName] = useState(
    currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ''
  );
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerCompany, setCustomerCompany] = useState(currentUser?.company || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.address || '');
  const [customerCity, setCustomerCity] = useState(currentUser?.city || '');
  const [customerPostalCode, setCustomerPostalCode] = useState(currentUser?.postalCode || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Gestion des codes promo
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    id: string;
    code: string;
    description?: string;
    discountType: string;
    discountValue: number;
    minAmountHt?: number | null;
    minRentalDays?: number | null;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // État de calcul et de disponibilité
  const [pricing, setPricing] = useState(() =>
    calculateRentalPricing({
      equipment,
      startDate: formatLocalYMD(defaultStartDate),
      endDate: formatLocalYMD(defaultEndDate),
      deliveryMode: 'PICKUP_DEPOT',
    })
  );

  const [availability, setAvailability] = useState<{
    loading: boolean;
    availableCount: number;
    isAvailable: boolean;
    pendingCount: number;
  }>({
    loading: false,
    availableCount: 2,
    isAvailable: true,
    pendingCount: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Recalcul du devis dès modification des paramètres ou du code promo
  useEffect(() => {
    try {
      const result = calculateRentalPricing({
        equipment,
        startDate,
        endDate,
        deliveryMode,
        deliveryAddress,
        promoCode: appliedPromo,
      });
      setPricing(result);
    } catch (err) {
      console.error(err);
    }
  }, [equipment, startDate, endDate, deliveryMode, deliveryAddress, appliedPromo]);

  // Validation et application d'un code promo
  const handleApplyPromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setPromoError('Veuillez saisir un code avantage.');
      return;
    }

    setPromoLoading(true);
    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          equipmentId: equipment.id,
          startDate,
          endDate,
          estimatedAmountHt: pricing.baseRentalHt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPromoError(data.error || 'Code promotionnel invalide.');
        setAppliedPromo(null);
      } else {
        setAppliedPromo(data.promoCode);
        setPromoSuccess(data.message || 'Code promo validé !');
      }
    } catch (err) {
      setPromoError('Impossible de vérifier le code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
    setPromoSuccess('');
  };

  // Vérification de disponibilité auprès du serveur
  useEffect(() => {
    let isCancelled = false;

    async function checkStock() {
      if (!startDate || !endDate) return;
      setAvailability((prev) => ({ ...prev, loading: true }));
      try {
        const res = await fetch(
          `/api/availability?equipmentId=${equipment.id}&startDate=${startDate}&endDate=${endDate}`
        );
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setAvailability({
              loading: false,
              availableCount: data.availableUnitsCount,
              isAvailable: data.isAvailable,
              pendingCount: data.pendingRequestsCount,
            });
          }
        }
      } catch (e) {
        console.error('Erreur vérification disponibilité', e);
      } finally {
        if (!isCancelled) {
          setAvailability((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    checkStock();

    return () => {
      isCancelled = true;
    };
  }, [equipment.id, startDate, endDate]);

  const isWeekendPackage = useMemo(() => {
    if (!startDate || !endDate) return false;
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const sDate = new Date(sy, sm - 1, sd);
    const eDate = new Date(ey, em - 1, ed);
    return sDate.getDay() === 5 && eDate.getDay() === 1 && (eDate.getTime() - sDate.getTime() <= 4 * 86400000);
  }, [startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Ajustement automatique en Forfait Week-end si des dates du week-end ont été saisies
    let finalStartDate = startDate;
    let finalEndDate = endDate;
    let finalPickupTime = pickupTime;
    let finalReturnTime = returnTime;

    if (checkIsWeekend(finalStartDate)) {
      const [y, m, d] = finalStartDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const dayOfWeek = dt.getDay();
      const friday = new Date(dt);
      friday.setDate(friday.getDate() - (dayOfWeek === 6 ? 1 : 2));
      finalStartDate = formatLocalYMD(friday);
      finalPickupTime = '18:15';
    }

    if (checkIsWeekend(finalEndDate)) {
      const [y, m, d] = finalEndDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const dayOfWeek = dt.getDay();
      const monday = new Date(dt);
      monday.setDate(monday.getDate() + (dayOfWeek === 6 ? 2 : 1));
      finalEndDate = formatLocalYMD(monday);
      finalReturnTime = '08:30';
    }

    if (!availability.isAvailable) {
      setErrorMessage('Ce matériel est déjà entièrement loué aux dates choisies (marqué en rouge sur le calendrier). Veuillez sélectionner une autre période.');
      return;
    }

    if (!acceptTerms) {
      setErrorMessage('Veuillez accepter les conditions de location et de caution pour valider votre demande.');
      return;
    }

    if (deliveryMode === 'DELIVERY_ON_SITE' && !deliveryAddress.trim()) {
      setErrorMessage('Veuillez indiquer l’adresse précise du chantier de livraison.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipmentId: equipment.id,
          startDate: finalStartDate,
          endDate: finalEndDate,
          pickupTime: finalPickupTime,
          returnTime: finalReturnTime,
          deliveryMode,
          deliveryAddress,
          customerName,
          customerEmail,
          customerPhone,
          customerCompany,
          customerAddress,
          customerCity,
          customerPostalCode,
          customerNotes,
          promoCode: appliedPromo ? appliedPromo.code : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors de l’envoi de votre demande.');
      }

      // Redirection vers la page de succès avec numéro de suivi
      router.push(`/reservation/confirmation?id=${data.reservation.id}&code=${data.reservation.reservationNumber}&secret=${data.reservation.secretAccessCode}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur réseau ou serveur');
      setSubmitting(false);
    }
  };

  const todayStr = formatLocalYMD(new Date());

  return (
    <form onSubmit={handleSubmit} className="card" style={{ boxShadow: 'var(--shadow-lg)' }}>
      {/* En-tête formulaire */}
      <div className="card-header" style={{ backgroundColor: 'var(--brand-navy)', color: '#ffffff' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.2rem' }}>
            Demande de réservation
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Validation humaine sous 2h ouvrées • Caution non débitée
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-pending">
            Statut initial : EN ATTENTE
          </span>
        </div>
      </div>

      <div className="card-body">
        {errorMessage && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* 1. Dates et Horaires */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-navy)', fontWeight: 700 }}>
              <Calendar size={18} style={{ color: 'var(--brand-amber)' }} />
              <span>1. Période de location</span>
            </div>
            {isWeekendPackage ? (
              <span className="badge badge-confirmed" style={{ fontSize: '0.72rem', backgroundColor: '#fef3c7', color: '#854d0e', border: '1px solid #fde68a' }}>
                ✨ Forfait Week-end actif
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Retraits & retours du lun. au ven.
              </span>
            )}
          </div>

          {/* CALENDRIER INTERACTIF AVEC GESTION DU FORFAIT WEEK-END */}
          <RentalCalendar
            equipmentId={equipment.id}
            startDate={startDate}
            endDate={endDate}
            onDateChange={(newStart, newEnd, newPickupTime, newReturnTime) => {
              setStartDate(newStart);
              setEndDate(newEnd);
              if (newPickupTime) setPickupTime(newPickupTime);
              if (newReturnTime) setReturnTime(newReturnTime);
            }}
          />

          {isWeekendPackage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.75rem',
                backgroundColor: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: 'var(--radius-sm)',
                color: '#854d0e',
                fontSize: '0.78rem',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={16} style={{ color: 'var(--brand-amber)', flexShrink: 0 }} />
              <div>
                <strong>Forfait Week-end appliqué :</strong> Retrait au plus tard le <strong>vendredi soir (18h15)</strong> et restitution au plus tôt le <strong>lundi matin (08h30)</strong> au tarif préférentiel week-end.
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Date de début (retrait)</span>
                {isWeekendPackage && <span style={{ color: 'var(--brand-amber-hover)', fontWeight: 700, fontSize: '0.72rem' }}>Ven. soir</span>}
              </label>
              <input
                type="date"
                className="form-input"
                min={todayStr}
                value={startDate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (checkIsWeekend(val)) {
                    const [y, m, d] = val.split('-').map(Number);
                    const dt = new Date(y, m - 1, d);
                    const dayOfWeek = dt.getDay();
                    const friday = new Date(dt);
                    friday.setDate(friday.getDate() - (dayOfWeek === 6 ? 1 : 2));
                    const monday = new Date(dt);
                    monday.setDate(monday.getDate() + (dayOfWeek === 6 ? 2 : 1));
                    setStartDate(formatLocalYMD(friday));
                    setEndDate(formatLocalYMD(monday));
                    setPickupTime('18:15');
                    setReturnTime('08:30');
                  } else {
                    setStartDate(val);
                    if (val > endDate) {
                      setEndDate(val);
                    }
                  }
                }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Date de fin (restitution)</span>
                {isWeekendPackage && <span style={{ color: 'var(--brand-amber-hover)', fontWeight: 700, fontSize: '0.72rem' }}>Lun. matin</span>}
              </label>
              <input
                type="date"
                className="form-input"
                min={startDate || todayStr}
                value={endDate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (checkIsWeekend(val)) {
                    const [y, m, d] = val.split('-').map(Number);
                    const dt = new Date(y, m - 1, d);
                    const dayOfWeek = dt.getDay();
                    const monday = new Date(dt);
                    monday.setDate(monday.getDate() + (dayOfWeek === 6 ? 2 : 1));
                    setEndDate(formatLocalYMD(monday));
                    setReturnTime('08:30');
                  } else {
                    setEndDate(val);
                  }
                }}
                required
              />
            </div>
          </div>



          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Heure souhaitée départ</label>
              <select
                className="form-select"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
              >
                <option value="07:30">07:30 (ouverture)</option>
                <option value="08:30">08:30</option>
                <option value="10:00">10:00</option>
                <option value="11:30">11:30</option>
                <option value="14:00">14:00</option>
                <option value="16:00">16:00</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Heure souhaitée retour</label>
              <select
                className="form-select"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
              >
                <option value="11:30">11:30</option>
                <option value="14:00">14:00</option>
                <option value="16:00">16:00</option>
                <option value="17:30">17:30</option>
                <option value="18:15">18:15 (avant fermeture)</option>
              </select>
            </div>
          </div>

          {/* Indicateur de disponibilité réelle */}
          <div style={{ marginTop: '0.875rem' }}>
            {availability.loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Loader2 size={14} className="spin" />
                <span>Contrôle de disponibilité du parc en cours...</span>
              </div>
            ) : availability.isAvailable ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#047857', backgroundColor: '#ecfdf5', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <CheckCircle2 size={16} />
                <span>
                  <strong>Disponible aux dates choisies !</strong> ({availability.availableCount} unité(s) libre(s)
                  {availability.pendingCount > 0 ? ` • ${availability.pendingCount} demande(s) en examen` : ''})
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#b45309', backgroundColor: '#fffbeb', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <AlertCircle size={16} />
                <span>
                  Attention : toutes les unités sont actuellement réservées pour cette période. Vous pouvez envoyer votre demande, nous chercherons une solution de réaffectation prioritaire.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Mode de mise à disposition */}
        <div style={{ marginBottom: '1.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--brand-navy)', fontWeight: 700 }}>
            <Truck size={18} style={{ color: 'var(--brand-amber)' }} />
            <span>2. Retrait ou Livraison</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <label
              style={{
                border: deliveryMode === 'PICKUP_DEPOT' ? '2px solid var(--brand-blue-accent)' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                cursor: 'pointer',
                backgroundColor: deliveryMode === 'PICKUP_DEPOT' ? 'var(--brand-blue-light)' : '#ffffff',
                display: 'block',
              }}
            >
              <input
                type="radio"
                name="deliveryMode"
                value="PICKUP_DEPOT"
                checked={deliveryMode === 'PICKUP_DEPOT'}
                onChange={() => setDeliveryMode('PICKUP_DEPOT')}
                style={{ marginRight: '0.5rem' }}
              />
              <strong>Retrait au dépôt (Gratuit)</strong>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                71 RUE DE LA FONTENELLE, 57420 COIN-LES-CUVRY
              </div>
            </label>

            <label
              style={{
                border: deliveryMode === 'DELIVERY_ON_SITE' ? '2px solid var(--brand-blue-accent)' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem',
                cursor: equipment.deliveryAvailable ? 'pointer' : 'not-allowed',
                backgroundColor: deliveryMode === 'DELIVERY_ON_SITE' ? 'var(--brand-blue-light)' : '#ffffff',
                opacity: equipment.deliveryAvailable ? 1 : 0.6,
                display: 'block',
              }}
            >
              <input
                type="radio"
                name="deliveryMode"
                value="DELIVERY_ON_SITE"
                disabled={!equipment.deliveryAvailable}
                checked={deliveryMode === 'DELIVERY_ON_SITE'}
                onChange={() => setDeliveryMode('DELIVERY_ON_SITE')}
                style={{ marginRight: '0.5rem' }}
              />
              <strong>Livraison sur chantier</strong>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {equipment.deliveryAvailable
                  ? `Forfait A/R Moselle (Metz & environs) : +${(equipment.deliveryFlatFee || 25).toFixed(2)} € HT`
                  : 'Non disponible pour ce matériel'}
              </div>
            </label>
          </div>

          {deliveryMode === 'DELIVERY_ON_SITE' && (
            <div className="form-group">
              <label className="form-label">Adresse de livraison sur chantier *</label>
              <input
                type="text"
                className="form-input"
                placeholder="N°, rue, code postal, ville et consignes d'accès chantier"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* 3. Vos coordonnées */}
        <div style={{ marginBottom: '1.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--brand-navy)', fontWeight: 700 }}>
            <User size={18} style={{ color: 'var(--brand-amber)' }} />
            <span>3. Coordonnées de réservation</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nom et Prénom *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex : Thomas Dubois"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Entreprise (facultatif)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex : Dubois Bâtiment SAS"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Adresse email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="contact@exemple.fr"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
              <span className="form-hint">Vous y recevrez la confirmation et le lien de suivi.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Numéro de téléphone *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="06 12 34 56 78"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
              <span className="form-hint">Indispensable pour le contact le jour du retrait.</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Adresse postale de facturation *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Numéro et nom de voie"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Code postal</label>
              <input
                type="text"
                className="form-input"
                placeholder="93200"
                value={customerPostalCode}
                onChange={(e) => setCustomerPostalCode(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ville</label>
              <input
                type="text"
                className="form-input"
                placeholder="Metz / Coin-lès-Cuvry"
                value={customerCity}
                onChange={(e) => setCustomerCity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Précisions ou besoins spécifiques (facultatif)</label>
            <textarea
              className="form-textarea"
              placeholder="Ex : accès difficile, présence d'un quai de déchargement, besoin de buses supplémentaires..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Encadré Code Promo / Avantage */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: appliedPromo ? '0.5rem' : '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand-navy)' }}>
              <Tag size={16} style={{ color: 'var(--brand-amber)' }} />
              <span>Code promotionnel ou avantage</span>
            </div>
            {appliedPromo && (
              <span className="badge badge-confirmed" style={{ fontSize: '0.75rem' }}>
                Code activé
              </span>
            )}
          </div>

          {appliedPromo ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <code style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857', fontFamily: 'monospace' }}>
                    {appliedPromo.code}
                  </code>
                  <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
                    {appliedPromo.discountType === 'PERCENTAGE'
                      ? `(-${appliedPromo.discountValue}%)`
                      : `(-${appliedPromo.discountValue.toFixed(2)} € HT)`}
                  </span>
                </div>
                {appliedPromo.description && (
                  <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '0.15rem' }}>
                    {appliedPromo.description}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', color: '#b91c1c', borderColor: '#fca5a5', padding: '0.25rem 0.5rem', backgroundColor: '#ffffff' }}
              >
                Retirer
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Ex : BIENVENUE10, PROBTP50..."
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem' }}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoCodeInput.trim()}
                  className="btn btn-dark"
                  style={{ flexShrink: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  {promoLoading ? <Loader2 size={16} className="spinner" /> : 'Appliquer'}
                </button>
              </div>
              {promoError && (
                <div style={{ fontSize: '0.775rem', color: '#dc2626', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={13} />
                  <span>{promoError}</span>
                </div>
              )}
              {promoSuccess && (
                <div style={{ fontSize: '0.775rem', color: '#059669', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={13} />
                  <span>{promoSuccess}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Récapitulatif Financier Transparent */}
        <div style={{
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--brand-navy)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Détail estimatif du devis ({pricing.rentalDays} jour{pricing.rentalDays > 1 ? 's' : ''})</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              {pricing.rateAppliedDescription}
            </span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Loyer matériel de base :</span>
              <span>{pricing.baseRentalHt.toFixed(2)} € HT</span>
            </div>

            {pricing.discountPercentage > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857' }}>
                <span>Remise longue durée (-{pricing.discountPercentage}%) :</span>
                <span>-{pricing.discountAmountHt.toFixed(2)} € HT</span>
              </div>
            )}

            {pricing.promoDiscountHt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857', fontWeight: 600 }}>
                <span>Code promo appliqué ({pricing.promoCodeApplied}) :</span>
                <span>-{pricing.promoDiscountHt.toFixed(2)} € HT</span>
              </div>
            )}

            {pricing.deliveryFeeHt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Livraison et reprise sur chantier (A/R) :</span>
                <span>{pricing.deliveryFeeHt.toFixed(2)} € HT</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-medium)', fontWeight: 600 }}>
              <span>Sous-total HT :</span>
              <span>{pricing.subtotalHt.toFixed(2)} € HT</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>TVA (20,0 %) :</span>
              <span>{pricing.taxAmount.toFixed(2)} €</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: '0.75rem',
              borderTop: '2px solid var(--brand-navy)',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--brand-navy)'
            }}>
              <span>Total Location TTC :</span>
              <span style={{ color: 'var(--brand-blue-accent)' }}>{pricing.totalTtc.toFixed(2)} € TTC</span>
            </div>

            {/* Encadré Caution Distincte */}
            <div style={{
              marginTop: '0.875rem',
              padding: '0.875rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--brand-slate)' }}>
                  Dépôt de garantie (Caution) :
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-amber-hover)' }}>
                  {pricing.depositAmount.toFixed(0)} €
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                <Lock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                La caution n'est <strong>pas débitée</strong> en ligne. Elle fera l'objet d'une empreinte par carte bancaire ou chèque d'entreprise lors de la mise à disposition, intégralement restituée au retour après contrôle.
              </div>
            </div>
          </div>
        </div>

        {/* 5. Conditions et validation */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{ marginTop: '0.2rem' }}
              required
            />
            <span>
              J’accepte les <a href="/conditions-location" target="_blank" style={{ textDecoration: 'underline', color: 'var(--brand-blue-accent)' }}>Conditions Générales de Location</a> et je m'engage à fournir les justificatifs d'identité ainsi que la caution réglementaire lors de la remise de l'équipement.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || !availability.isAvailable}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            opacity: !availability.isAvailable ? 0.6 : 1,
            cursor: !availability.isAvailable ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="spin" />
              <span>Enregistrement de votre demande...</span>
            </>
          ) : !availability.isAvailable ? (
            <>
              <AlertCircle size={18} />
              <span>Matériel déjà loué sur cette période</span>
            </>
          ) : (
            <>
              <span>Envoyer ma demande de réservation</span>
              <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>(Statut EN ATTENTE)</span>
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          Aucun paiement requis immédiatement • Devis confirmé sous 2h ouvrées par notre équipe
        </p>

      </div>
    </form>
  );
}
