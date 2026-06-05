'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  ExternalLink,
  Handshake,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

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
        <section className="relative z-10 pb-6 pt-16 text-center">
          <div className="mx-auto max-w-3xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-display text-[52px] font-extrabold leading-[1] tracking-tight text-white">
                decide ser{' '}
                <span className="text-utpl-gold">+</span>
              </h1>
            </motion.div>
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
                {isLunch ? 'Pausa temporal — volvemos a las 15:00' : 'Fuera de horario'}
              </span>
            </motion.div>
          </div>
        </section>
      </div>

      <main className="relative z-10 mx-auto flex w-full flex-1 max-w-3xl flex-col px-4 py-8">
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="rounded-xl border-l-4 border-l-utpl-gold bg-white px-6 py-7 shadow-md sm:px-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-utpl-surface">
                <Handshake className="h-6 w-6 text-utpl-blue" />
              </div>
              <div className="space-y-3 text-base leading-relaxed text-utpl-text">
                <p>
                  💙💛 Gracias por contactarse con la UTPL. Es un gusto atenderle{' '}
                  <span role="img" aria-label="apretón de manos">🤝</span>.
                  Le informamos que nuestro horario de atención está próximo a finalizar.
                </p>
                <p>
                  Pero no se preocupe: <span role="img" aria-label="bandeja de entrada">📩</span>{' '}
                  su consulta quedará registrada y será retomada por nuestro equipo el siguiente
                  día hábil a partir de las 08:00, sin necesidad de que vuelva a escribirnos,
                  para brindarle toda la información adicional que requiera.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-white px-6 py-7 shadow-md sm:px-8"
          >
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-utpl-muted">
                Horario
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center transition-shadow hover:border-utpl-gold/30 hover:shadow-md">
                <div className="mb-2 flex items-center justify-center gap-1.5">
                  <Sun className="h-4 w-4 text-utpl-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-utpl-muted">
                    Mañana
                  </span>
                </div>
                <p className="text-lg font-black tracking-tight text-utpl-blue sm:text-xl">
                  08:00 — 13:00
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center transition-shadow hover:border-utpl-gold/30 hover:shadow-md">
                <div className="mb-2 flex items-center justify-center gap-1.5">
                  <Moon className="h-4 w-4 text-utpl-blue" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-utpl-muted">
                    Tarde
                  </span>
                </div>
                <p className="text-lg font-black tracking-tight text-utpl-blue sm:text-xl">
                  15:00 — 18:00
                </p>
              </div>
            </div>

            <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-wider text-utpl-muted">
              Lunes a viernes | Sábados: 09:00 - 14:00
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-white px-6 py-7 shadow-md sm:px-8"
          >
            <div className="text-center text-sm leading-relaxed text-utpl-muted">
              <p>
                Agradecemos su comprensión y quedamos atentos para brindarle una atención oportuna.
              </p>
            </div>

            <div className="mt-4 flex justify-center">
              <a
                href="https://forms.office.com/r/q4pCSrHhGB"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-utpl-surface px-5 py-2.5 text-sm font-semibold text-utpl-blue transition-colors hover:bg-utpl-gold/20 hover:text-utpl-navy focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Completar datos en formulario alternativo
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </motion.div>

          {!isLunch && (
            <motion.div
              variants={itemVariants}
              className="rounded-xl bg-white px-6 py-7 shadow-md sm:px-8"
            >
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-utpl-surface">
                  <Phone className="h-4 w-4 text-utpl-blue" />
                </div>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="mt-5 text-center text-base font-bold text-utpl-blue">
                ¿Te llamamos nosotros?
              </p>
              <p className="mt-1 text-center text-sm text-utpl-muted">
                Deja tus datos y un asesor te contactará el siguiente día hábil.
              </p>

              <div className="mt-5 flex justify-center">
                <motion.button
                  type="button"
                  onClick={() => setShowTimeModal(true)}
                  aria-label="Agendar una llamada con un asesor"
                  className="inline-flex items-center gap-2 rounded-xl bg-utpl-blue px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-utpl-blue-hover focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Calendar className="h-4 w-4" />
                  Agendar llamada
                </motion.button>
              </div>
            </motion.div>
          )}

          <motion.p
            variants={itemVariants}
            className="text-center text-xs font-bold tracking-wider text-utpl-blue"
          >
            ¡UTPL decide ser MÁS!
          </motion.p>
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
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-utpl-surface shadow-sm">
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
                      isSelected ? 'bg-white/20' : 'bg-utpl-surface'
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
