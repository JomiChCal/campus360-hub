'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback } from 'react';

import StepNavigation from '@/components/wizard/StepNavigation';
import StepServiceCatalog from '@/components/wizard/StepServiceCatalog';
import { useFormContext } from '@/contexts/FormContext';
import { useWizardCategories } from '@/hooks/use-wizard-categories';
import { buildRoute } from '@/lib/navigation-utilities';
import type { WizardCategory } from '@/types/category';

function ServicioContent() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const { data, dispatch, maxSteps, isSubmitting, validateCurrentStep, errors } = useFormContext();
  const { categories, isLoading } = useWizardCategories(data.userType);

  const handlePrevious = () => {
    router.push(buildRoute('/datos', searchParameters));
  };

  const handleCategorySelect = useCallback(
    (category: WizardCategory) => {
      dispatch({
        type: 'SET_SELECTED_CATEGORY',
        categoryId: category.id,
        categoryTitle: category.title,
      });
      // Validar antes de navegar
      setTimeout(() => {
        const errors = validateCurrentStep();
        if (!errors) {
          dispatch({ type: 'ATTEMPT_VALIDATION', step: 3 });
          return;
        }
        dispatch({ type: 'SET_STEP', step: 4 });
        router.push(buildRoute('/detalle', searchParameters));
      }, 0);
    },
    [dispatch, router, searchParameters, validateCurrentStep]
  );

  return (
    <>
      <StepServiceCatalog
        categories={categories}
        isLoading={isLoading}
        onCategorySelect={handleCategorySelect}
        error={errors.selectedCategoryId}
      />
      <StepNavigation
        currentStep={3}
        maxSteps={maxSteps}
        isSubmitting={isSubmitting}
        onNext={() => {}}
        onPrev={handlePrevious}
        hideNext
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
