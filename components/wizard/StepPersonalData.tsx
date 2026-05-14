'use client';

import { ArrowLeft, CreditCard, Mail, Phone, Search, User } from 'lucide-react';

import CountrySelect from '@/components/ui/CountrySelect';
import InputField from '@/components/ui/InputField';
import PrefixSelect from '@/components/ui/PrefixSelect';
import Select from '@/components/ui/Select';
import { useFormContext } from '@/contexts/FormContext';
import { getCountryByName } from '@/data/countries';

const modalidadOptions = [
  { label: 'En línea', value: 'En línea' },
  { label: 'Distancia', value: 'Distancia' },
  { label: 'Presencial', value: 'Presencial' },
];

interface StepPersonalDataProperties {
  onPrev: () => void;
}

export default function StepPersonalData({ onPrev }: StepPersonalDataProperties) {
  const { data, errors, updateField, dispatch } = useFormContext();

  const handleCountryChange = (countryName: string, prefix: string) => {
    updateField('pais', countryName);
    updateField('prefijoTelefonico', prefix);
  };

  const country = getCountryByName(data.pais);
  const phoneMaxLength = country?.phoneDigits?.[0] ?? 15;

  return (
    <div>
      <h2 className="mb-2 text-center text-2xl font-bold text-utpl-text">Datos Personales</h2>
      <p className="mb-6 text-center text-sm text-utpl-muted">
        Ingresa tu información para continuar
      </p>
      <button
        type="button"
        onClick={onPrev}
        className="mb-5 flex items-center gap-1 text-sm font-medium text-utpl-muted underline underline-offset-2 transition-colors hover:text-utpl-blue focus-visible:outline-none focus-visible:text-utpl-blue"
      >
        <ArrowLeft className="h-4 w-4" />
        Cambiar tipo de usuario
      </button>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Nombres completos"
            icon={User}
            value={data.nombres}
            onChange={(v) => updateField('nombres', v)}
            placeholder="Juan Carlos"
            error={errors.nombres}
            isValid={data.nombres.trim().length > 0}
          />
          <InputField
            label="Apellidos completos"
            icon={User}
            value={data.apellidos}
            onChange={(v) => updateField('apellidos', v)}
            placeholder="Pérez Rodríguez"
            error={errors.apellidos}
            isValid={data.apellidos.trim().length > 0}
          />
        </div>

        <InputField
          label="Correo electrónico"
          icon={Mail}
          value={data.email}
          onChange={(v) => updateField('email', v)}
          placeholder="nombre@ejemplo.com"
          type="email"
          error={errors.email}
          isValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Número de cédula"
            icon={CreditCard}
            value={data.cedula}
            onChange={(v) => updateField('cedula', v.replaceAll(/\D/g, ''))}
            placeholder="1101234567"
            inputMode="numeric"
            maxLength={10}
            error={errors.cedula}
            isValid={/^\d{10}$/.test(data.cedula)}
          />
          <div>
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-utpl-text">
              <Search className="h-4 w-4 text-utpl-muted" />
              País de residencia
            </span>
            <CountrySelect
              value={data.pais}
              onChange={handleCountryChange}
            />
          </div>
        </div>

        <div>
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-utpl-text">
            <Phone className="h-4 w-4 text-utpl-muted" />
            Número de teléfono
          </span>
          <div className="flex gap-2">
            <PrefixSelect
              value={data.prefijoTelefonico ?? '+593'}
              onChange={(v) => updateField('prefijoTelefonico', v)}
            />
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                value={data.telefono}
                onChange={(event) =>
                  updateField(
                    'telefono',
                    event.target.value.replaceAll(/[^\d\s\-()]/g, '').slice(0, phoneMaxLength)
                  )
                }
                placeholder="0991234567"
                maxLength={phoneMaxLength}
                className={`w-full rounded-xl border-2 px-4 py-3.5 text-sm text-utpl-text outline-none transition-all ${
                  errors.telefono
                    ? 'border-red-300 bg-red-50/50 ring-1 ring-red-200'
                    : 'border-utpl-border hover:border-utpl-blue/40 focus:border-utpl-blue focus:ring-2 focus:ring-utpl-blue/10'
                } placeholder:text-gray-300`}
              />
            </div>
          </div>
          {errors.telefono && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{errors.telefono}</p>
          )}
        </div>

        {data.userType === 'estudiante' && (
          <div>
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-utpl-text">
              <Search className="h-3.5 w-3.5 text-utpl-muted" />
              Modalidad de estudio
            </span>
            <Select
              value={data.modalidad}
              onChange={(v) =>
                dispatch({
                  type: 'SET_MODALIDAD',
                  modalidad: v as 'En línea' | 'Distancia' | 'Presencial',
                })
              }
              options={modalidadOptions}
              placeholder="Selecciona tu modalidad"
              error={errors.modalidad}
            />
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <label className="flex cursor-pointer items-start gap-3 focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 rounded-xl">
            <input
              type="checkbox"
              checked={data.acceptedPrivacy}
              onChange={(event) =>
                dispatch({ type: 'SET_ACCEPTED_PRIVACY', accepted: event.target.checked })
              }
              className="accent-utpl-blue mt-0.5 h-5 w-5 rounded border-gray-300 focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2"
            />
            <span className="text-sm leading-relaxed text-utpl-text">
              Al enviar el presente formulario, autorizo en forma expresa a la UTPL, para realizar
              el tratamiento de mis datos personales con la finalidad de contactarme y brindarme
              asesoría sobre sus servicios. Para más información, consulta nuestra política de
              privacidad en:{' '}
              <a
                href="https://www.utpl.edu.ec/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-utpl-blue underline hover:text-utpl-blue-hover"
              >
                utpl.edu.ec/privacidad
              </a>
            </span>
          </label>
          {errors.acceptedPrivacy && (
            <p className="mt-2 text-xs font-medium text-red-500">{errors.acceptedPrivacy}</p>
          )}
        </div>
      </div>
    </div>
  );
}
