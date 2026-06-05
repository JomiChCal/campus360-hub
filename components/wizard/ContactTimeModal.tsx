'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ExternalLink, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CONTACT_TIME_OPTIONS } from '@/lib/business-hours';

interface ContactTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
}

export default function ContactTimeModal({ isOpen, onClose, onConfirm }: ContactTimeModalProps) {
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSelected('');
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            className="fixed inset-0 cursor-pointer bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            tabIndex={-1}
            aria-label="Cerrar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="overflow-y-auto rounded-2xl">
              <div className="bg-gradient-to-br from-utpl-navy to-[#0a2550] px-8 py-10 text-center sm:px-10">
                <div className="mb-4 flex justify-center gap-3">
                  <span className="text-3xl" role="img" aria-label="corazón azul">💙</span>
                  <span className="text-3xl" role="img" aria-label="corazón amarillo">💛</span>
                </div>

                <h2 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                  Gracias por contactarte
                  <br />
                  con la UTPL
                </h2>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-lg" role="img" aria-label="mano">🤝</span>
                  <span className="font-display text-base font-bold text-utpl-gold">
                    Es un gusto atenderte
                  </span>
                </div>

                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/80">
                  Te informamos que nuestro horario de atención está próximo a finalizar.
                </p>
              </div>

              <div className="space-y-6 px-8 py-7 sm:px-10">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 text-xl" role="img" aria-label="bandeja">📩</span>
                  <p className="text-sm leading-relaxed text-utpl-text">
                    Pero no te preocupes:{' '}
                    <span className="font-semibold text-utpl-blue">tu consulta quedará
                    registrada</span> y será retomada por nuestro equipo el siguiente día hábil a
                    partir de las 08:00, sin necesidad de que vuelvas a escribirnos, para brindarte
                    toda la información adicional que requieras.
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <span className="mt-0.5 text-xl" role="img" aria-label="reloj">🕒</span>
                  <div className="text-sm leading-relaxed text-utpl-text">
                    <p className="font-semibold text-utpl-navy">Te recordamos nuestro horario de atención:</p>
                    <p className="mt-1">Lunes a viernes: 08:00 a 18:00</p>
                    <p>Sábados: 09:00 a 14:00</p>
                  </div>
                </div>

                <a
                  href="https://forms.office.com/r/q4pCSrHhGB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-utpl-blue/20 bg-white px-5 py-2.5 text-sm font-semibold text-utpl-blue transition-all hover:border-utpl-blue/40 hover:bg-utpl-blue hover:text-white"
                >
                  <span className="text-base" role="img" aria-label="clipboard">📋</span>
                  Completar datos en formulario alternativo
                  <ExternalLink className="h-4 w-4" />
                </a>

                <div className="h-px bg-slate-100" />

                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-utpl-navy">
                    <Clock className="h-5 w-5 text-utpl-blue" />
                    Elige tu horario de contacto
                  </h3>
                  <p className="mt-1 text-sm text-utpl-muted">
                    Un asesor te contactará en tu franja elegida el siguiente día hábil.
                  </p>
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
                            isSelected ? 'bg-white/20' : 'bg-slate-50'
                          }`}
                        >
                          {isMorning ? (
                            <Sun
                              className={`h-5 w-5 ${isSelected ? 'text-utpl-gold' : 'text-amber-500'}`}
                            />
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

                <div className="text-center">
                  <p className="text-xs leading-relaxed text-utpl-muted">
                    Agradecemos tu comprensión y quedamos atentos para brindarte una atención
                    oportuna.
                  </p>
                  <p className="mt-3 font-display text-base font-extrabold tracking-tight text-utpl-navy">
                    ¡UTPL decide ser MÁS!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
