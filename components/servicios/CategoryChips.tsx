'use client';

import { cn } from '@/lib/utils';
import styles from '@/components/servicios/servicios-presentational.module.css';

type Category = {
  id: number;
  name: string;
  sortOrder?: number;
};

type Props = {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function CategoryChips({ categories, selectedId, onSelect }: Props) {
  const sorted = [...categories].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  if (sorted.length === 0) {
    return (
      <>
        <h5 className={styles.sectionTitle}>Categorías de Servicio</h5>
        <p className="text-muted">No hay categorías para este tipo de estudiante.</p>
      </>
    );
  }

  return (
    <>
      <h5 className={styles.sectionTitle}>Categorías de Servicio</h5>
      <div className="d-flex flex-wrap">
        {sorted.map((category) => {
          const active = category.id === selectedId;
          return (
            <div
              key={category.id}
              className="col-12 col-sm-6 col-md-4 mb-3"
            >
              <button
                type="button"
                onClick={() => onSelect(category.id)}
                className={cn(
                  'btn-utpl col-11 m-auto',
                  active ? 'btn-tipo-estudiante-select' : 'btn-tipo-estudiante',
                  styles.controlButton,
                  active && styles.controlButtonActive,
                )}
              >
                {category.name}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
