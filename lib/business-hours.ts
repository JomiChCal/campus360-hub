export type BusinessHoursState = 'open' | 'lunch' | 'after-hours';

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

export function getBusinessHoursState(): BusinessHoursState {
  const mockMode = process.env.NEXT_PUBLIC_MOCK_BUSINESS_HOURS;
  if (mockMode === 'open' || mockMode === 'lunch' || mockMode === 'after-hours') {
    return mockMode;
  }

  const now = getEcuadorDate();
  const minutes = getMinutesSinceMidnight(now);

  if (!isWeekday(now)) {
    return 'after-hours';
  }

  const OPEN_MORNING_START = 8 * 60;
  const OPEN_MORNING_END = 12 * 60 + 45;
  const OPEN_AFTERNOON_START = 15 * 60;
  const OPEN_AFTERNOON_END = 17 * 60 + 45;

  if (
    (minutes >= OPEN_MORNING_START && minutes < OPEN_MORNING_END) ||
    (minutes >= OPEN_AFTERNOON_START && minutes < OPEN_AFTERNOON_END)
  ) {
    return 'open';
  }

  if (minutes >= OPEN_MORNING_END && minutes < OPEN_AFTERNOON_START) {
    return 'lunch';
  }

  return 'after-hours';
}

export function canAcceptNewTurnos(): boolean {
  return getBusinessHoursState() === 'open';
}

export function getBusinessHoursMessage(): string {
  return 'Lunes a Viernes: 08:00 - 13:00 y 15:00 - 18:00';
}

export const CONTACT_TIME_OPTIONS = [
  { value: '08:00 - 09:00', label: '08:00 - 09:00' },
  { value: '09:00 - 10:00', label: '09:00 - 10:00' },
  { value: '10:00 - 11:00', label: '10:00 - 11:00' },
  { value: '11:00 - 12:00', label: '11:00 - 12:00' },
  { value: '12:00 - 13:00', label: '12:00 - 13:00' },
  { value: '15:00 - 16:00', label: '15:00 - 16:00' },
  { value: '16:00 - 17:00', label: '16:00 - 17:00' },
  { value: '17:00 - 18:00', label: '17:00 - 18:00' },
];
