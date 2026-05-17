'use client';

import { saveStudentTypeAction } from '@/app/administrativo/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { StudentTypeSummary } from '@/lib/academic-services/ports/academic-services-read';

type Props = {
  editing?: StudentTypeSummary | null;
  onDone?: () => void;
};

export function StudentTypeForm({ editing, onDone }: Props) {
  return (
    <form
      action={async (formData) => {
        if (editing) formData.set('id', String(editing.id));
        await saveStudentTypeAction(formData);
        onDone?.();
      }}
      className="grid gap-4 rounded-lg border border-utpl-border bg-white p-4"
    >
      <div className="grid gap-2">
        <Label htmlFor="code">Código</Label>
        <Input
          id="code"
          name="code"
          defaultValue={editing?.code}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={editing?.name}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={editing?.description ?? ''}
        />
      </div>
      <Button
        type="submit"
        className="bg-utpl-blue text-white hover:bg-utpl-blue-hover"
      >
        {editing ? 'Actualizar tipo' : 'Crear tipo'}
      </Button>
    </form>
  );
}
