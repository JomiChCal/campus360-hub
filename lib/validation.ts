import { getCountryByName } from '@/data/countries';
import type { FormData, ValidationErrors } from '@/types/form';

export function validateStep(data: FormData, step: number): ValidationErrors {
  const newErrors: ValidationErrors = {};

  if (step === 2) {
    if (!data.nombres.trim()) newErrors.nombres = 'Ingresa tus nombres completos';
    if (!data.apellidos.trim()) newErrors.apellidos = 'Ingresa tus apellidos completos';
    if (!/^\d{10}$/.test(data.cedula)) newErrors.cedula = 'La cédula debe tener 10 dígitos';

    if (!data.acceptedPrivacy) {
      newErrors.acceptedPrivacy = 'Debes aceptar la política de privacidad';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }
    if (data.userType === 'estudiante' && !data.modalidad) {
      newErrors.modalidad = 'Selecciona tu modalidad de estudio';
    }

    const phoneDigits = data.telefono.replaceAll(/\D/g, '');
    if (phoneDigits.length > 0) {
      const country = getCountryByName(data.pais);
      const expectedLengths = country?.phoneDigits ?? null;

      if (expectedLengths) {
        if (!expectedLengths.includes(phoneDigits.length)) {
          const expected = expectedLengths.join(' o ');
          newErrors.telefono = `En ${data.pais} el teléfono debe tener ${expected} dígitos`;
        }
      } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        newErrors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos';
      }
    }
  }

  return newErrors;
}

export function isValidStep(data: FormData, step: number): boolean {
  const errors = validateStep(data, step);
  return Object.keys(errors).length === 0;
}
