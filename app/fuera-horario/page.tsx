'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  Moon,
  Phone,
  Sun,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import MobileWarningModal from '@/components/MobileWarningModal';
import Modal from '@/components/Modal';
import PageHeader from '@/components/PageHeader';
import { CONTACT_TIME_OPTIONS, getBusinessHoursState } from '@/lib/business-hours';

export default function FueraHorarioPage() {
  const router = useRouter();
  const state = getBusinessHoursState();
  const isLunch = state === 'lunch';
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedContactTime, setSelectedContactTime] = useState('');

  const handleConfirm = () => {
    if (!selectedContactTime) return;
    setShowTimeModal(false);
    router.push(`/tipo?mode=fuera-horario&time=${encodeURIComponent(selectedContactTime)}`);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader />

      <div className="bg-utpl-navy">
        <section className="relative z-10 overflow-hidden pb-6 pt-16 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <motion.h1
              className="font-display text-[52px] font-extrabold leading-[1] tracking-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              decide ser{' '}
              <span className="text-utpl-gold">+</span>
            </motion.h1>
          </div>
        </section>

        <section className="relative z-10 bg-utpl-gold py-2.5 text-center">
          <p className="font-display text-[11px] font-extrabold uppercase tracking-[3px] text-utpl-navy">
            Centro de Atención UTPL
          </p>
        </section>

        <section className="relative z-10 bg-utpl-navy-medium py-4">
          <div className="mx-auto max-w-3xl px-4">
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isLunch ? (
                <Sun className="h-5 w-5 text-utpl-gold" />
              ) : (
                <Moon className="h-5 w-5 text-utpl-gold" />
              )}
              <span className="text-sm font-semibold tracking-wide text-white">
                {isLunch ? 'Pausa temporal — volvemos a las 15:00' : 'Horario finalizado'}
              </span>
            </motion.div>
          </div>
        </section>
      </div>

      <main className="relative z-10 mx-auto flex w-full flex-1 items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-2xl bg-white px-10 py-12 shadow-lg sm:px-14 sm:py-16">
            <div className="space-y-10">
              <div className="text-center">
                <div className="mb-6 flex justify-center gap-3">
                  <span className="text-4xl" role="img" aria-label="corazón azul">💙</span>
                  <span className="text-4xl" role="img" aria-label="corazón amarillo">💛</span>
                </div>

                <h2 className="font-display text-3xl font-extrabold leading-tight text-utpl-navy sm:text-4xl">
                  Gracias por contactarte
                  <br />
                  con la UTPL
                </h2>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-xl" role="img" aria-label="mano">🤝</span>
                  <span className="font-display text-lg font-bold text-utpl-navy">
                    Es un gusto atenderte
                  </span>
                </div>
              </div>

              <div className="space-y-5 text-center text-base leading-relaxed text-utpl-text">
                <p>
                  Nuestro horario de atención ha finalizado por hoy. Pero no te preocupes:{' '}
                  <span className="font-semibold text-utpl-blue">tu consulta quedó registrada</span>{' '}
                  y será retomada por nuestro equipo el siguiente día hábil a partir de las 08:00.
                </p>
                <p className="text-sm text-utpl-muted">
                  No necesitas volver a escribirnos, te brindaremos toda la información adicional
                  que requieras en ese momento.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-6 py-5">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-utpl-text">
                    <Sun className="h-4 w-4 text-amber-500" />
                    Lun-Vie 08:00 — 13:00
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-utpl-text">
                    <Moon className="h-4 w-4 text-blue-500" />
                    Lun-Vie 15:00 — 18:00
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-utpl-text">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    Sáb 09:00 — 14:00
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <a
                  href="https://forms.office.com/r/q4pCSrHhGB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-utpl-blue underline decoration-utpl-blue/30 underline-offset-4 transition-colors hover:text-utpl-blue-hover"
                >
                  Completar datos en formulario alternativo
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                {!isLunch && (
                  <div className="flex flex-col items-center gap-3 pt-2">
                    <div className="h-px w-32 bg-slate-200" />
                    <p className="text-center text-sm font-semibold text-utpl-text">
                      ¿Prefieres que te llamemos?
                    </p>
                    <motion.button
                      type="button"
                      onClick={() => setShowTimeModal(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-utpl-blue px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-utpl-blue-hover hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Phone className="h-4 w-4" />
                      Agendar llamada
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="pt-2 text-center">
                <p className="text-sm leading-relaxed text-utpl-muted">
                  Agradecemos tu comprensión y quedamos atentos para brindarte una atención
                  oportuna.
                </p>
                <p className="mt-4 font-display text-xl font-extrabold tracking-tight text-utpl-navy">
                  ¡UTPL decide ser MÁS!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 shrink-0 bg-utpl-navy py-5 text-center">
        <p className="text-xs tracking-wider text-white/50">
          &copy; {new Date().getFullYear()} Universidad Técnica Particular de Loja
        </p>
      </footer>

      <Modal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        hideTitle
        maxWidth="max-w-lg"
      >
        <div className="space-y-6 py-2">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 shadow-sm">
              <Clock className="h-7 w-7 text-utpl-blue" />
            </div>
            <div>
              <h3 className="text-xl font-black text-utpl-text">Elige tu horario</h3>
              <p className="text-sm text-utpl-muted">
                Un asesor te llamará en esa franja el siguiente día hábil.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CONTACT_TIME_OPTIONS.map((option) => {
              const isMorning = Number.parseInt(option.value) < 13;
              const isSelected = selectedContactTime === option.value;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedContactTime(option.value)}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none ${
                    isSelected
                      ? 'border-utpl-blue bg-utpl-blue text-white shadow-lg shadow-utpl-blue/20'
                      : 'border-slate-200 bg-white text-utpl-text hover:border-utpl-blue/40 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                  {isSelected && (
                    <motion.div
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-utpl-gold text-utpl-blue"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            type="button"
            disabled={!selectedContactTime}
            onClick={handleConfirm}
            className="w-full rounded-xl bg-utpl-blue px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-utpl-blue-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
            whileHover={selectedContactTime ? { scale: 1.01 } : undefined}
            whileTap={selectedContactTime ? { scale: 0.99 } : undefined}
          >
            {selectedContactTime
              ? `Confirmar: ${CONTACT_TIME_OPTIONS.find((o) => o.value === selectedContactTime)?.label}`
              : 'Selecciona un horario'}
          </motion.button>
        </div>
      </Modal>
      <MobileWarningModal />
    </div>
  );
}
