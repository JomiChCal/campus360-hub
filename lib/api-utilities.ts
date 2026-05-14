const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;

const MAX_FIELD_LENGTH = 500;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.length > MAX_FIELD_LENGTH) {
    return trimmed.slice(0, MAX_FIELD_LENGTH);
  }
  if (
    trimmed.startsWith('=') ||
    trimmed.startsWith('+') ||
    trimmed.startsWith('-') ||
    trimmed.startsWith('@')
  ) {
    return `'${trimmed}`;
  }
  return trimmed;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} es requerido`;
  }
  return null;
}

export function validateCedula(cedula: string): string | null {
  const cleaned = cedula.replaceAll(/\D/g, '');
  if (cleaned.length !== 10) {
    return 'Cédula debe tener 10 dígitos';
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  const cleaned = phone.replaceAll(/\D/g, '');
  if (cleaned.length !== 10) {
    return 'Teléfono debe tener 10 dígitos';
  }
  return null;
}
