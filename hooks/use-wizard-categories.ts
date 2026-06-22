'use client';

import { useEffect, useState } from 'react';

import type { WizardCategory } from '@/types/category';
import type { UserType } from '@/types/form';

function audienceFromUserType(userType: UserType): 'continuo' | 'nuevo' | null {
  if (userType === 'estudiante') return 'continuo';
  if (userType === 'aspirante') return 'nuevo';
  return null;
}

export function useWizardCategories(userType: UserType) {
  const [categories, setCategories] = useState<WizardCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audience = audienceFromUserType(userType);
    if (!audience) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/categorias?audience=${audience}`, {
          cache: 'no-store',
        });
        if (!response.ok) return;

        const data = (await response.json()) as { categories?: WizardCategory[] };
        if (cancelled) return;
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [userType]);

  return { categories, isLoading };
}
