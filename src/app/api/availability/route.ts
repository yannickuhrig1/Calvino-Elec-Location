import { NextRequest, NextResponse } from 'next/server';
import { parseISO, isValid } from 'date-fns';
import { checkEquipmentAvailability, getEquipmentMonthAvailability, isWeekendDay } from '@/backend/availability/availabilityService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get('equipmentId');

    if (!equipmentId) {
      return NextResponse.json(
        { error: 'Le paramètre equipmentId est requis.' },
        { status: 400 }
      );
    }

    // 1. Demande de calendrier mensuel complet (pour affichage vert / rouge / week-end)
    const monthParam = searchParams.get('month'); // e.g. "2026-10" ou "10"
    const yearParam = searchParams.get('year');   // e.g. "2026"

    if (monthParam) {
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;

      if (monthParam.includes('-')) {
        const [y, m] = monthParam.split('-').map(Number);
        if (y && m) {
          year = y;
          month = m;
        }
      } else {
        month = parseInt(monthParam, 10);
        if (yearParam) year = parseInt(yearParam, 10);
      }

      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return NextResponse.json(
          { error: 'Paramètre mois ou année invalide.' },
          { status: 400 }
        );
      }

      const monthAvailability = await getEquipmentMonthAvailability(equipmentId, year, month);
      return NextResponse.json(monthAvailability);
    }

    // 2. Vérification sur une plage précise [startDate, endDate]
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'Paramètres manquants : startDate et endDate ou month.' },
        { status: 400 }
      );
    }

    const startDate = parseISO(startDateStr);
    const endDate = parseISO(endDateStr);

    if (!isValid(startDate) || !isValid(endDate) || startDate > endDate) {
      return NextResponse.json(
        { error: 'Dates invalides fournies.' },
        { status: 400 }
      );
    }

    const startIsWeekend = isWeekendDay(startDate);
    const endIsWeekend = isWeekendDay(endDate);

    const availability = await checkEquipmentAvailability(equipmentId, startDate, endDate);

    return NextResponse.json({
      ...availability,
      startIsWeekend,
      endIsWeekend,
      canPickupOrReturn: !startIsWeekend && !endIsWeekend && availability.isAvailable,
      weekendWarning: startIsWeekend || endIsWeekend
        ? 'Pas de retrait ou retour possible les samedis et dimanches. L’agence est fermée le week-end.'
        : null,
    });
  } catch (err: any) {
    console.error('Erreur API availability:', err);
    return NextResponse.json(
      { error: 'Erreur lors du calcul de disponibilité.' },
      { status: 500 }
    );
  }
}

