'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import StepUserType from '@/components/wizard/StepUserType';
import { useFormContext } from '@/contexts/FormContext';
import { buildRoute } from '@/lib/navigation-utilities';

function TipoContent() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const { setUserType } = useFormContext();

  const handleSelectUserType = (type: 'estudiante' | 'aspirante') => {
    setUserType(type);
    router.push(buildRoute('/datos', searchParameters));
  };

  return <StepUserType onSelect={handleSelectUserType} />;
}

export default function TipoPage() {
  return (
    <Suspense
      fallback={<div className="py-8 text-center text-sm text-utpl-muted">Cargando...</div>}
    >
      <TipoContent />
    </Suspense>
  );
}
