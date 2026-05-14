'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import StepNavigation from '@/components/wizard/StepNavigation';
import StepPersonalData from '@/components/wizard/StepPersonalData';
import { useFormContext } from '@/contexts/FormContext';
import { buildRoute } from '@/lib/navigation-utilities';

function DatosContent() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const { data, dispatch, maxSteps, isSubmitting, validateCurrentStep } = useFormContext();

  const handleNext = () => {
    if (!validateCurrentStep()) {
      dispatch({ type: 'ATTEMPT_VALIDATION', step: 2 });
      return;
    }
    const nextRoute = data.userType === 'aspirante' ? '/detalle' : '/servicio';
    router.push(buildRoute(nextRoute, searchParameters));
  };

  const handlePrevious = () => {
    router.push(buildRoute('/tipo', searchParameters));
  };

  return (
    <>
      <StepPersonalData onPrev={handlePrevious} />
      <StepNavigation
        currentStep={2}
        maxSteps={maxSteps}
        isSubmitting={isSubmitting}
        onNext={handleNext}
        onPrev={handlePrevious}
      />
    </>
  );
}

export default function DatosPage() {
  return (
    <Suspense
      fallback={<div className="py-8 text-center text-sm text-utpl-muted">Cargando...</div>}
    >
      <DatosContent />
    </Suspense>
  );
}
