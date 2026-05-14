'use client';

import { motion } from 'framer-motion';
import { GraduationCap, MessageSquare, Search, Ticket, User, UserPlus } from 'lucide-react';

import type { UserType } from '@/types/form';

interface StepConfig {
  label: string;
  Icon: typeof GraduationCap;
  step: number;
  hidden?: boolean;
}

interface StepIndicatorProperties {
  currentStep: number;
  userType: UserType;
  onStepClick?: (step: number) => void;
}

function getSteps(userType: UserType): StepConfig[] {
  const steps: StepConfig[] = [
    { step: 1, label: 'Tipo', Icon: UserPlus },
    { step: 2, label: 'Datos', Icon: User },
  ];

  steps.push(
    { step: 3, label: 'Servicio', Icon: Search, hidden: userType === 'aspirante' },
    { step: 4, label: 'Detalle', Icon: MessageSquare }
  );

  steps.push({ step: 5, label: 'Turno', Icon: Ticket });

  return steps;
}

export default function StepIndicator({
  currentStep,
  userType,
  onStepClick,
}: StepIndicatorProperties) {
  const allSteps = getSteps(userType);
  const steps = allSteps.filter((s) => !s.hidden);

  return (
    <nav
      aria-label="Progreso"
      className="mb-8"
    >
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = step.step < currentStep;
          const isCurrent = step.step === currentStep;
          const isLast = index === steps.length - 1;
          const canClick = isCompleted && onStepClick;

          return (
            <li
              key={step.label}
              className="flex shrink-0 items-center"
            >
              <button
                type="button"
                disabled={!canClick}
                onClick={canClick ? () => onStepClick(step.step) : undefined}
                className={`flex flex-col items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none ${
                  canClick
                    ? 'cursor-pointer hover:scale-110 hover:shadow-md hover:brightness-110'
                    : 'cursor-default'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <motion.div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-9 sm:w-9 ${
                    isCurrent
                      ? 'border-utpl-blue bg-utpl-blue text-white shadow-md shadow-utpl-blue/20'
                      : isCompleted
                        ? 'border-utpl-gold bg-utpl-gold text-utpl-blue'
                        : 'border-slate-200 bg-white text-slate-300'
                  }`}
                  animate={isCurrent ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <step.Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </motion.div>
                <span
                  className={`whitespace-nowrap text-[10px] font-bold sm:text-xs ${
                    isCurrent
                      ? 'text-utpl-blue'
                      : isCompleted
                        ? 'text-utpl-blue/70'
                        : 'text-slate-300'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {!isLast && (
                <div className="relative mx-1 h-0.5 w-3 sm:mx-1.5 sm:w-5 md:w-8">
                  <div className="absolute inset-0 rounded-full bg-slate-100" />
                  {step.step < currentStep && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-utpl-gold"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
