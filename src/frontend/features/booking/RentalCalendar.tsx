'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isBefore, 
  startOfDay,
  addDays,
  subDays,
  parseISO 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  XCircle, 
  Clock, 
  Sparkles, 
  Loader2,
  CalendarCheck
} from 'lucide-react';
import { DayAvailabilityInfo } from '@/backend/availability/availabilityService';

interface RentalCalendarProps {
  equipmentId: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  onDateChange: (start: string, end: string, pickupTime?: string, returnTime?: string) => void;
}

export function RentalCalendar({
  equipmentId,
  startDate,
  endDate,
  onDateChange,
}: RentalCalendarProps) {
  // Mois actuellement affiché dans le calendrier
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (startDate) {
      const [y, m, d] = startDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return startOfMonth(new Date());
  });

  const [daysData, setDaysData] = useState<Record<string, DayAvailabilityInfo>>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'warning' | 'info' | 'error' | 'success'; message: string } | null>(null);

  // Étape de sélection : 'START' = choix du retrait, 'END' = choix de la restitution
  const [selectingStep, setSelectingStep] = useState<'START' | 'END'>('START');

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = useMemo(() => format(today, 'yyyy-MM-dd'), [today]);

  const monthKey = format(currentMonth, 'yyyy-MM');

  // Chargement des disponibilités du mois affiché
  useEffect(() => {
    let isCancelled = false;
    async function fetchMonthAvailability() {
      setLoading(true);
      try {
        const res = await fetch(`/api/availability?equipmentId=${equipmentId}&month=${monthKey}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.days) {
            setDaysData(data.days);
          }
        }
      } catch (err) {
        console.error('Erreur chargement calendrier:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchMonthAvailability();
    return () => {
      isCancelled = true;
    };
  }, [equipmentId, monthKey]);

  // Déterminer les jours de la grille (lundi à dimanche)
  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Changement de mois
  const handlePrevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    const currentMonthStart = startOfMonth(new Date());
    if (isBefore(prev, currentMonthStart)) return;
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Trouver le prochain jour ouvré (du lundi au vendredi)
  const getNextWorkingDayStr = (fromStr: string): string => {
    const [y, m, d] = fromStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day === 6) {
      date.setDate(date.getDate() + 2); // Samedi -> Lundi
    } else if (day === 0) {
      date.setDate(date.getDate() + 1); // Dimanche -> Lundi
    }
    return format(date, 'yyyy-MM-dd');
  };

  // Clic sur une case du calendrier
  const handleDayClick = (day: Date, dayStr: string, info?: DayAvailabilityInfo) => {
    const isPast = isBefore(day, today);
    if (isPast) {
      setFeedback({
        type: 'info',
        message: 'Cette date est déjà passée. Veuillez choisir une date future.',
      });
      return;
    }

    const dayOfWeek = day.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Règle d'or : Dates déjà louées (en rouge)
    if (info?.isRentedOut || (info && !info.isAvailable)) {
      setFeedback({
        type: 'error',
        message: '🔴 Ce matériel est déjà entièrement loué à cette date. Veuillez choisir une date disponible en vert.',
      });
      return;
    }

    // GESTION FORFAIT WEEK-END AU CLIC SUR SAMEDI OU DIMANCHE :
    // Sélectionne toute la période du week-end (retrait vendredi soir 18h15, retour lundi matin 08h30)
    if (isWeekend) {
      const friday = dayOfWeek === 6 ? subDays(day, 1) : subDays(day, 2);
      const monday = dayOfWeek === 6 ? addDays(day, 2) : addDays(day, 1);
      const fridayStr = format(friday, 'yyyy-MM-dd');
      const mondayStr = format(monday, 'yyyy-MM-dd');

      if (isBefore(friday, today)) {
        setFeedback({
          type: 'info',
          message: 'Ce week-end est déjà commencé ou passé. Veuillez choisir un week-end à venir.',
        });
        return;
      }

      // Vérifier si le matériel est disponible pour le week-end
      const fridayInfo = daysData[fridayStr];
      const mondayInfo = daysData[mondayStr];

      if (fridayInfo?.isRentedOut || mondayInfo?.isRentedOut) {
        setFeedback({
          type: 'error',
          message: '🔴 Ce matériel est déjà réservé pour ce week-end. Veuillez choisir une autre date.',
        });
        return;
      }

      // Appliquer le forfait week-end complet avec horaires appropriés
      onDateChange(fridayStr, mondayStr, '18:15', '08:30');
      setSelectingStep('START');
      setFeedback({
        type: 'success',
        message: '✨ Forfait Week-end sélectionné : Retrait au plus tard vendredi soir (18h15) • Restitution au plus tôt lundi matin (08h30).',
      });
      return;
    }

    // Gestion de la sélection ordinaire en semaine (Lundi à Vendredi)
    if (selectingStep === 'START' || !startDate || dayStr < startDate) {
      // Choix de la date de départ (retrait)
      if (dayOfWeek === 5) {
        // Clic sur Vendredi : suggérer directement le Forfait Week-end jusqu'au lundi matin !
        const nextMonday = addDays(day, 3);
        const nextMondayStr = format(nextMonday, 'yyyy-MM-dd');
        onDateChange(dayStr, nextMondayStr, '18:15', '08:30');
        setSelectingStep('START');
        setFeedback({
          type: 'success',
          message: '✨ Départ vendredi sélectionné : Le Forfait Week-end jusqu’au lundi matin 08h30 est automatiquement pré-rempli !',
        });
      } else {
        const autoEnd = getNextWorkingDayStr(dayStr);
        onDateChange(dayStr, autoEnd);
        setSelectingStep('END');
        setFeedback({
          type: 'info',
          message: `Date de retrait : ${format(day, 'dd/MM/yyyy')}. Cliquez maintenant sur votre date de restitution.`,
        });
      }
    } else {
      // Choix de la date de fin (restitution)
      if (dayStr === startDate) {
        onDateChange(startDate, dayStr);
        setSelectingStep('START');
        setFeedback(null);
      } else if (dayStr > startDate) {
        onDateChange(startDate, dayStr);
        setSelectingStep('START');
        setFeedback(null);
      }
    }
  };

  // Vérifier si la sélection actuelle correspond au forfait week-end
  const isWeekendPackageSelected = useMemo(() => {
    if (!startDate || !endDate) return false;
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const sDate = new Date(sy, sm - 1, sd);
    const eDate = new Date(ey, em - 1, ed);
    return sDate.getDay() === 5 && eDate.getDay() === 1 && (eDate.getTime() - sDate.getTime() <= 4 * 86400000);
  }, [startDate, endDate]);

  // Vérifier si la plage actuellement sélectionnée traverse des dates indisponibles
  const rangeHasConflict = useMemo(() => {
    if (!startDate || !endDate) return false;
    for (const [dStr, info] of Object.entries(daysData)) {
      if (dStr >= startDate && dStr <= endDate) {
        if (info.isRentedOut) return true;
      }
    }
    return false;
  }, [startDate, endDate, daysData]);

  const canGoPrev = !isBefore(subMonths(currentMonth, 1), startOfMonth(new Date()));

  return (
    <div
      style={{
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: '#ffffff',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.25rem',
      }}
    >
      {/* Légende officielle claire avec le Pack Week-end */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.75rem',
          paddingBottom: '1rem',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--border-light)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              backgroundColor: '#ecfdf5',
              border: '2px solid #10b981',
              display: 'inline-block',
            }}
          />
          <strong style={{ color: '#047857' }}>Vert : Disponible</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              backgroundColor: '#fef2f2',
              border: '2px solid #ef4444',
              display: 'inline-block',
            }}
          />
          <strong style={{ color: '#b91c1c' }}>Rouge : Déjà loué</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              backgroundColor: '#fef3c7',
              border: '1.5px solid var(--brand-amber)',
              display: 'inline-block',
            }}
          />
          <strong style={{ color: 'var(--brand-amber-hover)' }}>Pack W-E (Ven. soir ➔ Lun. matin)</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              backgroundColor: '#1e40af',
              display: 'inline-block',
            }}
          />
          <span style={{ color: '#1e40af', fontWeight: 600 }}>Bleu : Période choisie</span>
        </div>
      </div>

      {/* En-tête mois et navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={18} style={{ color: 'var(--brand-amber)' }} />
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--brand-navy)',
              textTransform: 'capitalize',
              margin: 0,
            }}
          >
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h3>
          {loading && <Loader2 size={15} className="spin" style={{ color: 'var(--brand-blue-accent)' }} />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            aria-label="Mois précédent"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: canGoPrev ? '#ffffff' : '#f1f5f9',
              color: canGoPrev ? 'var(--brand-navy)' : '#94a3b8',
              cursor: canGoPrev ? 'pointer' : 'not-allowed',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Mois suivant"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              backgroundColor: '#ffffff',
              color: 'var(--brand-navy)',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grille des jours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {/* En-tête des colonnes (Lundi à Dimanche) */}
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, index) => {
          const isWeekendCol = index >= 5;
          return (
            <div
              key={d}
              style={{
                textAlign: 'center',
                padding: '0.4rem 0.2rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: isWeekendCol ? 'var(--brand-amber-hover)' : 'var(--brand-navy)',
                backgroundColor: isWeekendCol ? '#fefce8' : 'transparent',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {d}
              {isWeekendCol && (
                <div style={{ fontSize: '0.58rem', fontWeight: 600, color: 'var(--brand-amber)' }}>Pack W-E</div>
              )}
            </div>
          );
        })}

        {/* Cellules des dates */}
        {gridDays.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isPast = isBefore(day, today);
          const dayOfWeek = day.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          const info = daysData[dayStr];
          const isRentedOut = Boolean(info?.isRentedOut);
          const isAvailable = Boolean(info ? info.isAvailable : !isPast);

          // Statuts de sélection
          const isStart = startDate === dayStr;
          const isEnd = endDate === dayStr;
          const isInRange = Boolean(startDate && endDate && dayStr >= startDate && dayStr <= endDate);

          // Styles par défaut
          let bgColor = '#ffffff';
          let borderColor = 'var(--border-light)';
          let textColor = 'var(--text-main)';
          let cursorStyle = 'pointer';
          let badgeText = '';
          let badgeColor = '';

          if (!isCurrentMonth) {
            textColor = '#cbd5e1';
            bgColor = '#fafafa';
          }

          if (isPast) {
            textColor = '#cbd5e1';
            bgColor = '#f8fafc';
            cursorStyle = 'not-allowed';
          } else if (isRentedOut) {
            // ROUGE : Déjà loué
            bgColor = '#fef2f2';
            borderColor = '#ef4444';
            textColor = '#b91c1c';
            badgeText = 'Loué';
            badgeColor = '#ef4444';
          } else if (isWeekend) {
            // Week-end disponible : Forfait Week-end
            bgColor = '#fefce8';
            borderColor = 'var(--brand-amber)';
            textColor = 'var(--brand-amber-hover)';
            badgeText = 'Pack W-E';
            badgeColor = 'var(--brand-amber-hover)';
          } else if (isAvailable) {
            // VERT : Disponible en semaine
            bgColor = '#ecfdf5';
            borderColor = '#10b981';
            textColor = '#047857';
            badgeText = info?.availableUnitsCount && info.availableUnitsCount > 1 
              ? `${info.availableUnitsCount} dispo` 
              : 'Dispo';
            badgeColor = '#10b981';
          }

          // Surbrillance de la sélection active
          if (isStart || isEnd) {
            bgColor = '#1e40af';
            borderColor = '#1e3a8a';
            textColor = '#ffffff';
            badgeText = isStart 
              ? (isWeekendPackageSelected ? 'Ven. soir' : 'Retrait') 
              : (isWeekendPackageSelected ? 'Lun. matin' : 'Retour');
            badgeColor = '#ffffff';
          } else if (isInRange) {
            bgColor = '#eff6ff';
            borderColor = '#93c5fd';
            textColor = '#1e40af';
            if (isWeekend) {
              badgeText = 'Pack W-E';
              badgeColor = '#1e40af';
            }
          }

          return (
            <button
              key={dayStr}
              type="button"
              onClick={() => handleDayClick(day, dayStr, info)}
              disabled={isPast}
              title={
                isPast
                  ? 'Date passée'
                  : isWeekend
                  ? 'Forfait Week-end : Cliquez pour sélectionner du vendredi soir au lundi matin'
                  : isRentedOut
                  ? 'Déjà loué : matériel indisponible'
                  : `Disponible (${info?.availableUnitsCount || 1} unité(s))`
              }
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '48px',
                padding: '0.25rem 0.15rem',
                borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${borderColor}`,
                backgroundColor: bgColor,
                color: textColor,
                cursor: cursorStyle,
                position: 'relative',
                transition: 'all 0.15s ease',
                outline: 'none',
              }}
            >
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: isStart || isEnd ? 800 : isRentedOut || isAvailable ? 700 : 500,
                  lineHeight: 1,
                }}
              >
                {format(day, 'd')}
              </span>

              {badgeText && (
                <span
                  style={{
                    fontSize: '0.56rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginTop: '2px',
                    color: isStart || isEnd ? '#ffffff' : badgeColor,
                    lineHeight: 1,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {badgeText}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Message de feedback ou notification de sélection */}
      {feedback && (
        <div
          className={`alert ${
            feedback.type === 'error'
              ? 'alert-danger'
              : feedback.type === 'warning'
              ? 'alert-warning'
              : feedback.type === 'success'
              ? 'alert-success'
              : 'alert-info'
          }`}
          style={{ marginTop: '0.85rem', fontSize: '0.78rem', padding: '0.5rem 0.75rem' }}
        >
          {feedback.type === 'warning' ? (
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          ) : feedback.type === 'error' ? (
            <XCircle size={15} style={{ flexShrink: 0 }} />
          ) : feedback.type === 'success' ? (
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
          ) : (
            <Info size={15} style={{ flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>{feedback.message}</div>
        </div>
      )}

      {/* Alerte si la sélection chevauche des dates rouges */}
      {rangeHasConflict && (
        <div
          className="alert alert-danger"
          style={{ marginTop: '0.85rem', fontSize: '0.78rem', padding: '0.5rem 0.75rem' }}
        >
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <div>
            <strong>Période indisponible :</strong> La période choisie contient des dates déjà louées
            (marquées en rouge). Veuillez modifier vos dates pour que la location soit validée.
          </div>
        </div>
      )}

      {/* Encadré d'explication Forfait Week-end */}
      <div
        style={{
          marginTop: '0.85rem',
          padding: '0.65rem 0.75rem',
          backgroundColor: '#fefce8',
          border: '1px solid #fef08a',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.74rem',
          color: '#854d0e',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Sparkles size={16} style={{ color: 'var(--brand-amber)', flexShrink: 0 }} />
        <span>
          <strong>Astuce Chantier Week-end :</strong> Cliquez sur le <strong>samedi</strong> ou le <strong>dimanche</strong> pour appliquer automatiquement le <strong>Forfait Week-end</strong> avec retrait au plus tard le <strong>vendredi soir</strong> (18h15) et retour au plus tôt le <strong>lundi matin</strong> (08h30) !
        </span>
      </div>
    </div>
  );
}
