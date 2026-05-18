'use client';

import type { StudentTypeSummary } from '@/lib/academic-services/ports/academic-services-read';
import { cn } from '@/lib/utils';
import styles from '@/components/servicios/servicios-presentational.module.css';

type Props = {
  studentTypes: StudentTypeSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function StudentTypeSidebar({ studentTypes, selectedId, onSelect }: Props) {
  const sorted = [...studentTypes].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="col-12 col-md-3">
      <div className="d-flex flex-column">
        <h5 className={styles.sectionTitle}>Tipos de Estudiante</h5>
        {sorted.map((type) => {
          const active = type.id === selectedId;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelect(type.id)}
              className={cn(
                'btn-utpl my-1 w-75',
                active ? 'btn-tipo-estudiante-select' : 'btn-tipo-estudiante',
                styles.controlButton,
                active && styles.controlButtonActive,
              )}
            >
              {type.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
