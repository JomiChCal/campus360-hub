import { readFileSync, statSync } from 'node:fs';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  DEFAULT_SCHEDULE_STORE,
  type HorarioRow,
  type ScheduleStore,
} from '@/lib/schedule-config-core';
import {
  isScheduleKvEnabled,
  readScheduleFromKv,
  writeScheduleToKv,
} from '@/lib/schedule-kv';

const CONFIG_PATH = join(process.cwd(), 'data', 'schedule-config.json');

let memoryCache: ScheduleStore | null = null;
let cachedMtimeMs: number | null = null;
let cachedUpdatedAt: string | null = null;

function getSyncMtimeMs(): number | null {
  try {
    return statSync(CONFIG_PATH).mtimeMs;
  } catch {
    return null;
  }
}

async function getMtimeMs(): Promise<number | null> {
  try {
    return (await stat(CONFIG_PATH)).mtimeMs;
  } catch {
    return null;
  }
}

function filesystemCacheIsFresh(mtimeMs: number | null): boolean {
  return memoryCache !== null && cachedMtimeMs === mtimeMs;
}

function kvCacheIsFresh(store: ScheduleStore): boolean {
  return memoryCache !== null && cachedUpdatedAt === store.updatedAt;
}

export function invalidateScheduleCache(): void {
  memoryCache = null;
  cachedMtimeMs = null;
  cachedUpdatedAt = null;
}

async function readScheduleFromFilesystem(): Promise<ScheduleStore> {
  const mtimeMs = await getMtimeMs();
  if (filesystemCacheIsFresh(mtimeMs)) return memoryCache!;

  try {
    const raw = await readFile(CONFIG_PATH, 'utf-8');
    memoryCache = JSON.parse(raw) as ScheduleStore;
    cachedMtimeMs = mtimeMs;
    cachedUpdatedAt = memoryCache.updatedAt;
    return memoryCache;
  } catch {
    memoryCache = DEFAULT_SCHEDULE_STORE;
    cachedMtimeMs = null;
    cachedUpdatedAt = memoryCache.updatedAt;
    return memoryCache;
  }
}

async function readScheduleFromKvWithSeed(): Promise<ScheduleStore> {
  const fromKv = await readScheduleFromKv();
  if (fromKv) {
    if (kvCacheIsFresh(fromKv)) return memoryCache!;
    memoryCache = fromKv;
    cachedUpdatedAt = fromKv.updatedAt;
    cachedMtimeMs = null;
    return fromKv;
  }

  let seeded: ScheduleStore = DEFAULT_SCHEDULE_STORE;
  try {
    const raw = await readFile(CONFIG_PATH, 'utf-8');
    seeded = JSON.parse(raw) as ScheduleStore;
  } catch {
    seeded = { ...DEFAULT_SCHEDULE_STORE, updatedAt: new Date().toISOString() };
  }
  await writeScheduleToKv(seeded);
  memoryCache = seeded;
  cachedUpdatedAt = seeded.updatedAt;
  return seeded;
}

export async function readScheduleStore(): Promise<ScheduleStore> {
  if (isScheduleKvEnabled()) {
    return readScheduleFromKvWithSeed();
  }
  return readScheduleFromFilesystem();
}

export function readScheduleStoreSync(): ScheduleStore {
  if (isScheduleKvEnabled()) {
    return memoryCache ?? DEFAULT_SCHEDULE_STORE;
  }

  const mtimeMs = getSyncMtimeMs();
  if (filesystemCacheIsFresh(mtimeMs)) return memoryCache!;

  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    memoryCache = JSON.parse(raw) as ScheduleStore;
    cachedMtimeMs = mtimeMs;
    cachedUpdatedAt = memoryCache.updatedAt;
    return memoryCache;
  } catch {
    return DEFAULT_SCHEDULE_STORE;
  }
}

export async function writeScheduleStore(store: ScheduleStore): Promise<void> {
  memoryCache = store;
  cachedUpdatedAt = store.updatedAt;

  if (isScheduleKvEnabled()) {
    await writeScheduleToKv(store);
    return;
  }

  await writeFile(CONFIG_PATH, JSON.stringify(store, null, 2), 'utf-8');
  cachedMtimeMs = await getMtimeMs();
}

export async function upsertHorarioRow(titulo: string, row: HorarioRow): Promise<ScheduleStore> {
  invalidateScheduleCache();
  const store = await readScheduleStore();
  const next: ScheduleStore = {
    horarios: { ...store.horarios, [titulo]: row },
    updatedAt: new Date().toISOString(),
  };
  await writeScheduleStore(next);
  return next;
}
