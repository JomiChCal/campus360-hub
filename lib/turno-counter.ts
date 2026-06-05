const counters = new Map<string, number>();

export function getNextTurnoNumber(todayDate: string): string {
  const current = counters.get(todayDate) ?? 0;
  const next = current + 1;
  counters.set(todayDate, next);
  return String(next).padStart(3, '0');
}

export function resetCounter(todayDate?: string) {
  if (todayDate) {
    counters.delete(todayDate);
  } else {
    counters.clear();
  }
}
