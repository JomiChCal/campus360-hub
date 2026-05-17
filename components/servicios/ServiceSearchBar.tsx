'use client';

import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ServiceSearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-utpl-muted" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar …"
        className="h-11 border-utpl-border bg-white pl-10 text-base shadow-sm"
      />
    </div>
  );
}
