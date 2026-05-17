'use client';

import { useState } from 'react';

import { saveServiceAction } from '@/app/administrativo/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { AdminServiceListItem } from '@/lib/academic-services/ports/academic-services-read';
import type { StudentTypeSummary } from '@/lib/academic-services/ports/academic-services-read';

type CategoryRow = {
  id: number;
  name: string;
  studentTypeId: number;
};

type Props = {
  categories: CategoryRow[];
  studentTypes: StudentTypeSummary[];
  editing?: AdminServiceListItem | null;
  onDone?: () => void;
};

export function ServiceForm({ categories, studentTypes, editing, onDone }: Props) {
  const [isActive, setIsActive] = useState(editing?.isActive ?? true);
  const [requirementsText, setRequirementsText] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualLabel, setManualLabel] = useState('Descargar aquí');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await saveServiceAction({
      id: editing?.id,
      categoryId: Number(formData.get('categoryId')),
      title: String(formData.get('title')),
      description: formData.get('description') || null,
      modalityLevel: formData.get('modalityLevel') || null,
      responseTime: formData.get('responseTime') || null,
      cost: formData.get('cost') || null,
      note: formData.get('note') || null,
      isActive,
      requirements: requirementsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text, sortOrder) => ({ text, sortOrder })),
      requirementTabs: [],
      periods: [],
      manuals:
        manualUrl.trim().length > 0
          ? [{ label: manualLabel || 'Manual', url: manualUrl.trim(), sortOrder: 0 }]
          : [],
    });

    onDone?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="requirements">Requisitos</TabsTrigger>
          <TabsTrigger value="manuals">Manuales</TabsTrigger>
        </TabsList>

        <TabsContent
          value="general"
          className="grid gap-4 pt-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="categoryId">Categoría</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={editing?.categoryId ?? categories[0]?.id}
              className="h-9 rounded-md border border-utpl-border bg-white px-3 text-sm"
              required
            >
              {categories.map((category) => {
                const type = studentTypes.find((st) => st.id === category.studentTypeId);
                return (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {type?.name} — {category.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              defaultValue={editing?.title}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
            />
          </div>
          <ServiceMetaFields />
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label>Servicio activo (visible en /servicios)</Label>
          </div>
        </TabsContent>

        <TabsContent
          value="requirements"
          className="pt-4"
        >
          <Label htmlFor="requirements">Requisitos (uno por línea)</Label>
          <Textarea
            id="requirements"
            value={requirementsText}
            onChange={(event) => setRequirementsText(event.target.value)}
            rows={8}
          />
        </TabsContent>

        <TabsContent
          value="manuals"
          className="grid gap-4 pt-4"
        >
          <ServiceManualFields
            manualLabel={manualLabel}
            manualUrl={manualUrl}
            onLabelChange={setManualLabel}
            onUrlChange={setManualUrl}
          />
        </TabsContent>
      </Tabs>

      <Button
        type="submit"
        className="bg-utpl-blue text-white hover:bg-utpl-blue-hover"
      >
        {editing ? 'Guardar servicio' : 'Crear servicio'}
      </Button>
    </form>
  );
}

function ServiceMetaFields() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="responseTime">Tiempo de respuesta</Label>
        <Input
          id="responseTime"
          name="responseTime"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="cost">Costo</Label>
        <Input
          id="cost"
          name="cost"
        />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="modalityLevel">Modalidad / nivel</Label>
        <Input
          id="modalityLevel"
          name="modalityLevel"
        />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="note">Nota</Label>
        <Textarea
          id="note"
          name="note"
          rows={2}
        />
      </div>
    </div>
  );
}

function ServiceManualFields({
  manualLabel,
  manualUrl,
  onLabelChange,
  onUrlChange,
}: {
  manualLabel: string;
  manualUrl: string;
  onLabelChange: (value: string) => void;
  onUrlChange: (value: string) => void;
}) {
  return (
  <>
      <div className="grid gap-2">
        <Label htmlFor="manualLabel">Etiqueta del manual</Label>
        <Input
          id="manualLabel"
          value={manualLabel}
          onChange={(event) => onLabelChange(event.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="manualUrl">URL del manual</Label>
        <Input
          id="manualUrl"
          value={manualUrl}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://"
        />
      </div>
    </>
  );
}
