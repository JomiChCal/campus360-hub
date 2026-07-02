export type ScheduleMode = 'dual' | 'continuo';

export type BusinessHoursState = 'open' | 'lunch' | 'after-hours' | 'closing-soon';

export type HorarioRow = {
  horaAperturaM: string;
  horaCierreM: string | null;
  horarioAperturaT: string | null;
  horarioCierreT: string;
  modo: ScheduleMode;
  habilitado: boolean;
};

export type ScheduleStore = {
  horarios: Record<string, HorarioRow>;
  updatedAt: string;
};

export type ResolvedSchedule = {
  hasActiveSchedule: boolean;
  titulo?: string;
  horario?: HorarioRow;
  modo?: ScheduleMode;
  /** Perfiles que solo aplican lun–vie (Normal y Extendido). */
  weekdayOnly?: boolean;
  /** Perfil que solo aplica sáb–dom (Fin de Semana). */
  weekendOnly?: boolean;
};

export type ContactTimeOption = {
  value: string;
  label: string;
};

export const TITULO_HORARIO_NORMAL = 'Horario Normal';
export const TITULO_HORARIO_EXTENDIDO = 'Horario Extendido';
export const TITULO_HORARIO_EXTENDIDO_FIN_SEMANA = 'Horario Extendido Fin de Semana';

export const CLOSING_BUFFER_MINUTES = 10;
