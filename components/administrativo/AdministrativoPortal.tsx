'use client';

import { useMemo, useState } from 'react';

import { removeCategoryAction, removeServiceAction, removeStudentTypeAction } from '@/app/administrativo/actions';
import { AdministrativoShell } from '@/components/administrativo/AdministrativoShell';
import { CategoryForm } from '@/components/administrativo/CategoryForm';
import { DataTable } from '@/components/administrativo/DataTable';
import { ServiceForm } from '@/components/administrativo/ServiceForm/ServiceForm';
import { StudentTypeForm } from '@/components/administrativo/StudentTypeForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  AdminDashboardCounts,
  AdminServiceListItem,
  StudentTypeSummary,
} from '@/lib/academic-services/ports/academic-services-read';

type CategoryRow = {
  id: number;
  name: string;
  description: string | null;
  studentTypeId: number;
  studentTypeCode: string;
  studentTypeName: string;
};

type Props = {
  counts: AdminDashboardCounts;
  studentTypes: StudentTypeSummary[];
  categories: CategoryRow[];
  services: AdminServiceListItem[];
};

export function AdministrativoPortal({ counts, studentTypes, categories, services }: Props) {
  const [editingStudentType, setEditingStudentType] = useState<StudentTypeSummary | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [editingService, setEditingService] = useState<AdminServiceListItem | null>(null);
  const [serviceSheetOpen, setServiceSheetOpen] = useState(false);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        studentTypeId: category.studentTypeId,
      })),
    [categories],
  );

  return (
    <AdministrativoShell>
      <Tabs defaultValue="resumen">
        <TabsList className="mb-6 flex h-auto flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="tipos">Tipos</TabsTrigger>
          <TabsTrigger value="categorias">Categorías</TabsTrigger>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Tipos"
              value={counts.studentTypes}
            />
            <MetricCard
              label="Categorías"
              value={counts.categories}
            />
            <MetricCard
              label="Servicios"
              value={counts.services}
            />
            <MetricCard
              label="Activos"
              value={counts.activeServices}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="tipos"
          className="space-y-6"
        >
          <StudentTypeForm
            editing={editingStudentType}
            onDone={() => setEditingStudentType(null)}
          />
          <DataTable
            rows={studentTypes}
            rowKey={(row) => row.id}
            columns={[
              { key: 'code', header: 'Código', cell: (row) => row.code },
              { key: 'name', header: 'Nombre', cell: (row) => row.name },
              {
                key: 'actions',
                header: 'Acciones',
                cell: (row) => (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingStudentType(row)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeStudentTypeAction(row.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </TabsContent>

        <TabsContent
          value="categorias"
          className="space-y-6"
        >
          <CategoryForm
            studentTypes={studentTypes}
            editing={editingCategory}
            onDone={() => setEditingCategory(null)}
          />
          <DataTable
            rows={categories}
            rowKey={(row) => row.id}
            columns={[
              { key: 'type', header: 'Tipo', cell: (row) => row.studentTypeName },
              { key: 'name', header: 'Categoría', cell: (row) => row.name },
              {
                key: 'actions',
                header: 'Acciones',
                cell: (row) => (
                  <CategoryActions
                    row={row}
                    onEdit={setEditingCategory}
                  />
                ),
              },
            ]}
          />
        </TabsContent>

        <TabsContent
          value="servicios"
          className="space-y-4"
        >
          <div className="flex justify-end">
            <Button
              className="bg-utpl-blue text-white hover:bg-utpl-blue-hover"
              onClick={() => {
                setEditingService(null);
                setServiceSheetOpen(true);
              }}
            >
              Nuevo servicio
            </Button>
          </div>
          <DataTable
            rows={services}
            rowKey={(row) => row.id}
            columns={[
              { key: 'title', header: 'Título', cell: (row) => row.title },
              {
                key: 'active',
                header: 'Estado',
                cell: (row) => (
                  <Badge variant={row.isActive ? 'default' : 'secondary'}>
                    {row.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: 'Acciones',
                cell: (row) => (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingService(row);
                        setServiceSheetOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeServiceAction(row.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </TabsContent>
      </Tabs>

      <Sheet
        open={serviceSheetOpen}
        onOpenChange={setServiceSheetOpen}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{editingService ? 'Editar servicio' : 'Nuevo servicio'}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ServiceForm
              categories={categoryOptions}
              studentTypes={studentTypes}
              editing={editingService}
              onDone={() => {
                setServiceSheetOpen(false);
                setEditingService(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </AdministrativoShell>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-utpl-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-utpl-muted">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-utpl-blue">{value}</p>
      </CardContent>
    </Card>
  );
}

function CategoryActions({
  row,
  onEdit,
}: {
  row: CategoryRow;
  onEdit: (row: CategoryRow) => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit(row)}
      >
        Editar
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => removeCategoryAction(row.id)}
      >
        Eliminar
      </Button>
    </div>
  );
}
