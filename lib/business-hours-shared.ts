import {
  buildBusinessHoursMessage,
  buildContactTimeOptions,
  canAcceptTurnosFromState,
  getBusinessHoursStateFromResolved,
  getEcuadorClock,
  getLunchResumeTime,
  isWizardAllowedState,
  resolveActiveSchedule,
} from '@/lib/schedule-core';
import { getClientScheduleStore } from '@/lib/schedule-client-store';
import type { BusinessHoursState, ContactTimeOption } from '@/types/schedule';

export type { BusinessHoursState };

function getMockState(): BusinessHoursState | null {
  const mockMode = process.env.NEXT_PUBLIC_MOCK_BUSINESS_HOURS;
  if (mockMode === 'open' || mockMode === 'lunch' || mockMode === 'after-hours') {
    return mockMode;
  }
  if (mockMode === 'closing-soon') {
    return 'closing-soon';
  }
  return null;
}

export function getBusinessHoursState(): BusinessHoursState {
  const mock = getMockState();
  if (mock) return mock;

  const store = getClientScheduleStore();
  const resolved = resolveActiveSchedule(store);
  return getBusinessHoursStateFromResolved(resolved, getEcuadorClock());
}

export function canAcceptNewTurnos(): boolean {
  const mock = getMockState();
  if (mock) return mock === 'open';
  return canAcceptTurnosFromState(getBusinessHoursState());
}

export function isWizardRouteAllowed(): boolean {
  const mock = getMockState();
  if (mock === 'open' || mock === 'closing-soon') return true;
  if (mock) return false;
  return isWizardAllowedState(getBusinessHoursState());
}

export function getBusinessHoursMessage(): string {
  const store = getClientScheduleStore();
  const resolved = resolveActiveSchedule(store);
  if (!resolved.horario) return 'Horario de atención no disponible';
  return buildBusinessHoursMessage(resolved.horario);
}

export function getContactTimeOptions(): ContactTimeOption[] {
  const store = getClientScheduleStore();
  const resolved = resolveActiveSchedule(store);
  if (!resolved.horario) return [];
  return buildContactTimeOptions(resolved.horario);
}

export function getLunchResumeLabel(): string | null {
  const store = getClientScheduleStore();
  const resolved = resolveActiveSchedule(store);
  if (!resolved.horario) return null;
  return getLunchResumeTime(resolved.horario);
}

/** @deprecated Use getContactTimeOptions() */
export const CONTACT_TIME_OPTIONS: ContactTimeOption[] = [];
