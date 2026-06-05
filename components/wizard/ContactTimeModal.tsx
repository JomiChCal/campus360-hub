'use client';

import { Clock, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

import { CONTACT_TIME_OPTIONS } from '@/lib/business-hours';
import Modal from '@/components/Modal';

interface ContactTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
}

export default function ContactTimeModal({ isOpen, onClose, onConfirm }: ContactTimeModalProps) {
  const [selected, setSelected] = useState('');

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideTitle maxWidth="max-w-lg">
      <div className="space-y-5 py-2">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-utpl-surface shadow-sm">
            <Clock className="h-7 w-7 text-utpl-blue" />
          </div>
          <div>
            <h3 className="text-xl font-black text-utpl-text">Elige tu horario</h3>
            <p className="text-sm text-utpl-muted">
              Hemos superado nuestro horario de atención. Un asesor te contactará en tu franja
              elegida, el siguiente día hábil.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CONTACT_TIME_OPTIONS.map((option) => {
            const isMorning = Number.parseInt(option.value) < 13;
            const isSelected = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelected(option.value)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none ${
                  isSelected
                    ? 'border-utpl-blue bg-utpl-blue text-white shadow-lg shadow-utpl-blue/20'
                    : 'border-slate-200 bg-white text-utpl-text hover:border-utpl-blue/40 hover:shadow-md'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isSelected ? 'bg-white/20' : 'bg-utpl-surface'
                  }`}
                >
                  {isMorning ? (
                    <Sun className={`h-5 w-5 ${isSelected ? 'text-utpl-gold' : 'text-amber-500'}`} />
                  ) : (
                    <Moon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-utpl-blue'}`} />
                  )}
                </div>
                <span className="text-sm font-bold">{option.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selected}
          onClick={handleConfirm}
          className="w-full rounded-xl bg-utpl-blue px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-utpl-blue-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {selected
            ? `Confirmar: ${CONTACT_TIME_OPTIONS.find((o) => o.value === selected)?.label}`
            : 'Selecciona un horario'}
        </button>
      </div>
    </Modal>
  );
}
