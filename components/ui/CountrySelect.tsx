'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CountryFlag from '@/components/ui/CountryFlag';
import { allCountries } from '@/data/countries';
import type { Country } from '@/data/countries';

const frequentCodes = ['EC', 'ES', 'US'];

const frequentCountries = frequentCodes
  .map((code) => allCountries.find((c) => c.code === code))
  .filter((c): c is Country => c !== undefined);

const restCountries = allCountries.filter((c) => !frequentCodes.includes(c.code));

interface CountrySelectProperties {
  value: string;
  onChange: (countryName: string, prefix: string) => void;
  error?: string;
}

export default function CountrySelect({ value, onChange, error }: CountrySelectProperties) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerReference = useRef<HTMLDivElement>(null);
  const searchInputReference = useRef<HTMLInputElement>(null);
  const listReference = useRef<HTMLDivElement>(null);

  const selectedCountry = allCountries.find((c) => c.name === value);

  const filteredFrequent = useMemo(
    () =>
      frequentCountries.filter(
        (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.prefix.includes(search)
      ),
    [search]
  );

  const filteredRest = useMemo(
    () =>
      restCountries.filter(
        (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.prefix.includes(search)
      ),
    [search]
  );

  const allFiltered = useMemo(
    () => [...filteredFrequent, ...filteredRest],
    [filteredFrequent, filteredRest]
  );

  const selectCountry = useCallback(
    (country: Country) => {
      onChange(country.name, country.prefix);
      setIsOpen(false);
      setSearch('');
      setHighlightIndex(0);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === 'Enter' || event.key === 'ArrowDown') {
          event.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightIndex((previous) => Math.min(previous + 1, allFiltered.length - 1));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightIndex((previous) => Math.max(previous - 1, 0));
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (allFiltered[highlightIndex]) {
          selectCountry(allFiltered[highlightIndex]);
        }
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        setSearch('');
      }
    },
    [isOpen, allFiltered, highlightIndex, selectCountry]
  );

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setHighlightIndex(0);
  }, []);

  useEffect(() => {
    if (isOpen) {
      searchInputReference.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerReference.current &&
        !containerReference.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (listReference.current && isOpen) {
      const items = listReference.current.children;
      if (items[highlightIndex]) {
        items[highlightIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIndex, isOpen]);

  return (
    <div
      ref={containerReference}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center gap-2 rounded-xl border-2 bg-white px-4 py-3.5 text-sm transition-all ${
          isOpen
            ? 'border-utpl-blue ring-2 ring-utpl-blue/10'
            : error
              ? 'border-red-300 bg-red-50/50 ring-1 ring-red-200'
              : 'border-utpl-border hover:border-utpl-blue/40'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedCountry && <CountryFlag code={selectedCountry.code} />}
        <span className={selectedCountry ? 'font-semibold text-utpl-text' : 'text-gray-300'}>
          {selectedCountry ? selectedCountry.name : 'Selecciona tu país'}
        </span>
        <ChevronDown
          className={`ml-auto h-4 w-4 shrink-0 text-utpl-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center border-b border-slate-100 px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 text-utpl-muted" />
              <input
                ref={searchInputReference}
                type="text"
                value={search}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Buscar país..."
                className="flex-1 bg-transparent py-1 text-sm text-utpl-text outline-none placeholder:text-gray-300"
              />
            </div>

            <div
              ref={listReference}
              className="max-h-64 overflow-y-auto"
              role="listbox"
            >
              {filteredFrequent.length > 0 && (
                <>
                  <div className="sticky top-0 z-10 bg-slate-50 px-4 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-utpl-muted">
                      ★ Frecuentes en UTPL
                    </span>
                  </div>
                  {filteredFrequent.map((country, index) => {
                    const isSelected = country.name === value;
                    const isHighlighted = index === highlightIndex;
                    return (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => selectCountry(country)}
                        onMouseEnter={() => setHighlightIndex(index)}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                          isHighlighted ? 'bg-utpl-surface' : ''
                        } ${isSelected ? 'bg-emerald-50' : ''}`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <CountryFlag code={country.code} />
                        <span className="font-medium text-utpl-text">{country.name}</span>
                        {isSelected && (
                          <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {filteredRest.length > 0 && (
                <>
                  <div className="sticky top-0 z-10 bg-slate-50 px-4 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-utpl-muted">
                      Todos los países
                    </span>
                  </div>
                  {filteredRest.map((country, index) => {
                    const globalIndex = filteredFrequent.length + index;
                    const isSelected = country.name === value;
                    const isHighlighted = globalIndex === highlightIndex;
                    return (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => selectCountry(country)}
                        onMouseEnter={() => setHighlightIndex(globalIndex)}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                          isHighlighted ? 'bg-utpl-surface' : ''
                        } ${isSelected ? 'bg-emerald-50' : ''}`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <CountryFlag code={country.code} />
                        <span className="font-medium text-utpl-text">{country.name}</span>
                        {isSelected && (
                          <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {allFiltered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-utpl-muted">
                  No se encontraron países
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
