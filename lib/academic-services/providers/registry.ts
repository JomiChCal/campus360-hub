import type { AcademicServicesReadPort } from '@/lib/academic-services/ports/academic-services-read';
import type { AcademicServicesWritePort } from '@/lib/academic-services/ports/academic-services-write';
import { neonReadPort } from '@/lib/academic-services/providers/neon/read-port';
import { neonWritePort } from '@/lib/academic-services/providers/neon/write-port';
import { microsoftReadPort } from '@/lib/academic-services/providers/microsoft/read-port';
import { microsoftWritePort } from '@/lib/academic-services/providers/microsoft/write-port';

export type AcademicServicesProvider = 'neon' | 'microsoft';

export function getAcademicServicesProvider(): AcademicServicesProvider {
  const raw = process.env.ACADEMIC_SERVICES_DATA_PROVIDER?.trim().toLowerCase();
  if (raw === 'neon' || raw === 'microsoft') return raw;
  throw new Error(
    'ACADEMIC_SERVICES_DATA_PROVIDER must be "neon" or "microsoft" (see .env.example)',
  );
}

export function getReadPort(): AcademicServicesReadPort {
  return getAcademicServicesProvider() === 'neon' ? neonReadPort : microsoftReadPort;
}

export function getWritePort(): AcademicServicesWritePort {
  return getAcademicServicesProvider() === 'neon' ? neonWritePort : microsoftWritePort;
}
