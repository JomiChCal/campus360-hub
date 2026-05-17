'use client';

import { useMemo, useState } from 'react';

import { ServiceDetailModal } from '@/components/servicios/ServiceDetailModal';
import { CategoryChips } from '@/components/servicios/CategoryChips';
import { ServiceCardGrid } from '@/components/servicios/ServiceCardGrid';
import { ServiceSearchBar } from '@/components/servicios/ServiceSearchBar';
import { StudentTypeSidebar } from '@/components/servicios/StudentTypeSidebar';
import type { PublicPortalCatalog } from '@/lib/academic-services/ports/academic-services-read';

type Props = {
  initialCatalog: PublicPortalCatalog;
};

export function ServiciosPortal({ initialCatalog }: Props) {
  const [selectedStudentTypeId, setSelectedStudentTypeId] = useState<number | null>(
    initialCatalog.studentTypes[0]?.id ?? null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string | null>(null);

  const categoriesForType = useMemo(() => {
    if (!selectedStudentTypeId) return [];
    return initialCatalog.categories.filter((c) => c.studentTypeId === selectedStudentTypeId);
  }, [initialCatalog.categories, selectedStudentTypeId]);

  const activeCategoryId = useMemo(() => {
    if (selectedCategoryId && categoriesForType.some((c) => c.id === selectedCategoryId)) {
      return selectedCategoryId;
    }
    return categoriesForType[0]?.id ?? null;
  }, [categoriesForType, selectedCategoryId]);

  const filteredServices = useMemo(() => {
    if (!selectedStudentTypeId || !activeCategoryId) return [];
    const query = searchQuery.trim().toLowerCase();
    return initialCatalog.services.filter((service) => {
      if (service.studentTypeId !== selectedStudentTypeId) return false;
      if (service.categoryId !== activeCategoryId) return false;
      if (!query) return true;
      return service.title.toLowerCase().includes(query);
    });
  }, [activeCategoryId, initialCatalog.services, searchQuery, selectedStudentTypeId]);

  const handleStudentTypeSelect = (id: number) => {
    setSelectedStudentTypeId(id);
    setSelectedCategoryId(null);
    setSearchQuery('');
    setSelectedServiceId(null);
  };

  const handleServiceSelect = (serviceId: number) => {
    const service = filteredServices.find((s) => s.id === serviceId);
    setSelectedServiceId(serviceId);
    setSelectedServiceTitle(service?.title ?? null);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-wide text-utpl-blue uppercase sm:text-3xl">
          Servicios por tipo de estudiante.
        </h1>
        <p className="text-utpl-muted">
          Selecciona tu perfil y escoge el servicio que requieres
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <StudentTypeSidebar
          studentTypes={initialCatalog.studentTypes}
          selectedId={selectedStudentTypeId}
          onSelect={handleStudentTypeSelect}
        />

        <section className="space-y-6">
          <ServiceSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <section>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-utpl-blue uppercase">
              Categorías de servicio
            </h2>
            <CategoryChips
              categories={categoriesForType}
              selectedId={activeCategoryId}
              onSelect={setSelectedCategoryId}
            />
          </section>

          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-utpl-blue uppercase">
              Servicios
            </h2>
            <ServiceCardGrid
              services={filteredServices}
              onSelect={handleServiceSelect}
            />
          </section>
        </section>
      </div>

      <ServiceDetailModal
        open={selectedServiceId !== null}
        categoryId={activeCategoryId}
        serviceId={selectedServiceId}
        serviceTitle={selectedServiceTitle}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedServiceId(null);
            setSelectedServiceTitle(null);
          }
        }}
      />
    </div>
  );
}
