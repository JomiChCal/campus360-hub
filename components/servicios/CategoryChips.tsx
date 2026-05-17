'use client';

import { cn } from '@/lib/utils';

type Category = {
  id: number;
  name: string;
};

type Props = {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

export function CategoryChips({ categories, selectedId, onSelect }: Props) {
  if (categories.length === 0) {
    return <p className="text-sm text-utpl-muted">No hay categorías para este tipo de estudiante.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const active = category.id === selectedId;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition',
              active
                ? 'border-utpl-gold bg-utpl-gold-light text-utpl-blue'
                : 'border-utpl-border bg-white text-utpl-muted hover:text-utpl-blue',
            )}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
