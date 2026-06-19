'use client';

import { useCallback, useEffect, useReducer } from 'react';

import { validateStep } from '@/lib/validation';
import type { FormAction, FormData, UserType } from '@/types/form';

const STORAGE_KEY = 'campus360-form-data';

const initialFormData: FormData = {
  step: 1,
  userType: null,
  nombres: '',
  apellidos: '',
  cedula: '',
  email: '',
  modalidad: '',
  pais: 'Ecuador',
  prefijoTelefonico: '+593',
  telefono: '',
  selectedCategoryId: null,
  selectedCategoryTitle: '',
  selectedServiceId: null,
  requirementType: null,
  freeText: '',
  acceptedPrivacy: false,
  acceptedPolicies: false,
  flowState: 'guide-shown',
  turnoNumber: null,
  zoomLink: null,
  webZoomLink: null,
  attemptedStepValidation: null,
};

function loadFromStorage(): FormData {
  if (globalThis.window === undefined) return initialFormData;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...initialFormData, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return initialFormData;
}

function saveToStorage(data: FormData) {
  if (globalThis.window === undefined) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

function clearStorage() {
  if (globalThis.window === undefined) return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

function formReducer(state: FormData, action: FormAction): FormData {
  switch (action.type) {
    case 'SET_STEP': {
      return { ...state, step: action.step, attemptedStepValidation: null };
    }
    case 'SET_USER_TYPE': {
      return { ...state, userType: action.userType };
    }
    case 'SET_FIELD': {
      return { ...state, [action.field]: action.value };
    }
    case 'SET_MODALIDAD': {
      return { ...state, modalidad: action.modalidad };
    }
    case 'SET_SELECTED_CATEGORY': {
      return {
        ...state,
        selectedCategoryId: action.categoryId || null,
        selectedCategoryTitle: action.categoryTitle || '',
        selectedServiceId: null,
      };
    }
    case 'SET_SELECTED_SERVICE': {
      return { ...state, selectedServiceId: action.serviceId };
    }
    case 'SET_REQUIREMENT_TYPE': {
      return { ...state, requirementType: action.requirementType };
    }
    case 'SET_FREE_TEXT': {
      return { ...state, freeText: action.text };
    }
    case 'SET_ACCEPTED_PRIVACY': {
      return { ...state, acceptedPrivacy: action.accepted };
    }
    case 'SET_ACCEPTED_POLICIES': {
      return { ...state, acceptedPolicies: action.accepted };
    }
    case 'SET_FLOW_STATE': {
      return { ...state, flowState: action.flowState };
    }
    case 'SET_TURNO_NUMBER': {
      return { ...state, turnoNumber: action.turnoNumber };
    }
    case 'SET_ZOOM_LINKS': {
      return { ...state, zoomLink: action.zoomLink, webZoomLink: action.webZoomLink };
    }
    case 'ATTEMPT_VALIDATION': {
      return { ...state, attemptedStepValidation: action.step };
    }
    case 'CLEAR_VALIDATION_ATTEMPT': {
      return { ...state, attemptedStepValidation: null };
    }
    case 'RESET': {
      clearStorage();
      return { ...initialFormData };
    }
    default: {
      return state;
    }
  }
}

export function getMaxSteps(userType: UserType): number {
  if (userType === 'estudiante') return 5;
  if (userType === 'aspirante') return 5;
  return 1;
}

export function getNextStep(_userType: UserType, currentStep: number): number {
  return currentStep + 1;
}

export function getPreviousStep(_userType: UserType, currentStep: number): number {
  const previousStep = currentStep - 1;
  return previousStep < 1 ? 1 : previousStep;
}

export function useFormWizard() {
  const [data, dispatch] = useReducer(formReducer, undefined, loadFromStorage);

  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setUserType = useCallback((userType: UserType) => {
    dispatch({ type: 'SET_USER_TYPE', userType });
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const goToNextStep = useCallback(() => {
    const next = getNextStep(data.userType, data.step);
    dispatch({ type: 'SET_STEP', step: next });
  }, [data.userType, data.step]);

  const goToPreviousStep = useCallback(() => {
    const previous = getPreviousStep(data.userType, data.step);
    dispatch({ type: 'SET_STEP', step: previous });
  }, [data.userType, data.step]);

  const validateCurrentStep = useCallback((): boolean => {
    const errors = validateStep(data, data.step);
    return Object.keys(errors).length === 0;
  }, [data]);

  const getStepErrors = useCallback(() => {
    if (data.attemptedStepValidation !== data.step) {
      return {};
    }
    return validateStep(data, data.step);
  }, [data]);

  const maxSteps = getMaxSteps(data.userType);

  return {
    data,
    dispatch,
    maxSteps,
    reset,
    updateField,
    setUserType,
    setStep,
    goToNextStep,
    goToPreviousStep,
    validateCurrentStep,
    getStepErrors,
  };
}
