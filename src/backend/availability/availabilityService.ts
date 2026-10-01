import prisma from '@/backend/db/prisma';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  startOfDay, 
  endOfDay, 
  eachDayOfInterval 
} from 'date-fns';

export interface AvailabilityResult {
  equipmentId: string;
  startDate: Date;
  endDate: Date;
  totalActiveUnits: number;
  availableUnitsCount: number;
  isAvailable: boolean;
  pendingRequestsCount: number;
  availableUnits: Array<{
    id: string;
    internalCode: string;
    status: string;
    serialNumber: string | null;
  }>;
}

/**
 * Moteur de disponibilité temps réel basé sur le parc d'unités physiques.
 * Deux réservations se chevauchent si : (Res.start <= Query.end) ET (Res.end >= Query.start)
 */
export async function checkEquipmentAvailability(
  equipmentId: string,
  startDate: Date,
  endDate: Date
): Promise<AvailabilityResult> {
  const allUnits = await prisma.equipmentUnit.findMany({
    where: {
      equipmentId,
      status: {
        not: 'OUT_OF_SERVICE',
      },
    },
    select: {
      id: true,
      internalCode: true,
      status: true,
      serialNumber: true,
    },
  });

  const totalActiveUnits = allUnits.length;
  if (totalActiveUnits === 0) {
    return {
      equipmentId,
      startDate,
      endDate,
      totalActiveUnits: 0,
      availableUnitsCount: 0,
      isAvailable: false,
      pendingRequestsCount: 0,
      availableUnits: [],
    };
  }

  // 1. Récupérer les réservations CONFIRMÉES ou EN COURS qui chevauchent l'intervalle
  const overlappingConfirmedReservations = await prisma.reservation.findMany({
    where: {
      equipmentId,
      status: {
        in: ['CONFIRMED', 'IN_PROGRESS'],
      },
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
    select: {
      id: true,
      unitId: true,
    },
  });

  // 2. Compter les demandes EN ATTENTE sur la même période pour information
  const pendingRequestsCount = await prisma.reservation.count({
    where: {
      equipmentId,
      status: 'PENDING',
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
  });

  // Identifier les IDs d'unités déjà réservées/occupées
  const occupiedUnitIds = new Set(
    overlappingConfirmedReservations
      .map((r) => r.unitId)
      .filter((id): id is string => id !== null)
  );

  // Filtrer les unités éligibles (non occupées et pas en maintenance actuellement)
  const availableUnits = allUnits.filter((unit) => {
    if (unit.status === 'MAINTENANCE') return false;
    if (occupiedUnitIds.has(unit.id)) return false;
    return true;
  });

  const unassignedConfirmedCount = overlappingConfirmedReservations.filter((r) => !r.unitId).length;
  const availableCount = Math.max(0, availableUnits.length - unassignedConfirmedCount);

  return {
    equipmentId,
    startDate,
    endDate,
    totalActiveUnits,
    availableUnitsCount: availableCount,
    isAvailable: availableCount > 0,
    pendingRequestsCount,
    availableUnits,
  };
}

/**
 * Vérifie dans une transaction qu'une unité spécifique n'est pas déjà réservée
 */
export async function validateUnitAvailabilityForDates(
  unitId: string,
  startDate: Date,
  endDate: Date,
  excludeReservationId?: string,
  tx: any = prisma
): Promise<boolean> {
  const conflicting = await tx.reservation.findFirst({
    where: {
      unitId,
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      status: {
        in: ['CONFIRMED', 'IN_PROGRESS'],
      },
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
  });

  return !conflicting;
}

export interface DayAvailabilityInfo {
  date: string; // "YYYY-MM-DD"
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  isWeekend: boolean;
  totalActiveUnits: number;
  availableUnitsCount: number;
  isAvailable: boolean; // availableUnitsCount > 0
  isRentedOut: boolean; // availableUnitsCount === 0
  canPickupOrReturn: boolean; // !isWeekend && isAvailable
  pendingCount: number;
}

export interface MonthAvailabilityResult {
  equipmentId: string;
  year: number;
  month: number;
  totalActiveUnits: number;
  days: Record<string, DayAvailabilityInfo>;
}

export function isWeekendDay(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(`${date}T12:00:00Z`) : date;
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function getNextWorkingDay(date: Date): Date {
  const next = new Date(date);
  const day = next.getDay();
  if (day === 6) {
    next.setDate(next.getDate() + 2); // Samedi -> Lundi
  } else if (day === 0) {
    next.setDate(next.getDate() + 1); // Dimanche -> Lundi
  }
  return next;
}

export async function getEquipmentMonthAvailability(
  equipmentId: string,
  year: number,
  month: number // 1-indexed (1 = Janvier, 10 = Octobre)
): Promise<MonthAvailabilityResult> {
  const monthDate = new Date(year, month - 1, 1);
  const gridStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });

  const allUnits = await prisma.equipmentUnit.findMany({
    where: {
      equipmentId,
      status: { not: 'OUT_OF_SERVICE' },
    },
    select: {
      id: true,
      status: true,
    },
  });

  const totalActiveUnits = allUnits.length;
  const maintenanceUnitIds = new Set(
    allUnits.filter((u) => u.status === 'MAINTENANCE').map((u) => u.id)
  );

  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      equipmentId,
      status: { in: ['CONFIRMED', 'IN_PROGRESS', 'PENDING'] },
      startDate: { lte: endOfDay(gridEnd) },
      endDate: { gte: startOfDay(gridStart) },
    },
    select: {
      id: true,
      unitId: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });

  const days: Record<string, DayAvailabilityInfo> = {};
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  for (const day of allDays) {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const dayOfWeek = day.getDay();
    const isWeekendDayVal = dayOfWeek === 0 || dayOfWeek === 6;

    if (totalActiveUnits === 0) {
      days[dayStr] = {
        date: dayStr,
        dayOfWeek,
        isWeekend: isWeekendDayVal,
        totalActiveUnits: 0,
        availableUnitsCount: 0,
        isAvailable: false,
        isRentedOut: true,
        canPickupOrReturn: false,
        pendingCount: 0,
      };
      continue;
    }

    const dayReservations = overlappingReservations.filter(
      (r) => r.startDate <= dayEnd && r.endDate >= dayStart
    );

    const pendingCount = dayReservations.filter((r) => r.status === 'PENDING').length;

    const occupiedUnitIds = new Set<string>();
    let unassignedResCount = 0;

    for (const r of dayReservations) {
      if (r.unitId) {
        occupiedUnitIds.add(r.unitId);
      } else {
        unassignedResCount++;
      }
    }

    const freeUnits = allUnits.filter(
      (u) => !maintenanceUnitIds.has(u.id) && !occupiedUnitIds.has(u.id)
    );

    const availableCount = Math.max(0, freeUnits.length - unassignedResCount);
    const isAvailable = availableCount > 0;
    const isRentedOut = availableCount === 0;
    const canPickupOrReturn = !isWeekendDayVal && isAvailable;

    days[dayStr] = {
      date: dayStr,
      dayOfWeek,
      isWeekend: isWeekendDayVal,
      totalActiveUnits,
      availableUnitsCount: availableCount,
      isAvailable,
      isRentedOut,
      canPickupOrReturn,
      pendingCount,
    };
  }

  return {
    equipmentId,
    year,
    month,
    totalActiveUnits,
    days,
  };
}
