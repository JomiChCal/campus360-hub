'use client';

import { MessageSquare } from 'lucide-react';

import { useFormContext } from '@/contexts/FormContext';
import { c } from '@/data/content';
import type { RequirementType } from '@/types/form';

const requirementOptions: { value: RequirementType; label: string }[] = [
  { value: 'queja', label: c.steps.detalle.queja },
  { value: 'soporte', label: c.steps.detalle.soporte },
  { value: 'informacion', label: c.steps.detalle.informacion },
];

export default function StepFreeText() {
  const { data, dispatch } = useFormContext();

  return (
    <div>
      {data.userType === 'estudiante' && (
        <div className="mb-8">
          <p className="mb-4 text-center text-sm font-semibold text-utpl-muted">
            {c.steps.detalle.requirementQuestion}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {requirementOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_REQUIREMENT_TYPE',
                    requirementType:
                      data.requirementType === option.value ? null : option.value,
                  })
                }
                className={`rounded-full border-2 px-5 py-2 text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none ${
                  data.requirementType === option.value
                    ? 'border-utpl-blue bg-utpl-blue text-white shadow-sm'
                    : 'border-utpl-border bg-white text-utpl-muted hover:border-utpl-blue/40 hover:text-utpl-blue'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-2 text-center text-2xl font-bold text-utpl-text">
        Describe tu requerimiento
      </h2>
      <p className="mb-8 text-center text-sm text-utpl-muted">
        Sé lo más específico posible para recibir mejor atención
      </p>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-utpl-muted">
          <MessageSquare className="h-4 w-4" />
          Detalle de tu solicitud (opcional)
        </span>
        <textarea
          rows={5}
          value={data.freeText}
          onChange={(event) => dispatch({ type: 'SET_FREE_TEXT', text: event.target.value })}
          placeholder="Describe tu solicitud..."
          className="w-full rounded-xl border-2 border-utpl-border bg-white px-4 py-4 text-sm text-utpl-text outline-none transition-all hover:border-utpl-blue/40 focus:border-utpl-blue focus:ring-2 focus:ring-utpl-blue/10 placeholder:text-gray-300"
        />
      </label>
    </div>
  );
}
