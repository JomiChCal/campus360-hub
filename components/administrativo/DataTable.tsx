'use client';

import {
  type ColumnDef,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from '@/components/kibo-ui/table';

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
      <div className="rounded-md border border-dashed px-4 py-8 text-center">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <TableProvider
          columns={columns.map<ColumnDef<T>>((column) => ({
            id: column.key,
            accessorFn: (row) => row,
            header: ({ column: headerColumn }) => (
              <TableColumnHeader
                column={headerColumn}
                title={column.header}
              />
            ),
            cell: ({ row }) => column.cell(row.original),
          }))}
          data={rows}
        >
          <TableHeader>
            {({ headerGroup }) => (
              <TableHeaderGroup
                key={headerGroup.id}
                headerGroup={headerGroup}
              >
                {({ header }) => <TableHead header={header} key={header.id} />}
              </TableHeaderGroup>
            )}
          </TableHeader>
          <TableBody>
            {({ row }) => (
              (() => {
                const typedRow = row as { id: string; original: T };
                return (
                  <TableRow
                    key={rowKey(typedRow.original)}
                    row={typedRow}
                  >
                    {({ cell }) => <TableCell cell={cell} key={cell.id} />}
                  </TableRow>
                );
              })()
            )}
          </TableBody>
        </TableProvider>
      </table>
    </div>
  );
}
