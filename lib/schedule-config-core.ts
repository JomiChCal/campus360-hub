import bundledConfig from '@/data/schedule-config.json';

export type ScheduleMode = 'dual' | 'continuo';
export type BusinessHoursState = 'open' | 'lunch' | 'after-hours';

export interface HorarioRow {
  horaAperturaM: string;
  horaCierreM: string | null;
  horarioAperturaT: string | null;
  horarioCierreT: string;
  modo: ScheduleMode;
  recibirRespuestas: boolean;
}

export interface ScheduleStore {
  horarios: Record<string, HorarioRow>;
  updatedAt: string;
}

export interface ResolvedSchedule {
  hasActiveSchedule: boolean;
  titulo?: string;
  horario?: HorarioRow;
  modo?: ScheduleMode;
}

const TITULO_NORMAL = 'Horario Normal';
const TITULO_EXTENDIDO = 'Horario Extendido';

export const DEFAULT_SCHEDULE_STORE: ScheduleStore = bundledConfig as ScheduleStore;

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
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || String(value).trim() === '';
}

function detectMode(horaCierreM: string | null, horarioAperturaT: string | null): ScheduleMode {
  if (isEmpty(horaCierreM) && isEmpty(horarioAperturaT)) return 'continuo';
  return 'dual';
}

function getBodyField(body: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const value = body[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return undefined;
}

function parseRecibirRespuestas(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;

  const normalized = String(value).trim().toLowerCase();
  if (['true', 'sí', 'si', 'yes', '1'].includes(normalized)) return true;
  if (['false', 'no', '0'].includes(normalized)) return false;

  return fallback;
}

function resolveTimeField(
  body: Record<string, unknown>,
  keys: string[],
  existing: string | null | undefined
): string | null {
  const raw = getBodyField(body, keys);
  if (raw === undefined) {
    return existing ?? null;
  }
  if (isEmpty(raw)) return null;
  return normalizeTime(String(raw));
}

export function normalizeSharePointPayload(
  body: Record<string, unknown>,
  existing?: HorarioRow
): {
  titulo: string;
  row: HorarioRow;
} {
  const titulo = String(
    getBodyField(body, ['Titulo', 'Title', 'titulo', 'title']) ?? ''
  ).trim();

  if (!titulo) {
    throw new Error(
      'Titulo es obligatorio. En Power Automate usa contenido dinámico del trigger: Titulo o Title (no dejes el campo vacío).'
    );
  }

  const horaAperturaM =
    resolveTimeField(body, ['HoraAperturaM', 'HoraAperturaManana'], existing?.horaAperturaM) ??
    null;
  const horarioCierreT =
    resolveTimeField(body, ['HorarioCierreT', 'HoraCierreT'], existing?.horarioCierreT) ?? null;
  const horaCierreM = resolveTimeField(
    body,
    ['HoraCierreM', 'HoraCierreManana'],
    existing?.horaCierreM
  );
  const horarioAperturaT = resolveTimeField(
    body,
    ['HorarioAperturaT', 'HoraAperturaTarde'],
    existing?.horarioAperturaT
  );

  if (!horaAperturaM || !horarioCierreT) {
    throw new Error(
      'HoraAperturaM y HorarioCierreT son obligatorios (o deben existir ya en la fila guardada).'
    );
  }

  const recibirRespuestas = parseRecibirRespuestas(
    getBodyField(body, ['RecibirRespuestas', 'recibirRespuestas']),
    existing?.recibirRespuestas ?? false
  );

  const modo = detectMode(horaCierreM, horarioAperturaT);

  if (modo === 'dual' && (!horaCierreM || !horarioAperturaT)) {
    throw new Error('Horario dual requiere HoraCierreM y HorarioAperturaT');
  }

  return {
    titulo,
    row: {
      horaAperturaM,
      horaCierreM,
      horarioAperturaT,
      horarioCierreT,
      modo,
      recibirRespuestas,
    },
  };
}

export function resolveActiveSchedule(store: ScheduleStore): ResolvedSchedule {
  const normal = store.horarios[TITULO_NORMAL];
  const extendido = store.horarios[TITULO_EXTENDIDO];

  const normalOn = normal?.recibirRespuestas === true;
  const extendidoOn = extendido?.recibirRespuestas === true;

  if (!normalOn && !extendidoOn) {
    return { hasActiveSchedule: false };
  }

  if (normalOn && extendidoOn && normal) {
    return {
      hasActiveSchedule: true,
      titulo: TITULO_NORMAL,
      horario: normal,
      modo: normal.modo,
    };
  }

  if (normalOn && normal) {
    return {
      hasActiveSchedule: true,
      titulo: TITULO_NORMAL,
      horario: normal,
      modo: normal.modo,
    };
  }

  if (extendidoOn && extendido) {
    return {
      hasActiveSchedule: true,
      titulo: TITULO_EXTENDIDO,
      horario: extendido,
      modo: extendido.modo,
    };
  }

  return { hasActiveSchedule: false };
}

/** Sin horario activo (ambos recibirRespuestas en false) → cerrado para turnos. */
export function getBusinessHoursStateFromResolved(
  resolved: ResolvedSchedule,
  minutes: number,
  isWeekday: boolean
): BusinessHoursState {
  if (!resolved.hasActiveSchedule || !resolved.horario) {
    return 'after-hours';
  }
  return evaluateBusinessHours(resolved.horario, minutes, isWeekday);
}

export function canAcceptTurnosFromResolved(
  resolved: ResolvedSchedule,
  minutes: number,
  isWeekday: boolean
): boolean {
  return getBusinessHoursStateFromResolved(resolved, minutes, isWeekday) === 'open';
}

export function evaluateBusinessHours(
  horario: HorarioRow,
  minutes: number,
  isWeekday: boolean
): BusinessHoursState {
  if (!isWeekday) return 'after-hours';

  const morningStart = parseTimeToMinutes(horario.horaAperturaM);
  const morningEnd = parseTimeToMinutes(horario.horaCierreM);
  const afternoonStart = parseTimeToMinutes(horario.horarioAperturaT);
  const afternoonEnd = parseTimeToMinutes(horario.horarioCierreT);

  if (morningStart === null || afternoonEnd === null) return 'after-hours';

  if (horario.modo === 'continuo') {
    return minutes >= morningStart && minutes < afternoonEnd ? 'open' : 'after-hours';
  }

  if (morningEnd === null || afternoonStart === null) return 'after-hours';

  if (
    (minutes >= morningStart && minutes < morningEnd) ||
    (minutes >= afternoonStart && minutes < afternoonEnd)
  ) {
    return 'open';
  }

  if (minutes >= morningEnd && minutes < afternoonStart) return 'lunch';

  return 'after-hours';
}

export function buildContactTimeOptions(
  horario: HorarioRow
): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
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
