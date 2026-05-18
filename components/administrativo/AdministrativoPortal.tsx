'use client';

import { useMemo, useState } from 'react';
import { BookOpenText, FolderKanban, Shapes, Wrench } from 'lucide-react';

import {
  loadServiceForEditAction,
  removeCategoryAction,
  removeServiceAction,
  removeStudentTypeAction,
} from '@/app/administrativo/actions';
import { ADMIN_TABS_LIST_CLASS, ADMIN_TABS_TRIGGER_CLASS } from '@/components/administrativo/admin-tab-styles';
import { AdministrativoShell } from '@/components/administrativo/AdministrativoShell';
import { CategoryForm } from '@/components/administrativo/CategoryForm';
import { DataTable } from '@/components/administrativo/DataTable';
import { ServiceForm } from '@/components/administrativo/ServiceForm/ServiceForm';
import { StudentTypeForm } from '@/components/administrativo/StudentTypeForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  AdminServiceEdit,
  AdminServiceListItem,
  StudentTypeSummary,
} from '@/lib/academic-services/ports/academic-services-read';

type CategoryRow = {
  id: number;
  name: string;
  description: string | null;
  studentTypeId: number;
  sortOrder: number;
  isActive: boolean;
  studentTypeCode: string;
  studentTypeName: string;
};

type Props = {
  studentTypes: StudentTypeSummary[];
  categories: CategoryRow[];
  services: AdminServiceListItem[];
};

export function AdministrativoPortal({ studentTypes, categories, services }: Props) {
  const [editingStudentType, setEditingStudentType] = useState<StudentTypeSummary | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [editingServiceDetail, setEditingServiceDetail] = useState<AdminServiceEdit | null>(null);
  const [serviceFormLoading, setServiceFormLoading] = useState(false);
  const [serviceSheetOpen, setServiceSheetOpen] = useState(false);

  function openCreateServiceSheet() {
    setEditingServiceDetail(null);
    setServiceFormLoading(false);
    setServiceSheetOpen(true);
  }

  async function openEditServiceSheet(row: AdminServiceListItem) {
    setEditingServiceDetail(null);
    setServiceSheetOpen(true);
    setServiceFormLoading(true);
    try {
      const detail = await loadServiceForEditAction(row.id);
      if (!detail) {
        setServiceSheetOpen(false);
        return;
      }
      setEditingServiceDetail(detail);
    } finally {
      setServiceFormLoading(false);
    }
  }

  function closeServiceSheet() {
    setServiceSheetOpen(false);
    setEditingServiceDetail(null);
    setServiceFormLoading(false);
  }

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        studentTypeId: category.studentTypeId,
      })),
    [categories],
  );

  const studentTypeNameById = useMemo(
    () => new Map(studentTypes.map((studentType) => [studentType.id, studentType.name])),
    [studentTypes],
  );

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const modalityOptions = useMemo(() => {
    const values = new Set<string>();
    for (const service of services) {
      const { modality } = splitModalityAndLevel(service.modalityLevel);
      if (modality) values.add(modality);
    }
    return [...values].sort((a, b) => a.localeCompare(b, 'es'));
  }, [services]);

  const levelOptions = useMemo(() => {
    const values = new Set<string>();
    for (const service of services) {
      const { level } = splitModalityAndLevel(service.modalityLevel);
      if (level) values.add(level);
    }
    return [...values].sort((a, b) => a.localeCompare(b, 'es'));
  }, [services]);

  return (
    <AdministrativoShell>
      <Tabs defaultValue="tipos-estudiante">
        <TabsList className={ADMIN_TABS_LIST_CLASS}>
          <TabsTrigger
            value="tipos-estudiante"
            className={ADMIN_TABS_TRIGGER_CLASS}
          >
            <Shapes className="mr-2 h-4 w-4" />
            Tipos de estudiante
          </TabsTrigger>
          <TabsTrigger
            value="categorias"
            className={ADMIN_TABS_TRIGGER_CLASS}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            Categorías
          </TabsTrigger>
          <TabsTrigger
            value="servicios"
            className={ADMIN_TABS_TRIGGER_CLASS}
          >
            <Wrench className="mr-2 h-4 w-4" />
            Servicios
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="tipos-estudiante"
          className="space-y-5 pt-1"
        >
          <StudentTypeForm
            editing={editingStudentType}
            onDone={() => setEditingStudentType(null)}
          />
          <DataTable
            rows={studentTypes}
            rowKey={(row) => row.id}
            emptyMessage="No hay tipos de estudiante registrados."
            columns={[
              { key: 'name', header: 'Tipo de estudiante', cell: (row) => row.name },
              {
                key: 'description',
                header: 'Descripción',
                cell: (row) => row.description ?? '—',
              },
              {
                key: 'actions',
                header: 'Acciones',
                cell: (row) => (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] text-[color:var(--svc-color-text-secondary)] hover:bg-[color:var(--svc-color-surface-elevated)]"
                      onClick={() => setEditingStudentType(row)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
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
          className="space-y-5 pt-1"
        >
          <CategoryForm
            studentTypes={studentTypes}
            editing={editingCategory}
            onDone={() => setEditingCategory(null)}
          />
          <DataTable
            rows={categories}
            rowKey={(row) => row.id}
            emptyMessage="No hay categorías registradas."
            columns={[
              { key: 'type', header: 'Tipo de estudiante', cell: (row) => row.studentTypeName },
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
          className="space-y-5 pt-1"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-full items-center gap-2 rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] px-3 py-2 text-[var(--svc-text-xs)] font-medium tracking-[0.04em] text-[color:var(--svc-color-text-secondary)] sm:w-auto">
              <BookOpenText className="h-4 w-4 text-[color:var(--svc-color-text-muted)]" />
              Edita un servicio para ajustar fechas de habilitación y requisitos.
            </div>
            <Button
              className="w-full rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-strong)] bg-[color:var(--svc-color-surface-elevated)] text-[color:var(--svc-color-text-primary)] hover:bg-[color:var(--svc-color-surface-subtle)] sm:w-auto"
              onClick={openCreateServiceSheet}
            >
              Nuevo servicio
            </Button>
          </div>
          <DataTable
            rows={services}
            rowKey={(row) => row.id}
            emptyMessage="No hay servicios cargados."
            columns={[
              {
                key: 'type',
                header: 'Tipo',
                cell: (row) => studentTypeNameById.get(row.studentTypeId) ?? '—',
              },
              {
                key: 'category',
                header: 'Categoría',
                cell: (row) => categoryById.get(row.categoryId)?.name ?? '—',
              },
              { key: 'title', header: 'Título', cell: (row) => row.title },
              {
                key: 'active',
                header: 'Estado',
                cell: (row) => (
                  <Badge
                    variant="secondary"
                    className={statusBadgeClass(row.isActive, row.status)}
                  >
                    {statusLabel(row.isActive, row.status)}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: 'Acciones',
                cell: (row) => (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] text-[color:var(--svc-color-text-secondary)] hover:bg-[color:var(--svc-color-surface-elevated)]"
                      onClick={() => openEditServiceSheet(row)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
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
        onOpenChange={(open) => {
          if (!open) closeServiceSheet();
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-strong)] bg-[color:var(--svc-color-surface-elevated)] p-0 data-[side=right]:w-full data-[side=right]:sm:w-1/2 data-[side=right]:sm:max-w-none">
          <SheetHeader className="shrink-0 border-b border-[color:var(--svc-color-border-soft)] bg-[color:var(--svc-color-surface-subtle)] px-6 py-4">
            <SheetTitle>
              {serviceFormLoading
                ? 'Cargando servicio…'
                : editingServiceDetail
                  ? 'Editar servicio'
                  : 'Nuevo servicio'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {serviceFormLoading ? (
              <p className="px-6 py-8 text-sm text-[color:var(--svc-color-text-muted)]">Cargando datos del servicio…</p>
            ) : (
              <ServiceForm
                key={editingServiceDetail?.id ?? 'new'}
                categories={categoryOptions}
                studentTypes={studentTypes}
                modalityOptions={modalityOptions}
                levelOptions={levelOptions}
                editing={editingServiceDetail}
                variant="sheet"
                onDone={closeServiceSheet}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </AdministrativoShell>
  );
}

function statusLabel(isActive: boolean, status: AdminServiceListItem['status']) {
  if (!isActive) return 'Inactivo';
  if (status === 'published') return 'Publicado';
  if (status === 'needs_review') return 'Revisión';
  return 'Borrador';
}

function statusBadgeClass(isActive: boolean, status: AdminServiceListItem['status']) {
  if (!isActive) {
    return 'rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] text-[color:var(--svc-color-text-muted)]';
  }
  if (status === 'published') {
    return 'rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-emerald-300 bg-emerald-50 text-emerald-700';
  }
  if (status === 'needs_review') {
    return 'rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-amber-300 bg-amber-50 text-amber-700';
  }
  return 'rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-strong)] bg-[color:var(--svc-color-surface-elevated)] text-[color:var(--svc-color-text-secondary)]';
}

function CategoryActions({
  row,
  onEdit,
}: {
  row: CategoryRow;
  onEdit: (row: CategoryRow) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] text-[color:var(--svc-color-text-secondary)] hover:bg-[color:var(--svc-color-surface-elevated)]"
        onClick={() => onEdit(row)}
      >
        Editar
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
        onClick={() => removeCategoryAction(row.id)}
      >
        Eliminar
      </Button>
    </div>
  );
}

function splitModalityAndLevel(modalityLevel: string | null) {
  if (!modalityLevel) return { modality: null, level: null };
  const normalized = modalityLevel.replace(/\s+/g, ' ').trim();
  if (!normalized) return { modality: null, level: null };

  const [leftRaw, rightRaw] = normalized.split(/—|-/);
  const modality = leftRaw
    ?.replace(/^modalidad\s*(y\s*nivel\s*de\s*estudios?)?\s*:?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const level = rightRaw
    ?.replace(/^nivel\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    modality: modality && modality.length > 0 ? modality : null,
    level: level && level.length > 0 ? level : null,
  };
}
