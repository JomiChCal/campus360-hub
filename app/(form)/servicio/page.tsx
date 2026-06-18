'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import StepNavigation from '@/components/wizard/StepNavigation';
import StepServiceCatalog from '@/components/wizard/StepServiceCatalog';
import { useFormContext } from '@/contexts/FormContext';
import { buildRoute } from '@/lib/navigation-utilities';

function ServicioContent() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const { maxSteps, isSubmitting } = useFormContext();

  const handleNext = () => {
    router.push(buildRoute('/detalle', searchParameters));
  };

  const handlePrevious = () => {
    router.push(buildRoute('/datos', searchParameters));
  };

  return (
    <>
      <StepServiceCatalog onServiceSelect={handleNext} />
      <StepNavigation
        currentStep={3}
        maxSteps={maxSteps}
        isSubmitting={isSubmitting}
        onNext={handleNext}
        onPrev={handlePrevious}
      />
    </>
  );
}

export default function ServicioPage() {
  return (
    <Suspense
      fallback={<div className="py-8 text-center text-sm text-utpl-muted">Cargando...</div>}
    >
      <ServicioContent />
    </Suspense>
  );
}
