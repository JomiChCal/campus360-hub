'use client';

import type { ServicePeriod } from '@/lib/academic-services/domain/service-detail';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Props = {
  periods: ServicePeriod[];
};

export function PeriodsTable({ periods }: Props) {
  if (periods.length === 0) return null;

  return (
    <div className="space-y-4">
      {periods.map((period) => (
        <div
          key={`${period.name}-${period.sortOrder}`}
          className="overflow-hidden rounded-lg border border-utpl-border bg-white"
        >
          <div className="bg-utpl-blue px-4 py-2 text-sm font-semibold text-white">{period.name}</div>
          {(() => {
            const showRequestWindow = period.modalities.some((modality) => Boolean(modality.requestWindow));
            const showResponseWindow = period.modalities.some((modality) => Boolean(modality.responseWindow));
            const showEnabledFrom = period.modalities.some((modality) => Boolean(modality.enabledFrom));
            const showEnabledTo = period.modalities.some((modality) => Boolean(modality.enabledTo));

            return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide whitespace-normal text-utpl-muted uppercase">
                  Modalidad
                </TableHead>
                {showRequestWindow ? (
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide whitespace-normal text-utpl-muted uppercase">
                    Ventana de solicitud
                  </TableHead>
                ) : null}
                {showResponseWindow ? (
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide whitespace-normal text-utpl-muted uppercase">
                    Ventana de respuesta
                  </TableHead>
                ) : null}
                {showEnabledFrom ? (
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide whitespace-normal text-utpl-muted uppercase">
                    Habilitado desde
                  </TableHead>
                ) : null}
                {showEnabledTo ? (
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide whitespace-normal text-utpl-muted uppercase">
                    Habilitado hasta
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {period.modalities.map((modality) => (
                <TableRow key={`${modality.modality}-${modality.sortOrder}`}>
                  <TableCell className="px-4 py-3 align-top whitespace-normal text-sm text-utpl-text">
                    {modality.modality}
                  </TableCell>
                  {showRequestWindow ? (
                    <TableCell className="px-4 py-3 align-top whitespace-normal text-sm text-utpl-text">
                      {modality.requestWindow ?? '—'}
                    </TableCell>
                  ) : null}
                  {showResponseWindow ? (
                    <TableCell className="px-4 py-3 align-top whitespace-normal text-sm text-utpl-text">
                      {modality.responseWindow ?? '—'}
                    </TableCell>
                  ) : null}
                  {showEnabledFrom ? (
                    <TableCell className="px-4 py-3 align-top whitespace-normal text-sm text-utpl-text">
                      {formatDateForDisplay(modality.enabledFrom)}
                    </TableCell>
                  ) : null}
                  {showEnabledTo ? (
                    <TableCell className="px-4 py-3 align-top whitespace-normal text-sm text-utpl-text">
                      {formatDateForDisplay(modality.enabledTo)}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

function formatDateForDisplay(value: string | null): string {
  if (!value) return '—';
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}
