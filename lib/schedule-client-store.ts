import { createEmptyScheduleStore } from '@/lib/schedule-core';
import type { ScheduleStore } from '@/types/schedule';

let clientStore: ScheduleStore = createEmptyScheduleStore();

export function getClientScheduleStore(): ScheduleStore {
  return clientStore;
}

export function setClientScheduleStore(store: ScheduleStore): void {
  clientStore = store;
}
