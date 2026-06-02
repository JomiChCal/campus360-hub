import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const COUNTER_FILE = resolve(process.cwd(), 'data', 'turnos-counter.json');

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function readCounter(): Record<string, number> {
  if (!existsSync(COUNTER_FILE)) {
    return {};
  }
  try {
    const content = readFileSync(COUNTER_FILE, 'utf-8');
    return JSON.parse(content) as Record<string, number>;
  } catch {
    return {};
  }
}

function writeCounter(data: Record<string, number>): void {
  writeFileSync(COUNTER_FILE, JSON.stringify(data, null, 2));
}

export function getNextTurno(): string {
  const counters = readCounter();
  const today = getTodayKey();
  const current = counters[today] ?? 0;
  const next = current + 1;
  counters[today] = next;
  writeCounter(counters);
  return String(next).padStart(3, '0');
}

export function getCurrentCount(): number {
  const counters = readCounter();
  const today = getTodayKey();
  return counters[today] ?? 0;
}
