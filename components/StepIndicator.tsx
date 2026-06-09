import { motion } from 'framer-motion';
import { GraduationCap, Ticket, User, UserPlus } from 'lucide-react';
import { memo } from 'react';

import { c } from '@/data/content';
import type { UserType } from '@/types/form';

interface StepConfig {
  label: string;
  Icon: typeof GraduationCap;
  visualStep: number;
  wizardStep: number;
}

interface StepIndicatorProperties {
  currentStep: number;
  userType: UserType;
  onStepClick?: (step: number) => void;
}

function getAllSteps(userType: UserType): StepConfig[] {
  return [
    { visualStep: 1, wizardStep: 1, label: c.steps.indicador.paso1, Icon: UserPlus },
    { visualStep: 2, wizardStep: 2, label: c.steps.indicador.paso2, Icon: User },
    { visualStep: 3, wizardStep: userType === 'aspirante' ? 4 : 3, label: c.steps.indicador.turno, Icon: Ticket },
  ];
}

function wizardStepToVisual(wizardStep: number, userType: UserType): number {
  if (userType === 'aspirante') {
    if (wizardStep <= 2) return wizardStep;
    return wizardStep - 1;
  }
  return wizardStep;
}

function StepIndicator({ currentStep, userType, onStepClick }: StepIndicatorProperties) {
  const allSteps = getAllSteps(userType);
  const currentVisual = wizardStepToVisual(currentStep, userType);
  const completedCount = allSteps.filter((s) => s.visualStep < currentVisual).length;
  const totalVisible = allSteps.length;
  const progressPercent = Math.max(0, (completedCount / (totalVisible - 1)) * 100);

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
          const canClick = isCompleted && onStepClick;
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
                className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-utpl-navy-medium focus-visible:outline-none ${
                  canClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-11 sm:w-11 ${
                    isCurrent
                      ? 'border-utpl-gold bg-utpl-gold text-utpl-navy'
                      : isCompleted
                        ? 'border-utpl-gold bg-utpl-gold/20 text-utpl-gold'
                        : 'border-white/20 bg-white/10 text-white/50'
                  }`}
                >
                  <step.Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </motion.div>
                <span
                  className={`whitespace-nowrap text-[10px] font-semibold tracking-wide sm:text-[11px] ${
                    isCurrent ? 'text-utpl-gold' : isCompleted ? 'text-utpl-gold/80' : 'text-white/50'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {!isLast && (
                <div className="mx-1.5 h-0.5 w-6 rounded-full bg-white/15 sm:mx-2 sm:w-8">
                  {isCompleted && (
                    <motion.div
                      className="h-full rounded-full bg-utpl-gold"
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

      <div className="mx-auto mt-3 h-1 max-w-md overflow-hidden rounded-full bg-white/15">
        <motion.div
          className="h-full rounded-full bg-utpl-gold"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </nav>
  );
}

export default memo(StepIndicator);