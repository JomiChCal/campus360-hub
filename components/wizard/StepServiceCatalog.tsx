'use client';

import {
  BookOpen,
  Calendar,
  ChevronLeft,
  DollarSign,
  FileText,
  GraduationCap,
  Monitor,
  ScrollText,
  Search,
  Shuffle,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { useFormContext } from '@/contexts/FormContext';
import { serviceCatalog } from '@/data/services';

const categoryIcons: Record<string, typeof BookOpen> = {
  matricula: BookOpen,
  'reconocimiento-estudios': ScrollText,
  'cambio-carrera': Shuffle,
  'informacion-general': Calendar,
  finanzas: DollarSign,
  plataformas: Monitor,
  academico: GraduationCap,
  'solicitudes-excepcionales': FileText,
};

interface StepServiceCatalogProperties {
  onServiceSelect: () => void;
}

export default function StepServiceCatalog({ onServiceSelect }: StepServiceCatalogProperties) {
  const { data, dispatch } = useFormContext();
  const [serviceSearch, setServiceSearch] = useState('');

  const searchedServices = serviceCatalog.flatMap((category) =>
    category.services
      .filter(
        (service) =>
          service.label.toLowerCase().includes(serviceSearch.toLowerCase()) ||
          category.title.toLowerCase().includes(serviceSearch.toLowerCase())
      )
      .map((service) => ({ service, category }))
  );

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
          value={serviceSearch}
          onChange={(event) => setServiceSearch(event.target.value)}
          placeholder="Buscar servicio..."
          className="w-full rounded-xl border-2 border-utpl-border bg-white py-3 pl-12 pr-10 text-sm text-utpl-text outline-none transition-all focus:border-utpl-blue focus:ring-2 focus:ring-utpl-blue/10 placeholder:text-gray-300"
        />
        {serviceSearch && (
          <button
            type="button"
            onClick={() => setServiceSearch('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-100 p-1.5 text-utpl-muted transition-colors hover:bg-gray-200 hover:text-utpl-text focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {serviceSearch ? (
        <div className="space-y-2">
          {searchedServices.length === 0 ? (
            <p className="py-8 text-center text-sm text-utpl-muted">
              No se encontraron servicios para &quot;{serviceSearch}&quot;
            </p>
          ) : (
            searchedServices.map(({ service, category }) => (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  dispatch({ type: 'SET_SELECTED_SERVICE', serviceId: service.id });
                  onServiceSelect();
                }}
                className="w-full rounded-xl border border-utpl-border bg-white px-5 py-4 text-left text-utpl-text shadow-sm transition-all hover:border-utpl-gold hover:shadow-md focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{service.label}</span>
                  <span className="text-xs text-utpl-muted">{category.title}</span>
                </div>
              </button>
            ))
          )}
          <button
            type="button"
            onClick={() => setServiceSearch('')}
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-utpl-blue transition-colors hover:text-utpl-blue-hover focus-visible:underline focus-visible:outline-none"
          >
            <ChevronLeft className="h-4 w-4" />
            Explorar categorías
          </button>
        </div>
      ) : data.selectedCategoryId === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCatalog.map((category) => {
            const Icon = categoryIcons[category.id] ?? BookOpen;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => dispatch({ type: 'SET_SELECTED_CATEGORY', categoryId: category.id })}
                className="group rounded-2xl border border-utpl-border bg-white p-5 text-left shadow-md transition-all hover:-translate-y-1 hover:border-utpl-gold hover:shadow-xl focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-utpl-surface shadow-sm transition-colors group-hover:bg-utpl-gold/20">
                  <Icon className="h-6 w-6 text-utpl-blue" />
                </div>
                <h3 className="text-base font-bold text-utpl-text">{category.title}</h3>
                <p className="mt-1 text-sm text-utpl-muted">
                  {category.services.length} opción
                  {category.services.length === 1 ? '' : 'es'}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_SELECTED_CATEGORY', categoryId: '' })}
            className="flex items-center gap-2 text-sm font-semibold text-utpl-blue transition-colors hover:text-utpl-blue-hover focus-visible:underline focus-visible:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
            Volver a categorías
          </button>
          <div className="space-y-3">
            {serviceCatalog
              .find((cat) => cat.id === data.selectedCategoryId)
              ?.services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'SET_SELECTED_SERVICE', serviceId: service.id });
                    onServiceSelect();
                  }}
                  className="w-full rounded-xl border-2 border-utpl-border bg-white px-5 py-4 text-left text-sm font-semibold text-utpl-text shadow-md transition-all hover:border-utpl-gold hover:bg-utpl-gold/5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {service.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
