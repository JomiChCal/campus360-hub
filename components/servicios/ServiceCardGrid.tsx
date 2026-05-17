'use client';

import type { ServiceListItem } from '@/lib/academic-services/ports/academic-services-read';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  services: ServiceListItem[];
  onSelect: (serviceId: number) => void;
};

export function ServiceCardGrid({ services, onSelect }: Props) {
  if (services.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-utpl-border bg-white p-8 text-center text-sm text-utpl-muted">
        No hay servicios que coincidan con tu búsqueda.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <button
          key={service.id}
          type="button"
          onClick={() => onSelect(service.id)}
          className="text-left"
        >
          <Card className="h-full border-utpl-border shadow-sm transition hover:border-utpl-gold/60 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base leading-snug text-utpl-blue">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-utpl-muted">
              {service.responseTime ? <p>Tiempo de respuesta: {service.responseTime}</p> : null}
              {service.modalityLevel ? <p>{service.modalityLevel}</p> : null}
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}
