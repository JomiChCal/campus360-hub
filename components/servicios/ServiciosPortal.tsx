'use client';

import { useMemo, useState } from 'react';

import { ServiceDetailModal } from '@/components/servicios/ServiceDetailModal';
import { CategoryChips } from '@/components/servicios/CategoryChips';
import { ServiceCardGrid } from '@/components/servicios/ServiceCardGrid';
import { ServiceSearchBar } from '@/components/servicios/ServiceSearchBar';
import { PortalSupportActions, PORTAL_CANVAS_ID } from '@/components/servicios/PortalSupportActions';
import { StudentTypeSidebar } from '@/components/servicios/StudentTypeSidebar';
import styles from '@/components/servicios/servicios-presentational.module.css';
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
    return initialCatalog.categories
      .filter((c) => c.studentTypeId === selectedStudentTypeId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [initialCatalog.categories, selectedStudentTypeId]);

  const activeCategoryId = useMemo(() => {
    if (selectedCategoryId && categoriesForType.some((c) => c.id === selectedCategoryId)) {
      return selectedCategoryId;
    }
    const matricula = categoriesForType.find((c) => c.name === 'SERVICIOS-MATRÍCULA');
    return matricula?.id ?? categoriesForType[0]?.id ?? null;
  }, [categoriesForType, selectedCategoryId]);

  const filteredServices = useMemo(() => {
    if (!selectedStudentTypeId || !activeCategoryId) return [];
    const query = searchQuery.trim().toLowerCase();
    return initialCatalog.services
      .filter((service) => {
        if (service.studentTypeId !== selectedStudentTypeId) return false;
        if (service.categoryId !== activeCategoryId) return false;
        if (!query) return true;
        return service.title.toLowerCase().includes(query);
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [activeCategoryId, initialCatalog.services, searchQuery, selectedStudentTypeId]);

  const handleStudentTypeSelect = (id: number) => {
    setSelectedStudentTypeId(id);
    setSelectedCategoryId(null);
    setSearchQuery('');
    setSelectedServiceId(null);
  };

  const handleServiceSelect = (serviceId: number) => {
    const service = filteredServices.find((s) => s.id === serviceId);
    if (!service) return;
    setSelectedServiceId(serviceId);
    setSelectedServiceTitle(service.title);
  };

  return (
    <>
      <header className="mb-4 text-center">
        <h1
          className={`h3 fw-bold text-uppercase ${styles.portalHeaderTitle}`}
        >
          Servicios por tipo de estudiante.
        </h1>
        <p className={styles.portalHeaderSubtitle}>
          Selecciona tu perfil y escoge el servicio que requieres
        </p>
      </header>

      <div
        id={PORTAL_CANVAS_ID}
        className={`container mt-3 wrapper-servicios ${styles.portalCanvas}`}
      >
        <div className="d-flex flex-column flex-md-row">
          <StudentTypeSidebar
            studentTypes={initialCatalog.studentTypes}
            selectedId={selectedStudentTypeId}
            onSelect={handleStudentTypeSelect}
          />

          <div className="col-12 col-md-9 d-flex flex-column">
            <div className="d-flex flex-column col-11 m-auto">
              <ServiceSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />

              <CategoryChips
                categories={categoriesForType}
                selectedId={activeCategoryId}
                onSelect={setSelectedCategoryId}
              />

              <h5 className={`mt-3 ${styles.sectionTitle}`}>Servicios</h5>
              <ServiceCardGrid
                services={filteredServices}
                onSelect={handleServiceSelect}
              />
            </div>
          </div>
        </div>
      </div>

      <PortalSupportActions />

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
    </>
  );
}
