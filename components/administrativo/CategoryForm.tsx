'use client';

import { saveCategoryAction } from '@/app/administrativo/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { StudentTypeSummary } from '@/lib/academic-services/ports/academic-services-read';

type CategoryRow = {
  id: number;
  name: string;
  description: string | null;
  studentTypeId: number;
};

type Props = {
  studentTypes: StudentTypeSummary[];
  editing?: CategoryRow | null;
  onDone?: () => void;
};

export function CategoryForm({ studentTypes, editing, onDone }: Props) {
  return (
    <form
      action={async (formData) => {
        if (editing) formData.set('id', String(editing.id));
        await saveCategoryAction(formData);
        onDone?.();
      }}
      className="grid gap-4 rounded-lg border border-utpl-border bg-white p-4"
    >
      <StudentTypeSelect
        studentTypes={studentTypes}
        defaultValue={editing?.studentTypeId ?? studentTypes[0]?.id}
      />
      <div className="grid gap-2">
        <Label htmlFor="category-name">Nombre</Label>
        <Input
          id="category-name"
          name="name"
          defaultValue={editing?.name}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category-description">Descripción</Label>
        <Textarea
          id="category-description"
          name="description"
          defaultValue={editing?.description ?? ''}
        />
      </div>
      <Button
        type="submit"
        className="bg-utpl-blue text-white hover:bg-utpl-blue-hover"
      >
        {editing ? 'Actualizar categoría' : 'Crear categoría'}
      </Button>
    </form>
  );
}

function StudentTypeSelect({
  studentTypes,
  defaultValue,
}: {
  studentTypes: StudentTypeSummary[];
  defaultValue?: number;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="studentTypeId">Tipo de estudiante</Label>
      <select
        id="studentTypeId"
        name="studentTypeId"
        defaultValue={defaultValue}
        className="h-9 rounded-md border border-utpl-border bg-white px-3 text-sm"
        required
      >
        {studentTypes.map((type) => (
          <option
            key={type.id}
            value={type.id}
          >
            {type.name}
          </option>
        ))}
      </select>
    </div>
  );
}
