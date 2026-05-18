'use client';

import type { ServiceListItem } from '@/lib/academic-services/ports/academic-services-read';
import styles from '@/components/servicios/servicios-presentational.module.css';
type Props = {
  services: ServiceListItem[];
  onSelect: (serviceId: number) => void;
};

export function ServiceCardGrid({ services, onSelect }: Props) {
  if (services.length === 0) {
    return (
      <p className="text-muted">No hay servicios que coincidan con tu búsqueda.</p>
    );
  }

  return (
    <div className="d-flex flex-wrap">
      {services.map((service) => (
        <div
          key={service.id}
          className="col-12 col-sm-6 col-md-4 mb-3"
        >
          <button
            type="button"
            onClick={() => onSelect(service.id)}
            className={`btn-utpl btn-tipo-estudiante col-11 m-auto ${styles.controlButton}`}
          >
            {service.title}
          </button>
        </div>
      ))}
    </div>
  );
}
