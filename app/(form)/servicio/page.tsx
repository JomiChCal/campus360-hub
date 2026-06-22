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
  const { data, dispatch, maxSteps, isSubmitting } = useFormContext();
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
      dispatch({ type: 'SET_STEP', step: 4 });
      router.push(buildRoute('/detalle', searchParameters));
    },
    [dispatch, router, searchParameters]
  );

  return (
    <>
      <StepServiceCatalog
        categories={categories}
        isLoading={isLoading}
        onCategorySelect={handleCategorySelect}
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
