'use client';

import { CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface InputFieldProperties {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  inputMode?: 'text' | 'numeric';
  maxLength?: number;
  type?: string;
  isValid?: boolean;
}

export default function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
  inputMode,
  maxLength,
  type = 'text',
  isValid,
}: InputFieldProperties) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-utpl-text">
        <Icon className="h-4 w-4 text-utpl-muted" />
        {label}
      </span>
      <div className="relative">
        <input
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-sm text-utpl-text transition-all outline-none placeholder:text-gray-300 ${
            error
              ? 'border-red-300 bg-red-50/50 ring-1 ring-red-200'
              : isValid
                ? 'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-200'
                : 'border-utpl-border hover:border-utpl-blue/40 focus:border-utpl-blue focus:ring-2 focus:ring-utpl-blue/10'
          }`}
        />
        {isValid && !error && (
          <CheckCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500 animate-pop-check" />
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </label>
  );
}
