'use client';

import type { StudentTypeSummary } from '@/lib/academic-services/ports/academic-services-read';
import { cn } from '@/lib/utils';

type Props = {
  studentTypes: StudentTypeSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function StudentTypeSidebar({ studentTypes, selectedId, onSelect }: Props) {
  return (
    <aside className="flex flex-col gap-2">
      <p className="mb-2 text-xs font-semibold tracking-wide text-utpl-muted uppercase">
        Tipos de estudiante
      </p>
      {studentTypes.map((type) => {
        const active = type.id === selectedId;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelect(type.id)}
            className={cn(
              'rounded-lg border px-4 py-3 text-left text-sm font-medium shadow-sm transition',
              active
                ? 'border-utpl-gold/60 bg-utpl-gold-light text-utpl-blue'
                : 'border-utpl-border bg-white text-utpl-text hover:border-utpl-blue/30',
            )}
          >
            {type.name.toUpperCase()}
          </button>
        );
      })}
    </aside>
  );
}
