'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import StepIndicator from '@/components/StepIndicator';
import { useFormContext } from '@/contexts/FormContext';
import { buildRoute } from '@/lib/navigation-utilities';

const STEP_TO_ROUTE: Record<number, string> = {
  1: '/tipo',
  2: '/datos',
  3: '/servicio',
  4: '/detalle',
  5: '/resultado',
};

interface FormStepIndicatorProperties {
  className?: string;
}

export default function FormStepIndicator({ className }: FormStepIndicatorProperties) {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const { data } = useFormContext();

  const handleStepClick = useCallback(
    (step: number) => {
      const route = STEP_TO_ROUTE[step];
      if (route) {
        router.push(buildRoute(route, searchParameters));
      }
    },
    [router, searchParameters]
  );

  return (
    <div className={className}>
      <StepIndicator
        currentStep={data.step}
        userType={data.userType}
        onStepClick={handleStepClick}
      />
    </div>
  );
}
