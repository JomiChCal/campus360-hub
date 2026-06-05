'use client';

import { motion } from 'framer-motion';
import {
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
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
        <section className="relative z-10 overflow-hidden pb-6 pt-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,200,66,0.08),transparent_70%)]" />
          <div className="relative mx-auto max-w-3xl px-4">
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

      <main className="relative z-10 mx-auto flex w-full flex-1 max-w-3xl flex-col px-4 py-10">
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-utpl-navy to-[#0a2550] px-8 py-10 shadow-xl sm:px-12"
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-utpl-gold/10 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-utpl-gold/5 blur-xl" />

            <div className="relative">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-3xl" role="img" aria-label="corazones">💙💛</span>
              </div>

              <h2 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Gracias por contactarse
                <br />
                con la UTPL
              </h2>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg">🤝</span>
                <span className="font-display text-lg font-bold text-utpl-gold">
                  Es un gusto atenderle
                </span>
              </div>

              <div className="mt-6 h-px w-16 bg-utpl-gold/40" />

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80">
                Le informamos que nuestro horario de atención está próximo a finalizar.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-2xl border-l-4 border-l-utpl-gold bg-white px-8 py-7 shadow-lg sm:px-10"
          >
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-utpl-gold/10">
                <span className="text-2xl" role="img" aria-label="bandeja">📩</span>
              </div>
              <div className="space-y-3">
                <p className="text-base leading-relaxed text-utpl-text">
                  Pero no se preocupe: su consulta{' '}
                  <span className="font-bold text-utpl-gold">quedará registrada</span> y será
                  retomada por nuestro equipo el{' '}
                  <span className="font-bold text-utpl-gold">siguiente día hábil a partir de las
                  08:00</span>, sin necesidad de que vuelva a escribirnos, para brindarle toda la
                  información adicional que requiera.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-utpl-surface px-4 py-2">
                  <Clock className="h-4 w-4 text-utpl-blue" />
                  <span className="text-xs font-bold tracking-wide text-utpl-blue">
                    Retomamos: siguiente día hábil desde las 08:00
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-white px-8 py-7 shadow-lg sm:px-10"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-utpl-gold" />
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-utpl-navy">
                Horario de atención
              </h3>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
                <Sun className="h-4 w-4 text-utpl-gold" />
                <span className="text-sm font-semibold text-utpl-text">
                  Lun - Vie: <span className="font-black text-utpl-blue">08:00 — 13:00</span>
                </span>
              </div>
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
                <Moon className="h-4 w-4 text-utpl-blue" />
                <span className="text-sm font-semibold text-utpl-text">
                  Lun - Vie: <span className="font-black text-utpl-blue">15:00 — 18:00</span>
                </span>
              </div>
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
                <Calendar className="h-4 w-4 text-utpl-gold" />
                <span className="text-sm font-semibold text-utpl-text">
                  Sáb: <span className="font-black text-utpl-blue">09:00 — 14:00</span>
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-utpl-surface px-5 py-4">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-sm leading-relaxed text-utpl-muted">
                  Por favor, te solicitamos completar tus datos en el siguiente enlace:
                </p>
                <a
                  href="https://forms.office.com/r/q4pCSrHhGB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-utpl-blue/20 bg-white px-5 py-2.5 text-sm font-bold text-utpl-blue transition-all hover:border-utpl-blue/40 hover:bg-utpl-blue hover:text-white focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Formulario alternativo
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>

          {!isLunch && (
            <motion.div
              variants={itemVariants}
              className="rounded-2xl bg-white px-8 py-7 shadow-lg sm:px-10"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-utpl-surface">
                  <Phone className="h-7 w-7 text-utpl-blue" />
                </div>

                <h3 className="mt-4 text-xl font-black text-utpl-blue">
                  ¿Te llamamos nosotros?
                </h3>
                <p className="mt-1 text-sm text-utpl-muted">
                  Deja tus datos y un asesor te contactará el siguiente día hábil.
                </p>

                <motion.button
                  type="button"
                  onClick={() => setShowTimeModal(true)}
                  aria-label="Agendar una llamada con un asesor"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-utpl-blue px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-utpl-blue-hover hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Calendar className="h-4 w-4" />
                  Agendar llamada
                </motion.button>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <p className="text-sm leading-relaxed text-utpl-muted">
              Agradecemos su comprensión y quedamos atentos para brindarle una atención oportuna.
            </p>
            <p className="mt-4 font-display text-lg font-extrabold tracking-tight text-utpl-blue">
              ¡UTPL decide ser MÁS!
            </p>
          </motion.div>
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
