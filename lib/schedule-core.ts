import {
  CLOSING_BUFFER_MINUTES,
  TITULO_HORARIO_EXTENDIDO,
  TITULO_HORARIO_NORMAL,
  type BusinessHoursState,
  type ContactTimeOption,
  type HorarioRow,
  type ResolvedSchedule,
  type ScheduleStore,
} from '@/types/schedule';

export type EcuadorClock = {
  minutes: number;
  isWeekday: boolean;
};

export function createEmptyScheduleStore(): ScheduleStore {
  return { horarios: {}, updatedAt: new Date().toISOString() };
}

export function createDefaultScheduleStore(): ScheduleStore {
  return {
    horarios: {
      [TITULO_HORARIO_NORMAL]: {
        horaAperturaM: '08:00',
        horaCierreM: '13:00',
        horarioAperturaT: '15:00',
        horarioCierreT: '18:00',
        modo: 'dual',
        habilitado: true,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}

export function parseTimeToMinutes(value: string | null | undefined): number | null {
  if (!value || String(value).trim() === '') return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
  if (!match) return null;
  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function normalizeTime(value: string | null | undefined): string | null {
  const totalMinutes = parseTimeToMinutes(value);
  if (totalMinutes === null) return null;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function getEcuadorClock(date: Date = new Date()): EcuadorClock {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '0';
  const hours = Number.parseInt(get('hour'), 10);
  const minutes = Number.parseInt(get('minute'), 10);
  const weekday = get('weekday');

  return {
    minutes: hours * 60 + minutes,
    isWeekday: !['Sat', 'Sun'].includes(weekday),
  };
}

export function resolveActiveSchedule(store: ScheduleStore): ResolvedSchedule {
  const normal = store.horarios[TITULO_HORARIO_NORMAL];
  const extendido = store.horarios[TITULO_HORARIO_EXTENDIDO];

  const normalOn = normal?.habilitado === true;
  const extendidoOn = extendido?.habilitado === true;

  if (!normalOn && !extendidoOn) {
    return { hasActiveSchedule: false };
  }

  if (normalOn && normal) {
    return {
      hasActiveSchedule: true,
      titulo: TITULO_HORARIO_NORMAL,
      horario: normal,
      modo: normal.modo,
    };
  }

  if (extendidoOn && extendido) {
    return {
      hasActiveSchedule: true,
      titulo: TITULO_HORARIO_EXTENDIDO,
      horario: extendido,
      modo: extendido.modo,
    };
  }

  return { hasActiveSchedule: false };
}

function evaluateContinuo(horario: HorarioRow, clock: EcuadorClock): BusinessHoursState {
  const start = parseTimeToMinutes(horario.horaAperturaM);
  const closeExact = parseTimeToMinutes(horario.horarioCierreT);
  if (start === null || closeExact === null) return 'after-hours';

  const closeEffective = closeExact - CLOSING_BUFFER_MINUTES;
  const { minutes } = clock;

  if (minutes < start) return 'after-hours';
  if (minutes < closeEffective) return 'open';
  if (minutes < closeExact) return 'closing-soon';
  return 'after-hours';
}

function evaluateDual(horario: HorarioRow, clock: EcuadorClock): BusinessHoursState {
  const morningStart = parseTimeToMinutes(horario.horaAperturaM);
  const morningCloseExact = parseTimeToMinutes(horario.horaCierreM);
  const afternoonStart = parseTimeToMinutes(horario.horarioAperturaT);
  const afternoonCloseExact = parseTimeToMinutes(horario.horarioCierreT);

  if (
    morningStart === null ||
    morningCloseExact === null ||
    afternoonStart === null ||
    afternoonCloseExact === null
  ) {
    return 'after-hours';
  }

  const morningCloseEffective = morningCloseExact - CLOSING_BUFFER_MINUTES;
  const afternoonCloseEffective = afternoonCloseExact - CLOSING_BUFFER_MINUTES;
  const { minutes } = clock;

  if (minutes < morningStart) return 'after-hours';

  if (minutes < morningCloseEffective) return 'open';
  if (minutes < morningCloseExact) return 'closing-soon';

  if (minutes < afternoonStart) return 'lunch';

  if (minutes < afternoonCloseEffective) return 'open';
  if (minutes < afternoonCloseExact) return 'closing-soon';

  return 'after-hours';
}

export function evaluateBusinessHours(horario: HorarioRow, clock: EcuadorClock): BusinessHoursState {
  if (!clock.isWeekday) return 'after-hours';
  if (horario.modo === 'continuo') return evaluateContinuo(horario, clock);
  return evaluateDual(horario, clock);
}

export function getBusinessHoursStateFromResolved(
  resolved: ResolvedSchedule,
  clock: EcuadorClock = getEcuadorClock()
): BusinessHoursState {
  if (!resolved.hasActiveSchedule || !resolved.horario) {
    return 'after-hours';
  }
  return evaluateBusinessHours(resolved.horario, clock);
}

export function canAcceptTurnosFromState(state: BusinessHoursState): boolean {
  return state === 'open';
}

export function isWizardAllowedState(state: BusinessHoursState): boolean {
  return state === 'open' || state === 'closing-soon';
}

export function buildContactTimeOptions(horario: HorarioRow): ContactTimeOption[] {
  const options: ContactTimeOption[] = [];
  const ranges: Array<[number, number]> = [];

  const morningStart = parseTimeToMinutes(horario.horaAperturaM);
  const morningEnd = parseTimeToMinutes(horario.horaCierreM);
  const afternoonStart = parseTimeToMinutes(horario.horarioAperturaT);
  const afternoonEnd = parseTimeToMinutes(horario.horarioCierreT);

  if (horario.modo === 'continuo' && morningStart !== null && afternoonEnd !== null) {
    ranges.push([morningStart, afternoonEnd]);
  } else if (
    morningStart !== null &&
    morningEnd !== null &&
    afternoonStart !== null &&
    afternoonEnd !== null
  ) {
    ranges.push([morningStart, morningEnd], [afternoonStart, afternoonEnd]);
  }

  for (const [start, end] of ranges) {
    for (let minute = start; minute < end; minute += 60) {
      const nextMinute = Math.min(minute + 60, end);
      const startLabel = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
      const endLabel = `${String(Math.floor(nextMinute / 60)).padStart(2, '0')}:${String(nextMinute % 60).padStart(2, '0')}`;
      const value = `${startLabel} - ${endLabel}`;
      options.push({ value, label: value });
    }
  }

  return options;
}

export function buildBusinessHoursMessage(horario: HorarioRow): string {
  if (horario.modo === 'continuo') {
    return `Lunes a Viernes: ${horario.horaAperturaM} - ${horario.horarioCierreT}`;
  }
  return `Lunes a Viernes: ${horario.horaAperturaM} - ${horario.horaCierreM} y ${horario.horarioAperturaT} - ${horario.horarioCierreT}`;
}

export function getLunchResumeTime(horario: HorarioRow): string | null {
  if (horario.modo !== 'dual') return null;
  return horario.horarioAperturaT;
}
