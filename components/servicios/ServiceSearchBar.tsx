'use client';

import styles from '@/components/servicios/servicios-presentational.module.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ServiceSearchBar({ value, onChange }: Props) {
  return (
    <input
      type="text"
      placeholder="Buscar ..."
      className={`search-service my-4 ${styles.searchInput}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
