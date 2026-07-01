import { motion } from 'framer-motion';
import { Layers, Ticket, User, UserPlus, type LucideIcon } from 'lucide-react';
import { memo } from 'react';

import { c } from '@/data/content';
import type { UserType } from '@/types/form';

interface StepConfig {
  label: string;
  Icon: LucideIcon;
  visualStep: number;
  wizardStep: number;
}

interface StepIndicatorProperties {
  currentStep: number;
  userType: UserType;
  onStepClick?: (step: number) => void;
}

function getAllSteps(): StepConfig[] {
  return [
    { visualStep: 1, wizardStep: 1, label: c.steps.indicador.paso1, Icon: UserPlus },
    { visualStep: 2, wizardStep: 2, label: c.steps.indicador.paso2, Icon: User },
    { visualStep: 3, wizardStep: 3, label: c.steps.indicador.categoria, Icon: Layers },
    { visualStep: 4, wizardStep: 4, label: c.steps.indicador.turno, Icon: Ticket },
  ];
}

function StepIndicator({ currentStep, onStepClick }: StepIndicatorProperties) {
  const allSteps = getAllSteps();
  const currentVisual = currentStep;
  const completedCount = allSteps.filter((s) => s.visualStep < currentVisual).length;
  const totalVisible = allSteps.length;
  const progressPercent =
    totalVisible > 1 ? Math.max(0, (completedCount / (totalVisible - 1)) * 100) : 0;

  return (
    <nav
      aria-label={c.steps.indicador.ariaLabel}
      className="w-full"
      suppressHydrationWarning
    >
      <div className="relative flex items-center justify-center gap-0">
        {allSteps.map((step, index) => {
          const isCompleted = step.visualStep < currentVisual;
          const isCurrent = step.visualStep === currentVisual;
              // Solo permitir retroceder, nunca saltar hacia adelante
              const canClick = isCompleted && onStepClick && step.visualStep < currentVisual;
          const isLast = index === allSteps.length - 1;

          return (
            <div
              key={step.label}
              className="flex items-center"
            >
              <button
                type="button"
                disabled={!canClick}
                onClick={canClick ? () => onStepClick(step.wizardStep) : undefined}
                className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-utpl-navy focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none ${
                  canClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-11 sm:w-11 ${
                    isCurrent
                      ? 'border-[#febe10] bg-[#febe10] text-utpl-navy'
                      : isCompleted
                        ? 'border-[#febe10] bg-[#febe10]/20 text-utpl-navy'
                        : 'border-utpl-border bg-utpl-surface text-utpl-muted'
                  }`}
                >
                  <step.Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </motion.div>
                <span
                  className={`whitespace-nowrap text-[10px] font-semibold tracking-wide sm:text-[11px] ${
                    isCurrent
                      ? 'text-utpl-navy'
                      : isCompleted
                        ? 'text-utpl-navy/70'
                        : 'text-utpl-muted'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {!isLast && (
                <div className="mx-1.5 h-0.5 w-6 rounded-full bg-utpl-border sm:mx-2 sm:w-8">
                  {isCompleted && (
                    <motion.div
                      className="h-full rounded-full bg-[#febe10]"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-3 h-1 max-w-md overflow-hidden rounded-full bg-utpl-border">
        <motion.div
          className="h-full rounded-full bg-[#febe10]"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </nav>
  );
}

export default memo(StepIndicator);
