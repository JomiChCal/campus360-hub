'use client';

import { ArrowRight, GraduationCap, User } from 'lucide-react';

interface StepUserTypeProperties {
  onSelect: (type: 'estudiante' | 'aspirante') => void;
}

export default function StepUserType({ onSelect }: StepUserTypeProperties) {
  return (
    <div>
      <h2 className="mb-2 text-center text-2xl font-bold text-utpl-text">
        ¿Eres estudiante UTPL o aspirante?
      </h2>
      <p className="mb-8 text-center text-sm text-utpl-muted">
        Selecciona tu tipo de usuario para continuar
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect('estudiante')}
          className="group rounded-2xl border border-utpl-border bg-white p-6 text-left shadow-md transition-all hover:-translate-y-1 hover:border-utpl-blue hover:shadow-xl focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-utpl-surface shadow-sm transition-colors group-hover:bg-utpl-blue">
            <GraduationCap className="h-7 w-7 text-utpl-blue transition-colors group-hover:text-white" />
          </div>
          <h3 className="text-lg font-bold text-utpl-text">Ya soy estudiante UTPL</h3>
          <p className="mt-2 text-sm leading-relaxed text-utpl-muted">
            Accede a servicios de matrícula, finanzas, académico y más.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-utpl-blue opacity-0 transition-opacity group-hover:opacity-100">
            <span>Comenzar</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </button>
        <button
          type="button"
          onClick={() => onSelect('aspirante')}
          className="group rounded-2xl border border-utpl-border bg-white p-6 text-left shadow-md transition-all hover:-translate-y-1 hover:border-utpl-blue hover:shadow-xl focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-utpl-surface shadow-sm transition-colors group-hover:bg-utpl-blue">
            <User className="h-7 w-7 text-utpl-blue transition-colors group-hover:text-white" />
          </div>
          <h3 className="text-lg font-bold text-utpl-text">Soy aspirante a la UTPL</h3>
          <p className="mt-2 text-sm leading-relaxed text-utpl-muted">
            Conoce más sobre admisiones, carreras y proceso de ingreso.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-utpl-blue opacity-0 transition-opacity group-hover:opacity-100">
            <span>Comenzar</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </button>
      </div>
    </div>
  );
}
