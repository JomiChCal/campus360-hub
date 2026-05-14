'use client';

import { MessageSquare } from 'lucide-react';

import { useFormContext } from '@/contexts/FormContext';

export default function StepFreeText() {
  const { data, dispatch } = useFormContext();

  return (
    <div>
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
