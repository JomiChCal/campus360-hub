'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, Moon, Phone, Sun } from 'lucide-react';
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

      <main className="relative z-10 flex flex-1 items-center justify-center overflow-hidden px-4 py-4 sm:py-6 lg:py-8">
        <motion.div
          className="w-full max-w-xl md:max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="relative rounded-3xl bg-gradient-to-br from-[#004270]/40 via-[#febe10]/10 to-[#004270]/20 p-[1.5px] shadow-xl shadow-slate-900/10"
          >
            <div className="flex flex-col justify-center bg-white rounded-[calc(1.5rem-1.5px)] p-6 sm:p-8">
            <div className="mb-4 text-center">
              <h1 className="text-3xl font-black tracking-tight text-utpl-blue sm:text-5xl">
                decide ser <span className="text-utpl-gold">+</span>
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-utpl-muted">
                Centro de atención UTPL
              </p>
            </div>

            <motion.div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-utpl-surface"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {isLunch ? (
                <Sun className="h-7 w-7 text-utpl-gold" />
              ) : (
                <Moon className="h-7 w-7 text-utpl-blue" />
              )}
            </motion.div>

            <h2 className="text-center text-2xl font-black text-utpl-blue sm:text-3xl">
              {isLunch ? 'Pausa temporal' : 'Fuera de horario'}
            </h2>
            <p className="mt-2 text-center text-sm text-utpl-muted">
              {isLunch
                ? 'Volvemos a las 15:00'
                : 'Nuestro horario de atención ha finalizado por hoy.'}
            </p>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-utpl-muted">
                Horario
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-center gap-1.5">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-utpl-muted">
                    Mañana
                  </span>
                </div>
                <p className="text-lg font-black tracking-tight text-utpl-blue sm:text-xl">
                  08:00 — 13:00
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-center gap-1.5">
                  <Moon className="h-4 w-4 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-utpl-muted">
                    Tarde
                  </span>
                </div>
                <p className="text-lg font-black tracking-tight text-utpl-blue sm:text-xl">
                  15:00 — 18:00
                </p>
              </motion.div>
            </div>

            <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-wider text-utpl-muted">
              Lunes a Viernes
            </p>

            {!isLunch && (
              <motion.div variants={itemVariants}>
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-utpl-surface">
                    <Phone className="h-4 w-4 text-utpl-blue" />
                  </div>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <p className="text-center text-base font-bold text-utpl-blue">
                  ¿Te llamamos nosotros?
                </p>
                <p className="mt-1 text-center text-sm text-utpl-muted">
                  Deja tus datos y un asesor te contactará.
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
            </div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="relative z-10 shrink-0 bg-slate-900 py-4 text-center">
        <p className="text-xs text-slate-500">
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
              <p className="text-sm text-utpl-muted">Un asesor te llamará en esa franja</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-utpl-muted">
            Un asesor se contactará contigo en el horario que selecciones, el siguiente día laboral
            o en días posteriores según la demanda.
          </p>

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
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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
            {selectedContactTime ? (
              <span className="flex items-center justify-center gap-2">
                Confirmar:{' '}
                {CONTACT_TIME_OPTIONS.find((o) => o.value === selectedContactTime)?.label}
              </span>
            ) : (
              'Selecciona un horario'
            )}
          </motion.button>
        </div>
      </Modal>
      <MobileWarningModal />
    </div>
  );
}
