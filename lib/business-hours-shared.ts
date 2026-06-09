export type BusinessHoursState = 'open' | 'lunch' | 'after-hours';

const ECUADOR_OFFSET_MINUTES = -5 * 60;

const MORNING_START = 8 * 60;
const MORNING_END = 12 * 60 + 45;
const AFTERNOON_START = 15 * 60;
const AFTERNOON_END = 17 * 60 + 45;

function getMinutesInEcuadorTime(date: Date): number {
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  return (utcMinutes + ECUADOR_OFFSET_MINUTES + 24 * 60) % (24 * 60);
}

export function getBusinessHoursState(): BusinessHoursState {
  const mockMode = process.env.NEXT_PUBLIC_MOCK_BUSINESS_HOURS;
  if (mockMode === 'open' || mockMode === 'lunch' || mockMode === 'after-hours') {
    return mockMode;
  }

  const now = new Date();
  const day = now.getUTCDay();

  if (day === 0 || day === 6) {
    return 'after-hours';
  }

  const minutes = getMinutesInEcuadorTime(now);

  if (minutes >= MORNING_START && minutes < MORNING_END) {
    return 'open';
  }

  if (minutes >= MORNING_END && minutes < AFTERNOON_START) {
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