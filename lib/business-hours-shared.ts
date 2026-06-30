import {
  buildContactTimeOptions,
  buildScheduleSummaryMessage,
  canAcceptTurnosFromState,
  getBusinessHoursStateFromResolved,
  getEcuadorClock,
  getLunchResumeTime,
  getMockState,
  isWizardAllowedState,
  resolveActiveSchedule,
} from '@/lib/schedule-core';
import { getClientScheduleStore } from '@/lib/schedule-client-store';
import type { BusinessHoursState, ContactTimeOption } from '@/types/schedule';

export type { BusinessHoursState };

function getScheduleStateFromStore() {
  const clock = getEcuadorClock();
  const store = getClientScheduleStore();
  const resolved = resolveActiveSchedule(store, clock);
  const state = getBusinessHoursStateFromResolved(resolved, clock);
  return { clock, store, resolved, state };
}

export function getBusinessHoursState(): BusinessHoursState {
  const mock = getMockState();
  if (mock) return mock;
  return getScheduleStateFromStore().state;
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
  return buildScheduleSummaryMessage(getClientScheduleStore());
}

export function getContactTimeOptions(): ContactTimeOption[] {
  const { resolved } = getScheduleStateFromStore();
  if (!resolved.horario) return [];
  return buildContactTimeOptions(resolved.horario);
}

export function getLunchResumeLabel(): string | null {
  const { resolved } = getScheduleStateFromStore();
  if (!resolved.horario) return null;
  return getLunchResumeTime(resolved.horario);
}

/** @deprecated Use getContactTimeOptions() */
export const CONTACT_TIME_OPTIONS: ContactTimeOption[] = [];
