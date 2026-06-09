'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { findServiceById } from '@/data/services';
import { useFormWizard } from '@/hooks/use-form-wizard';
import { useTurnAssignment } from '@/hooks/use-turn-assignment';
import { canAcceptNewTurnos } from '@/lib/business-hours';
import { logAutogestion } from '@/lib/simulation';
import type { FormAction, FormData, ServiceMode, ValidationErrors } from '@/types/form';

interface FormContextType {
  data: FormData;
  dispatch: React.Dispatch<FormAction>;
  maxSteps: number;
  isSubmitting: boolean;
  submitError: string | null;
  errors: ValidationErrors;
  guideModalOpen: boolean;
  contactTimeModalOpen: boolean;
  reset: () => void;
  updateField: (field: keyof FormData, value: string) => void;
  setUserType: (userType: FormData['userType']) => void;
  setStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  validateCurrentStep: () => boolean;
  getStepErrors: () => ValidationErrors;
  submitForm: (mode: ServiceMode, preSelectedContactTime?: string) => Promise<void>;
  openGuideModal: () => void;
  handleSolvedFromModal: () => void;
  handleNeedAdvisorFromModal: () => void;
  handleContactTimeConfirm: (time: string) => void;
  closeContactTimeModal: () => void;
}

const FormContext = createContext<FormContextType | null>(null);

export function FormProvider({
  children,
  onNavigate,
}: {
  children: ReactNode;
  onNavigate?: (path: string) => void;
}) {
  const wizard = useFormWizard();
  const { isSubmitting, submitError, assignTurno, assignFueraHorario } = useTurnAssignment();
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [contactTimeModalOpen, setContactTimeModalOpen] = useState(false);

  const openGuideModal = useCallback(() => {
    setGuideModalOpen(true);
  }, []);

  const closeGuideModal = useCallback(() => {
    setGuideModalOpen(false);
  }, []);

  const closeContactTimeModal = useCallback(() => {
    setContactTimeModalOpen(false);
  }, []);

  const submitForm = useCallback(
    async (mode: ServiceMode, preSelectedContactTime: string = '') => {
      const currentlyOpen = canAcceptNewTurnos();
      const effectiveMode = mode === 'fuera-horario' || !currentlyOpen ? 'fuera-horario' : 'turno';

      if (effectiveMode === 'fuera-horario' && !preSelectedContactTime) {
        setContactTimeModalOpen(true);
        return;
      }

      if (wizard.data.userType === 'aspirante') {
        wizard.dispatch({ type: 'SET_STEP', step: wizard.maxSteps });
        const result = await (effectiveMode === 'fuera-horario'
          ? assignFueraHorario(wizard.data, 'Aspirante UTPL', preSelectedContactTime, 'TURNO')
          : assignTurno(wizard.data, 'Aspirante UTPL', 'TURNO'));

        if (result.success && result.turnoNumber) {
          wizard.dispatch({ type: 'SET_TURNO_NUMBER', turnoNumber: result.turnoNumber });
          if (result.zoomLink && result.webZoomLink) {
            wizard.dispatch({
              type: 'SET_ZOOM_LINKS',
              zoomLink: result.zoomLink,
              webZoomLink: result.webZoomLink,
            });
          }
          wizard.dispatch({ type: 'SET_FLOW_STATE', flowState: 'turno-assigned' });
        } else if (result.success) {
          wizard.dispatch({ type: 'SET_FLOW_STATE', flowState: 'fuera-horario' });
        }
        return;
      }

      const match = findServiceById(wizard.data.selectedServiceId ?? '');
      if (!match) return;

      wizard.dispatch({ type: 'SET_STEP', step: wizard.maxSteps });

      const origen = wizard.data.flowState === 'guide-shown' ? 'GUIA' : 'TURNO';
      const result = await (effectiveMode === 'fuera-horario'
        ? assignFueraHorario(wizard.data, match.category.title, preSelectedContactTime, origen)
        : assignTurno(wizard.data, match.category.title, origen));

      if (result.success && result.turnoNumber) {
        wizard.dispatch({ type: 'SET_TURNO_NUMBER', turnoNumber: result.turnoNumber });
        if (result.zoomLink && result.webZoomLink) {
          wizard.dispatch({
            type: 'SET_ZOOM_LINKS',
            zoomLink: result.zoomLink,
            webZoomLink: result.webZoomLink,
          });
        }
        wizard.dispatch({ type: 'SET_FLOW_STATE', flowState: 'turno-assigned' });
      } else if (result.success) {
        wizard.dispatch({ type: 'SET_FLOW_STATE', flowState: 'fuera-horario' });
      }
    },
    [wizard.data, wizard.dispatch, wizard.maxSteps, assignTurno, assignFueraHorario]
  );

  const handleContactTimeConfirm = useCallback(
    (time: string) => {
      setContactTimeModalOpen(false);
      submitForm('fuera-horario', time);
    },
    [submitForm]
  );

  const handleSolvedFromModal = useCallback(() => {
    const match = findServiceById(wizard.data.selectedServiceId ?? '');
    closeGuideModal();
    wizard.dispatch({ type: 'SET_FLOW_STATE', flowState: 'completed' });
    logAutogestion(
      wizard.data.nombres,
      wizard.data.apellidos,
      wizard.data.cedula,
      wizard.data.email,
      match?.service.label ?? '',
      'ÉXITO',
      wizard.data.pais
    );
    onNavigate?.('/resultado');
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [wizard.data, wizard.dispatch, closeGuideModal, onNavigate]);

  const handleNeedAdvisorFromModal = useCallback(async () => {
    const match = findServiceById(wizard.data.selectedServiceId ?? '');
    closeGuideModal();
    wizard.dispatch({ type: 'SET_FLOW_STATE', flowState: 'needs-advisor' });
    await submitForm('turno');
    onNavigate?.('/resultado');
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [wizard.data, wizard.dispatch, closeGuideModal, submitForm, onNavigate]);

  const errors = useMemo(() => wizard.getStepErrors(), [wizard.getStepErrors]);

  const value = useMemo<FormContextType>(
    () => ({
      data: wizard.data,
      dispatch: wizard.dispatch,
      maxSteps: wizard.maxSteps,
      isSubmitting,
      submitError,
      errors,
      guideModalOpen,
      contactTimeModalOpen,
      reset: wizard.reset,
      updateField: wizard.updateField,
      setUserType: wizard.setUserType,
      setStep: wizard.setStep,
      goToNextStep: wizard.goToNextStep,
      goToPreviousStep: wizard.goToPreviousStep,
      validateCurrentStep: wizard.validateCurrentStep,
      getStepErrors: wizard.getStepErrors,
      submitForm,
      openGuideModal,
      handleSolvedFromModal,
      handleNeedAdvisorFromModal,
      handleContactTimeConfirm,
      closeContactTimeModal,
    }),
    [
      wizard.data,
      wizard.dispatch,
      wizard.maxSteps,
      wizard.reset,
      wizard.updateField,
      wizard.setUserType,
      wizard.setStep,
      wizard.goToNextStep,
      wizard.goToPreviousStep,
      wizard.validateCurrentStep,
      wizard.getStepErrors,
      isSubmitting,
      submitError,
      errors,
      guideModalOpen,
      contactTimeModalOpen,
      submitForm,
      openGuideModal,
      handleSolvedFromModal,
      handleNeedAdvisorFromModal,
      handleContactTimeConfirm,
      closeContactTimeModal,
    ]
  );

  return <FormContext value={value}>{children}</FormContext>;
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
