'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProperties {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
  renderOption?: (
    option: SelectOption,
    isSelected: boolean,
    isHighlighted: boolean
  ) => React.ReactNode;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  error,
  className = '',
  renderOption,
}: SelectProperties) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerReference = useRef<HTMLDivElement>(null);
  const listReference = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const toggleOpen = useCallback(() => {
    setIsOpen((previous) => {
      if (!previous) setHighlightIndex(0);
      return !previous;
    });
  }, []);

  const selectOption = useCallback(
    (option: SelectOption) => {
      onChange(option.value);
      setIsOpen(false);
      setHighlightIndex(0);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === 'Enter' || event.key === 'ArrowDown' || event.key === ' ') {
          event.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          setHighlightIndex((previous) => Math.min(previous + 1, options.length - 1));
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          setHighlightIndex((previous) => Math.max(previous - 1, 0));
          break;
        }
        case 'Enter':
        case ' ': {
          event.preventDefault();
          if (options[highlightIndex]) {
            selectOption(options[highlightIndex]);
          }
          break;
        }
        case 'Escape': {
          event.preventDefault();
          setIsOpen(false);
          break;
        }
        default: {
          break;
        }
      }
    },
    [isOpen, options, highlightIndex, selectOption]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerReference.current &&
        !containerReference.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
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

  const defaultRenderOption = useCallback(
    (option: SelectOption, isSelected: boolean, _isHighlighted: boolean) => (
      <span className="flex items-center gap-2">
        <span className={isSelected ? 'font-semibold text-utpl-blue' : 'text-utpl-text'}>
          {option.label}
        </span>
        {isSelected && <Check className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />}
      </span>
    ),
    []
  );

  return (
    <div
      ref={containerReference}
      className={`relative ${className}`}
    >
      <button
        type="button"
        onClick={toggleOpen}
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
        <span className={`flex-1 text-left ${selectedOption ? 'text-utpl-text' : 'text-gray-300'}`}>
          {selectedOption
            ? renderOption
              ? renderOption(selectedOption, true, false)
              : defaultRenderOption(selectedOption, true, false)
            : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-utpl-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
            <div
              ref={listReference}
              className="max-h-64 overflow-y-auto"
              role="listbox"
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightIndex;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => setHighlightIndex(index)}
                    className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${
                      isHighlighted ? 'bg-utpl-surface' : ''
                    } ${isSelected ? 'bg-emerald-50' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {renderOption
                      ? renderOption(option, isSelected, isHighlighted)
                      : defaultRenderOption(option, isSelected, isHighlighted)}
                  </button>
                );
              })}
              {options.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-utpl-muted">Sin resultados</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
