import {
  createDefaultScheduleStore,
  createEmptyScheduleStore,
  getBusinessHoursStateFromResolved,
  getEcuadorClock,
  getMockState,
  resolveActiveSchedule,
  buildBusinessHoursMessage,
  buildContactTimeOptions,
  canAcceptTurnosFromState,
  getLunchResumeTime,
} from '@/lib/schedule-core';
import { mapSharePointSchedulePayload } from '@/lib/server/schedule-mapper';
import { writeScheduleToKv } from '@/lib/server/schedule-kv';
import type { BusinessHoursState, HorarioRow, ResolvedSchedule, ScheduleStore } from '@/types/schedule';

export async function getScheduleStore(): Promise<ScheduleStore> {
  return createDefaultScheduleStore();
}

export async function getResolvedSchedule(): Promise<ResolvedSchedule> {
  const store = await getScheduleStore();
  return resolveActiveSchedule(store);
}

export async function getCurrentBusinessHoursState(): Promise<BusinessHoursState> {
  const resolved = await getResolvedSchedule();
  return getBusinessHoursStateFromResolved(resolved, getEcuadorClock());
}

export function refreshScheduleFromPayload(
  body: Record<string, unknown>,
  currentStore: ScheduleStore
): ScheduleStore {
  const tituloHint = String(
    body.Titulo ?? body.Title ?? body.titulo ?? body.title ?? ''
  ).trim();
  const normalizedHint = tituloHint.toLowerCase().includes('extendido')
    ? 'Horario Extendido'
    : tituloHint.toLowerCase().includes('normal')
      ? 'Horario Normal'
      : tituloHint;

  const existing = normalizedHint ? currentStore.horarios[normalizedHint] : undefined;
  const { titulo, row } = mapSharePointSchedulePayload(body, existing);

  return {
    horarios: {
      ...currentStore.horarios,
      [titulo]: row,
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function persistScheduleStore(store: ScheduleStore): Promise<void> {
  await writeScheduleToKv(store, 'refresh');
}

export async function upsertScheduleFromPayload(body: Record<string, unknown>): Promise<{
  store: ScheduleStore;
  resolved: ResolvedSchedule;
}> {
  const currentStore = await getScheduleStore();
  const store = refreshScheduleFromPayload(body, currentStore);
  await persistScheduleStore(store);
  return { store, resolved: resolveActiveSchedule(store) };
}

export function getSchedulePresentation(horario: HorarioRow | null) {
  if (!horario) {
    return {
      message: 'Horario de atención no disponible',
      contactTimeOptions: [] as ReturnType<typeof buildContactTimeOptions>,
      lunchResumeTime: null as string | null,
    };
  }

  return {
    message: buildBusinessHoursMessage(horario),
    contactTimeOptions: buildContactTimeOptions(horario),
    lunchResumeTime: getLunchResumeTime(horario),
  };
}

export async function getScheduleConfigSnapshot(): Promise<{
  store: ScheduleStore;
  resolved: ResolvedSchedule;
  state: BusinessHoursState;
}> {
  const mock = getMockState();
  if (mock) {
    const store = createDefaultScheduleStore();
    const resolved = resolveActiveSchedule(store);
    return { store, resolved, state: mock };
  }

  const store = await getScheduleStore();
  const resolved = resolveActiveSchedule(store);
  const state = getBusinessHoursStateFromResolved(resolved, getEcuadorClock());
  return { store, resolved, state };
}
