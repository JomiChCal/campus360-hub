'use client';

import type { ServiceDetail } from '@/lib/academic-services/domain/service-detail';

import { ManualsList } from '@/components/servicios/ManualsList';
import { PeriodsTable } from '@/components/servicios/PeriodsTable';
import { RequirementTabs } from '@/components/servicios/RequirementTabs';
import { Separator } from '@/components/ui/separator';

type Props = {
  detail: ServiceDetail;
};

function formatCost(cost: string | null) {
  return cost?.trim() ? cost : 'Sin costo';
}

export function ServiceDetailContent({ detail }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-utpl-blue">{detail.title}</h2>
        {detail.description ? <p className="text-sm text-utpl-text">{detail.description}</p> : null}
        <div className="grid gap-2 text-sm text-utpl-muted sm:grid-cols-2">
          {detail.responseTime ? <p>Tiempo de respuesta: {detail.responseTime}</p> : null}
          <p>Costo: {formatCost(detail.cost)}</p>
          {detail.modalityLevel ? <p>Modalidad: {detail.modalityLevel}</p> : null}
        </div>
        {detail.note ? <p className="text-sm text-utpl-muted">{detail.note}</p> : null}
      </div>

      {detail.requirements.length > 0 ? (
        <section>
          <h3 className="mb-2 font-semibold text-utpl-blue">Requisitos</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {detail.requirements.map((req) => (
              <li key={`${req.text}-${req.sortOrder}`}>{req.text}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.requirementTabs.length > 0 ? (
        <section>
          <h3 className="mb-2 font-semibold text-utpl-blue">Requisitos por modalidad</h3>
          <RequirementTabs tabs={detail.requirementTabs} />
        </section>
      ) : null}

      {detail.periods.length > 0 ? (
        <section>
          <Separator className="my-4" />
          <h3 className="mb-3 font-semibold text-utpl-blue">Periodos</h3>
          <PeriodsTable periods={detail.periods} />
        </section>
      ) : null}

      {detail.manuals.length > 0 ? (
        <section>
          <h3 className="mb-2 font-semibold text-utpl-blue">Manuales</h3>
          <ManualsList manuals={detail.manuals} />
        </section>
      ) : null}
    </div>
  );
}
