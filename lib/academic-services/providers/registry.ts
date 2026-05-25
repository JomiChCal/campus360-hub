import type { AcademicServicesReadPort } from '@/lib/academic-services/ports/academic-services-read';
import type { AcademicServicesWritePort } from '@/lib/academic-services/ports/academic-services-write';
import { microsoftReadPort } from '@/lib/academic-services/providers/microsoft/read-port';
import { microsoftWritePort } from '@/lib/academic-services/providers/microsoft/write-port';

export type AcademicServicesProvider = 'microsoft';

export function getAcademicServicesProvider(): AcademicServicesProvider {
  return 'microsoft';
}

export function getReadPort(): AcademicServicesReadPort {
  return microsoftReadPort;
}

export function getWritePort(): AcademicServicesWritePort {
  return microsoftWritePort;
}
