'use client';

import Select from '@/components/ui/Select';
import { allCountries } from '@/data/countries';

function buildPrefixOptions() {
  const prefixMap = new Map<string, string>();
  for (const c of allCountries) {
    if (!prefixMap.has(c.prefix)) {
      prefixMap.set(c.prefix, c.code);
    }
  }
  const priorityPrefixes = [
    '+593',
    '+34',
    '+1',
    '+51',
    '+52',
    '+54',
    '+55',
    '+56',
    '+57',
    '+58',
    '+33',
    '+39',
    '+44',
    '+49',
    '+351',
    '+7',
    '+86',
    '+81',
    '+91',
    '+61',
  ];
  const result: { label: string; value: string; code?: string }[] = [];
  for (const prefix of priorityPrefixes) {
    const code = prefixMap.get(prefix);
    result.push({
      label: `${code ?? '  '}    ${prefix}`,
      value: prefix,
      code,
    });
  }
  return result;
}

const prefixOptions = buildPrefixOptions();

interface PrefixSelectProperties {
  value: string;
  onChange: (value: string) => void;
}

export default function PrefixSelect({ value, onChange }: PrefixSelectProperties) {
  const options =
    value && !prefixOptions.some((o) => o.value === value)
      ? [...prefixOptions, { label: value, value }]
      : prefixOptions;

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      className="w-32"
      placeholder="+593"
      renderOption={(option, isSelected) => {
        const country = allCountries.find((c) => c.prefix === option.value);
        return (
          <span className="flex w-full items-center gap-3">
            <span className="w-7 text-xs font-medium text-utpl-muted">{country?.code ?? ''}</span>
            <span className={isSelected ? 'font-semibold text-utpl-blue' : 'text-utpl-text'}>
              {option.value}
            </span>
          </span>
        );
      }}
    />
  );
}
