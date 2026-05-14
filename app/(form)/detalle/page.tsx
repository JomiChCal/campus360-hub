'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import StepFreeText from '@/components/wizard/StepFreeText';
import StepNavigation from '@/components/wizard/StepNavigation';
import { useFormContext } from '@/contexts/FormContext';
import { findServiceById } from '@/data/services';
import { buildRoute } from '@/lib/navigation-utilities';

function DetalleContent() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const mode = (searchParameters.get('mode') as 'turno' | 'fuera-horario') || 'turno';
  const contactTime = searchParameters.get('time') || '';

  const {
    data,
    dispatch,
    maxSteps,
    isSubmitting,
    validateCurrentStep,
    openGuideModal,
    submitForm,
  } = useFormContext();

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      dispatch({ type: 'ATTEMPT_VALIDATION', step: 4 });
      return;
    }

    if (data.userType === 'estudiante' && data.flowState === 'guide-shown') {
      const match = findServiceById(data.selectedServiceId ?? '');
      if (match?.service.result === 'GUIA') {
        openGuideModal();
        dispatch({ type: 'ATTEMPT_VALIDATION', step: 4 });
        return;
      }
    }

    await submitForm(mode, contactTime);
    router.push(buildRoute('/resultado', searchParameters));
  };

  const handlePrevious = () => {
    const previousRoute = data.userType === 'aspirante' ? '/datos' : '/servicio';
    router.push(buildRoute(previousRoute, searchParameters));
  };

  return (
    <>
      <StepFreeText />
      <StepNavigation
        currentStep={4}
        maxSteps={maxSteps}
        isSubmitting={isSubmitting}
        onNext={handleNext}
        onPrev={handlePrevious}
      />
    </>
  );
}

export default function DetallePage() {
  return (
    <Suspense
      fallback={<div className="py-8 text-center text-sm text-utpl-muted">Cargando...</div>}
    >
      <DetalleContent />
    </Suspense>
  );
}
