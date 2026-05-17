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
          className="overflow-hidden rounded-lg border border-utpl-border"
        >
          <div className="bg-utpl-blue px-4 py-2 text-sm font-semibold text-white">{period.name}</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modalidad</TableHead>
                <TableHead>Ventana de solicitud</TableHead>
                <TableHead>Ventana de respuesta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {period.modalities.map((modality) => (
                <TableRow key={`${modality.modality}-${modality.sortOrder}`}>
                  <TableCell>{modality.modality}</TableCell>
                  <TableCell>{modality.requestWindow ?? '—'}</TableCell>
                  <TableCell>{modality.responseWindow ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
