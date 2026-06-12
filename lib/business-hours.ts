import bundledConfig from '@/data/schedule-config.json';

import {
  buildBusinessHoursMessage,
  buildContactTimeOptions,
  getBusinessHoursStateFromResolved,
  resolveActiveSchedule,
  type BusinessHoursState,
  type HorarioRow,
  type ScheduleStore,
} from '@/lib/schedule-config-core';

export type { BusinessHoursState };

let clientStore: ScheduleStore = bundledConfig as ScheduleStore;

export function getEcuadorDate(): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const get = (type: string) =>
    Number.parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);

  return new Date(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  );
}

function getMinutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function getStore(): ScheduleStore {
  return clientStore;
}

export function setClientScheduleStore(store: ScheduleStore): void {
  clientStore = store;
}

function resolveStateFromStore(store: ScheduleStore, now: Date): BusinessHoursState {
  const active = resolveActiveSchedule(store);
  return getBusinessHoursStateFromResolved(
    active,
    getMinutesSinceMidnight(now),
    isWeekday(now)
  );
}

export function getBusinessHoursStateFromStore(store: ScheduleStore): BusinessHoursState {
  const mockMode = process.env.NEXT_PUBLIC_MOCK_BUSINESS_HOURS;
  if (mockMode === 'open' || mockMode === 'lunch' || mockMode === 'after-hours') {
    return mockMode;
  }

  return resolveStateFromStore(store, getEcuadorDate());
}

export function getBusinessHoursState(): BusinessHoursState {
  return getBusinessHoursStateFromStore(getStore());
}

export function canAcceptNewTurnos(): boolean {
  return getBusinessHoursState() === 'open';
}

function getActiveHorario(store: ScheduleStore): HorarioRow | null {
  const active = resolveActiveSchedule(store);
  return active.horario ?? null;
}

export function getBusinessHoursMessage(): string {
  const horario = getActiveHorario(getStore());
  if (!horario) return 'Lunes a Viernes: 08:00 - 13:00 y 15:00 - 18:00';
  return buildBusinessHoursMessage(horario);
}

export function getContactTimeOptions(): Array<{ value: string; label: string }> {
  const horario = getActiveHorario(getStore());
  if (!horario) return DEFAULT_CONTACT_TIME_OPTIONS;
  const options = buildContactTimeOptions(horario);
  return options.length > 0 ? options : DEFAULT_CONTACT_TIME_OPTIONS;
}

const DEFAULT_CONTACT_TIME_OPTIONS = [
  { value: '08:00 - 09:00', label: '08:00 - 09:00' },
  { value: '09:00 - 10:00', label: '09:00 - 10:00' },
  { value: '10:00 - 11:00', label: '10:00 - 11:00' },
  { value: '11:00 - 12:00', label: '11:00 - 12:00' },
  { value: '12:00 - 13:00', label: '12:00 - 13:00' },
  { value: '15:00 - 16:00', label: '15:00 - 16:00' },
  { value: '16:00 - 17:00', label: '16:00 - 17:00' },
  { value: '17:00 - 18:00', label: '17:00 - 18:00' },
];

export const CONTACT_TIME_OPTIONS = DEFAULT_CONTACT_TIME_OPTIONS;
