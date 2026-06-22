'use client';

import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { getCategoryIcon } from '@/lib/category-icons';
import type { WizardCategory } from '@/types/category';

interface StepServiceCatalogProperties {
  categories: WizardCategory[];
  isLoading: boolean;
  onCategorySelect: (category: WizardCategory) => void;
  error?: string;
}

export default function StepServiceCatalog({
  categories,
  isLoading,
  onCategorySelect,
  error,
}: StepServiceCatalogProperties) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter(
      (category) =>
        category.title.toLowerCase().includes(query) ||
        (category.description?.toLowerCase().includes(query) ?? false)
    );
  }, [categories, searchQuery]);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-utpl-muted">Cargando categorías...</div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-center text-2xl font-bold text-utpl-text">
        ¿En qué podemos ayudarte?
      </h2>
      <p className="mb-6 text-center text-sm text-utpl-muted">
        Busca tu servicio o explora las categorías
      </p>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-utpl-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Buscar categoría..."
          className="w-full rounded-xl border-2 border-utpl-border bg-white py-3 pl-12 pr-10 text-sm text-utpl-text outline-none transition-all focus:border-utpl-blue focus:ring-2 focus:ring-utpl-blue/10 placeholder:text-gray-300"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-1.5 text-utpl-muted transition-colors hover:bg-gray-200 hover:text-utpl-text focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 text-center text-xs font-medium text-red-500">{error}</p>
      )}
      {filteredCategories.length === 0 ? (
        <p className="py-8 text-center text-sm text-utpl-muted">
          {searchQuery
            ? `No se encontraron categorías para "${searchQuery}"`
            : 'No hay categorías disponibles en este momento.'}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => {
            const Icon = getCategoryIcon(category.iconLabel);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategorySelect(category)}
                className="group rounded-2xl border border-utpl-border bg-white p-5 text-left shadow-md transition-all hover:-translate-y-1 hover:border-utpl-gold hover:shadow-xl focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-utpl-surface shadow-sm transition-colors group-hover:bg-utpl-gold/20">
                  <Icon className="h-6 w-6 text-utpl-blue" />
                </div>
                <h3 className="text-base font-bold text-utpl-text">{category.title}</h3>
                {category.description && (
                  <p className="mt-1 text-sm text-utpl-muted">{category.description}</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
