import {
  createDefaultScheduleStore,
  createEmptyScheduleStore,
  getBusinessHoursStateFromResolved,
  getEcuadorClock,
  getMockState,
  resolveActiveSchedule,
  buildScheduleSummaryMessage,
  buildContactTimeOptions,
  getLunchResumeTime,
  type EcuadorClock,
} from '@/lib/schedule-core';
import { mapSharePointSchedulePayload } from '@/lib/server/schedule-mapper';
import { readScheduleFromKv, writeScheduleToKv } from '@/lib/server/schedule-kv';
import {
  TITULO_HORARIO_EXTENDIDO,
  TITULO_HORARIO_EXTENDIDO_FIN_SEMANA,
  TITULO_HORARIO_NORMAL,
} from '@/types/schedule';
import type { BusinessHoursState, HorarioRow, ResolvedSchedule, ScheduleStore } from '@/types/schedule';

export async function getScheduleStore(): Promise<ScheduleStore> {
  const cached = await readScheduleFromKv();
  return cached ?? createEmptyScheduleStore();
}

export async function getResolvedSchedule(clock: EcuadorClock = getEcuadorClock()): Promise<ResolvedSchedule> {
  const store = await getScheduleStore();
  return resolveActiveSchedule(store, clock);
}

export async function getCurrentBusinessHoursState(): Promise<BusinessHoursState> {
  const clock = getEcuadorClock();
  const resolved = await getResolvedSchedule(clock);
  return getBusinessHoursStateFromResolved(resolved, clock);
}

function normalizeTituloHint(tituloHint: string): string {
  const lower = tituloHint.toLowerCase();
  if (lower.includes('fin de semana')) return TITULO_HORARIO_EXTENDIDO_FIN_SEMANA;
  if (lower.includes('extendido')) return TITULO_HORARIO_EXTENDIDO;
  if (lower.includes('normal')) return TITULO_HORARIO_NORMAL;
  return tituloHint;
}

export function refreshScheduleFromPayload(
  body: Record<string, unknown>,
  currentStore: ScheduleStore
): ScheduleStore {
  const tituloHint = String(
    body.Titulo ?? body.Title ?? body.titulo ?? body.title ?? ''
  ).trim();
  const normalizedHint = tituloHint ? normalizeTituloHint(tituloHint) : '';
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
  const clock = getEcuadorClock();
  return { store, resolved: resolveActiveSchedule(store, clock) };
}

export function getSchedulePresentation(store: ScheduleStore, horario: HorarioRow | null) {
  if (!horario) {
    return {
      message: buildScheduleSummaryMessage(store),
      contactTimeOptions: [] as ReturnType<typeof buildContactTimeOptions>,
      lunchResumeTime: null as string | null,
    };
  }

  return {
    message: buildScheduleSummaryMessage(store),
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
    const clock = getEcuadorClock();
    const resolved = resolveActiveSchedule(store, clock);
    return { store, resolved, state: mock };
  }

  const clock = getEcuadorClock();
  const store = await getScheduleStore();
  const resolved = resolveActiveSchedule(store, clock);
  const state = getBusinessHoursStateFromResolved(resolved, clock);
  return { store, resolved, state };
}
