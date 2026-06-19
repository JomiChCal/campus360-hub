'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepNavigationProperties {
  currentStep: number;
  maxSteps: number;
  isSubmitting: boolean;
  onNext: () => void;
  onPrev: () => void;
  hideNext?: boolean;
}

export default function StepNavigation({
  currentStep,
  maxSteps,
  isSubmitting,
  onNext,
  onPrev,
  hideNext = false,
}: StepNavigationProperties) {
  if (currentStep >= maxSteps) return null;

  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {currentStep > 1 ? (
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 rounded-xl border border-utpl-border bg-white px-5 py-2.5 text-sm font-semibold text-utpl-muted transition-all hover:border-utpl-blue hover:text-utpl-blue active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </button>
      ) : (
        <div />
      )}
      {currentStep !== 1 && !hideNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 rounded-xl bg-utpl-blue px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-utpl-blue-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Procesando...
            </span>
          ) : (
            <>
              {currentStep === maxSteps - 1 ? 'Enviar' : 'Siguiente'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
