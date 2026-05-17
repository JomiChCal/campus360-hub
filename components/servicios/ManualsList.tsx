'use client';

import type { ServiceManual } from '@/lib/academic-services/domain/service-detail';
import { ExternalLink } from 'lucide-react';

type Props = {
  manuals: ServiceManual[];
};

export function ManualsList({ manuals }: Props) {
  if (manuals.length === 0) return null;

  return (
    <ul className="space-y-2">
      {manuals.map((manual) => (
        <li key={`${manual.label}-${manual.sortOrder}`}>
          <a
            href={manual.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-utpl-blue underline"
          >
            {manual.label}
            <ExternalLink className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}
