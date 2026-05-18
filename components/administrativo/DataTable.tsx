'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
};

export function DataTable<T>({ columns, rows, rowKey, emptyMessage = 'Sin registros' }: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-dashed border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-elevated)] px-4 py-8 text-center">
        <p className="text-sm font-medium text-[color:var(--svc-color-text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-elevated)]">
      <Table className="[&_tr:last-child]:border-0">
        <TableHeader>
          <TableRow className="bg-[color:var(--svc-color-surface-subtle)]">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className="px-4 py-3 text-[var(--svc-text-2xs)] font-medium tracking-[0.08em] text-[color:var(--svc-color-text-muted)] uppercase"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              className="odd:bg-[color:var(--svc-color-surface-elevated)] even:bg-[color:var(--svc-color-surface-subtle)]/70 hover:bg-[color:var(--svc-color-surface-subtle)]"
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className="px-4 py-3 align-top text-sm text-[color:var(--svc-color-text-secondary)]"
                >
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
