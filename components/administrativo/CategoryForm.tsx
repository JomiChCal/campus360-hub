'use client';

import { useState } from 'react';

import { saveCategoryAction } from '@/app/administrativo/actions';
import { ADMIN_FIELD_CLASS, ADMIN_SELECT_CLASS } from '@/components/administrativo/admin-tab-styles';
import {
  clearInvalidMessage,
  GENERIC_FORM_ERROR_MESSAGE,
  setGenericInvalidMessage,
} from '@/components/administrativo/form-validation';
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
  isActive: boolean;
};

type Props = {
  studentTypes: StudentTypeSummary[];
  editing?: CategoryRow | null;
  onDone?: () => void;
};

export function CategoryForm({ studentTypes, editing, onDone }: Props) {
  const formKey = editing ? `editing-${editing.id}` : 'create';
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <form
      key={formKey}
      action={async (formData) => {
        setFormError(null);
        try {
          if (editing) formData.set('id', String(editing.id));
          await saveCategoryAction(formData);
          onDone?.();
        } catch {
          setFormError(GENERIC_FORM_ERROR_MESSAGE);
        }
      }}
      onInvalidCapture={(event) => {
        setGenericInvalidMessage(event.target);
        setFormError(GENERIC_FORM_ERROR_MESSAGE);
      }}
      onInputCapture={(event) => {
        clearInvalidMessage(event.target);
        if (formError) setFormError(null);
      }}
      className="grid gap-4 rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-elevated)] p-5"
    >
      <StudentTypeSelect
        studentTypes={studentTypes}
        defaultValue={editing?.studentTypeId ?? studentTypes[0]?.id}
      />
      <div className="grid gap-2">
        <Label
          htmlFor="category-name"
          className="text-[var(--svc-text-2xs)] font-medium tracking-[0.08em] text-[color:var(--svc-color-text-muted)] uppercase"
        >
          Nombre
        </Label>
        <Input
          id="category-name"
          name="name"
          defaultValue={editing?.name}
          className={ADMIN_FIELD_CLASS}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label
          htmlFor="category-description"
          className="text-[var(--svc-text-2xs)] font-medium tracking-[0.08em] text-[color:var(--svc-color-text-muted)] uppercase"
        >
          Descripción
        </Label>
        <Textarea
          id="category-description"
          name="description"
          defaultValue={editing?.description ?? ''}
          className={ADMIN_FIELD_CLASS}
        />
      </div>
      <div className="flex items-center gap-3 rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] px-3 py-2">
        <input
          id="isActive"
          type="checkbox"
          name="isActive"
          value="true"
          defaultChecked={editing?.isActive ?? true}
          className="h-4 w-4"
        />
        <Label
          htmlFor="isActive"
          className="text-[var(--svc-text-xs)] text-[color:var(--svc-color-text-secondary)]"
        >
          Activo
        </Label>
      </div>
      <Button
        type="submit"
        className="rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-strong)] bg-[color:var(--svc-color-surface-elevated)] text-[color:var(--svc-color-text-primary)] hover:bg-[color:var(--svc-color-surface-subtle)] sm:w-fit"
      >
        {editing ? 'Actualizar categoría' : 'Crear categoría'}
      </Button>
      {formError ? <p className="text-sm font-medium text-red-600">{formError}</p> : null}
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
      <Label
        htmlFor="studentTypeId"
        className="text-[var(--svc-text-2xs)] font-medium tracking-[0.08em] text-[color:var(--svc-color-text-muted)] uppercase"
      >
        Tipo de estudiante
      </Label>
      <select
        id="studentTypeId"
        name="studentTypeId"
        defaultValue={defaultValue}
        className={ADMIN_SELECT_CLASS}
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
