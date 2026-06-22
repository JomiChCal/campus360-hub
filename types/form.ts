export type UserType = 'estudiante' | 'aspirante' | null;

export type ServiceResult = 'GUIA' | 'TURNO';

export type Modalidad = 'En línea' | 'Distancia' | 'Presencial';

export type RequirementType = 'queja' | 'soporte' | 'informacion' | null;

export type FlowState =
  | 'guide-shown'
  | 'needs-advisor'
  | 'turno-assigned'
  | 'completed'
  | 'fuera-horario';

export type ServiceMode = 'turno' | 'fuera-horario';

export interface ServiceCategory {
  id: string;
  title: string;
  services: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  label: string;
  result: ServiceResult;
  generatesOficio?: boolean;
}

export interface FormData {
  step: number;
  userType: UserType;
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  modalidad: Modalidad | '';
  pais: string;
  prefijoTelefonico: string;
  telefono: string;
  selectedCategoryId: string | null;
  selectedCategoryTitle: string;
  selectedServiceId: string | null;
  requirementType: RequirementType;
  freeText: string;
  acceptedPrivacy: boolean;
  acceptedPolicies: boolean;
  flowState: FlowState;
  turnoNumber: string | null;
  zoomLink: string | null;
  webZoomLink: string | null;
  attemptedStepValidation: number | null;
}

export interface ValidationErrors {
  userType?: string;
  nombres?: string;
  apellidos?: string;
  cedula?: string;
  email?: string;
  modalidad?: string;
  telefono?: string;
  acceptedPrivacy?: string;
  acceptedPolicies?: string;
  selectedCategoryId?: string;
  requirementType?: string;
  freeText?: string;
}

export type FormAction =
  | { type: 'HYDRATE_FROM_STORAGE'; data: FormData }
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_USER_TYPE'; userType: UserType }
  | { type: 'SET_FIELD'; field: keyof FormData; value: string }
  | { type: 'SET_MODALIDAD'; modalidad: Modalidad }
  | { type: 'SET_SELECTED_CATEGORY'; categoryId: string; categoryTitle: string }
  | { type: 'SET_SELECTED_SERVICE'; serviceId: string }
  | { type: 'SET_REQUIREMENT_TYPE'; requirementType: RequirementType }
  | { type: 'SET_FREE_TEXT'; text: string }
  | { type: 'SET_ACCEPTED_PRIVACY'; accepted: boolean }
  | { type: 'SET_ACCEPTED_POLICIES'; accepted: boolean }
  | { type: 'SET_FLOW_STATE'; flowState: FlowState }
  | { type: 'SET_TURNO_NUMBER'; turnoNumber: string }
  | { type: 'SET_ZOOM_LINKS'; zoomLink: string; webZoomLink: string }
  | { type: 'ATTEMPT_VALIDATION'; step: number }
  | { type: 'CLEAR_VALIDATION_ATTEMPT' }
  | { type: 'RESET' };
