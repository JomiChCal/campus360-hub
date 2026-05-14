'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect } from 'react';

import MobileWarningModal from '@/components/MobileWarningModal';
import PageHeader from '@/components/PageHeader';
import StepIndicator from '@/components/StepIndicator';
import GuideModal from '@/components/wizard/GuideModal';
import { FormProvider, useFormContext } from '@/contexts/FormContext';
import { buildRoute } from '@/lib/navigation-utilities';

const ROUTE_TO_STEP: Record<string, number> = {
  '/tipo': 1,
  '/datos': 2,
  '/servicio': 3,
  '/detalle': 4,
  '/resultado': 5,
};

const STEP_TO_ROUTE: Record<number, string> = {
  1: '/tipo',
  2: '/datos',
  3: '/servicio',
  4: '/detalle',
  5: '/resultado',
};

function FormShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const { data, maxSteps, submitError, guideModalOpen, setStep } = useFormContext();
  const pathname = usePathname();

  useEffect(() => {
    for (const [route, step] of Object.entries(ROUTE_TO_STEP)) {
      if (pathname.endsWith(route)) {
        if (data.step !== step) {
          setStep(step);
        }
        return;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isResultStep = pathname.endsWith('/resultado');

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
    <div className="flex min-h-dvh flex-col">
      <PageHeader />

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 py-6 sm:py-10 lg:items-center lg:py-8">
        <div className="relative w-full max-w-[800px] rounded-3xl bg-gradient-to-br from-[#004270]/40 via-[#febe10]/10 to-[#004270]/20 p-[1.5px] shadow-2xl shadow-slate-900/10">
          <div className="flex flex-col bg-white rounded-[calc(1.5rem-1.5px)]">
            <div className="shrink-0 px-6 pt-6 sm:px-10 sm:pt-10">
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-black tracking-tight text-utpl-blue sm:text-5xl">
                  decide ser <span className="text-utpl-gold">+</span>
                </h1>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-utpl-muted">
                  Centro de atención UTPL
                </p>
              </div>

              {submitError && (
                <motion.div
                  className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <p className="text-sm font-semibold text-red-700">Error al procesar</p>
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                </motion.div>
              )}

              <div suppressHydrationWarning>
                {!isResultStep && data.step < maxSteps && (
                  <StepIndicator
                    currentStep={data.step}
                    userType={data.userType}
                    onStepClick={handleStepClick}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center px-6 pb-6 pt-2 sm:px-10 sm:pb-10 sm:pt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 shrink-0 bg-slate-900 py-4 text-center">
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Universidad Técnica Particular de Loja
        </p>
      </footer>

      <GuideModal isOpen={guideModalOpen} />
      <MobileWarningModal />
    </div>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParameters = useSearchParams();

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(buildRoute(path, searchParameters));
    },
    [router, searchParameters]
  );

  return (
    <FormProvider onNavigate={handleNavigate}>
      <FormShell>{children}</FormShell>
    </FormProvider>
  );
}

export default function FormLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className="py-8 text-center text-sm text-utpl-muted">Cargando...</div>}
    >
      <LayoutWrapper>{children}</LayoutWrapper>
    </Suspense>
  );
}