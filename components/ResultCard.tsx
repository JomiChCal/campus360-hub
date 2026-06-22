'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, Lock, Mail, Ticket, Video, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { formatTurnoForDisplay } from '@/lib/simulation';

interface ResultCardProperties {
  mode: 'completed' | 'turno' | 'fuera-horario';
  turnoNumber?: string;
  nombres?: string;
  apellidos?: string;
  horaContacto?: string;
  zoomLink?: string | null;
  webZoomLink?: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function ResultCard({
  mode,
  turnoNumber,
  nombres,
  apellidos,
  horaContacto,
  zoomLink,
  webZoomLink,
}: ResultCardProperties) {
  if (mode === 'fuera-horario') {
    return (
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-utpl-surface"
          variants={itemVariants}
        >
          <Clock className="h-8 w-8 text-utpl-blue" />
        </motion.div>
        <motion.h2
          className="text-2xl font-black text-utpl-blue sm:text-3xl"
          variants={itemVariants}
        >
          Gracias por tu solicitud
        </motion.h2>
        <motion.p
          className="mt-2 text-sm leading-relaxed text-utpl-muted sm:text-base"
          variants={itemVariants}
        >
          Tus datos han sido registrados exitosamente.
        </motion.p>
        {horaContacto && (
          <motion.div
            className="mx-auto mt-6 max-w-xs rounded-2xl border-2 border-blue-100 bg-blue-50/50 p-5"
            variants={itemVariants}
          >
            <p className="text-sm font-bold text-utpl-blue">Un asesor se contactará contigo en:</p>
            <p className="mt-1 text-2xl font-black text-utpl-blue">{horaContacto}</p>
            <p className="mt-1 text-xs text-utpl-muted">Por favor mantente atento a tu teléfono</p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (mode === 'completed') {
    return (
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50"
          variants={itemVariants}
        >
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </motion.div>
        <motion.h2
          className="text-2xl font-black text-utpl-blue sm:text-3xl"
          variants={itemVariants}
        >
          ¡Gracias por confiar en nosotros!
        </motion.h2>
        <motion.p
          className="mt-2 text-sm leading-relaxed text-utpl-muted sm:text-base"
          variants={itemVariants}
        >
          Tu requerimiento ha sido registrado exitosamente.
        </motion.p>
        {turnoNumber && (
          <motion.div
            className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-blue-100 bg-blue-50 px-5 py-2.5"
            variants={itemVariants}
          >
            <Ticket className="h-5 w-5 text-utpl-blue" />
            <span className="text-base font-bold text-utpl-blue">
              Turno: {formatTurnoForDisplay(turnoNumber)}
            </span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (mode === 'turno' && turnoNumber && zoomLink && webZoomLink) {
    const displayNumber = formatTurnoForDisplay(turnoNumber);

    return (
      <TurnoResult
        displayNumber={displayNumber}
        zoomLink={zoomLink}
        webZoomLink={webZoomLink}
      />
    );
  }

  return null;
}

function TurnoResult({
  displayNumber,
  zoomLink,
  webZoomLink,
}: {
  displayNumber: string;
  zoomLink: string;
  webZoomLink: string;
}) {
  const [recordingAccepted, setRecordingAccepted] = useState(false);
  const isMobile = useMemo(
    () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    [],
  );

  const handleJoinZoom = useCallback(() => {
    if (isMobile) {
      window.open(webZoomLink, '_blank');
    } else {
      window.location.href = zoomLink;
      const fallback = setTimeout(() => window.open(webZoomLink, '_blank'), 2000);
      const onBlur = () => clearTimeout(fallback);
      window.addEventListener('blur', onBlur, { once: true });
    }
  }, [zoomLink, webZoomLink, isMobile]);

  return (
    <motion.div
      className="text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed top-20 right-4 z-50 max-w-xs rounded-2xl border-2 border-amber-400 bg-white p-4 shadow-xl shadow-amber-200/50"
      >
        <button
          type="button"
          onClick={() => {}}
          className="absolute right-2 top-2 text-amber-500 hover:text-amber-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Mail className="h-5 w-5 text-amber-500" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-utpl-blue">
              Encuesta de satisfacción
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Al finalizar tu atención, recibirás un correo.{' '}
              <span className="font-bold text-amber-600">Tu opinión nos permitirá evaluar y optimizar la calidad de nuestro servicio.</span>
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-utpl-surface"
        variants={itemVariants}
      >
        <Ticket className="h-7 w-7 text-utpl-blue" />
      </motion.div>
      <motion.h2
        className="text-xl font-black text-utpl-blue sm:text-2xl"
        variants={itemVariants}
      >
        Turno asignado
      </motion.h2>
      <motion.p
        className="mt-1 text-sm text-utpl-muted"
        variants={itemVariants}
      >
        Acude al link de Zoom en el horario de atención: 08:00 a 13:00 y de 15:00 a 18:00
      </motion.p>

      <div className="mx-auto mt-6 max-w-xs">
        <motion.div
          className="ticket-shine relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004270] via-[#003a60] to-[#002d4d] p-6 shadow-xl sm:p-8"
          variants={itemVariants}
        >
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white" />
            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white" />
          </div>

          <div className="absolute left-0 top-0 flex -translate-x-1/2 flex-col gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-2 w-2 rounded-full bg-white/20"
              />
            ))}
          </div>
          <div className="absolute right-0 top-0 flex translate-x-1/2 flex-col gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-2 w-2 rounded-full bg-white/20"
              />
            ))}
          </div>

          <div className="relative">
            <motion.p
              className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-utpl-gold"
              variants={itemVariants}
            >
              Tu turno es
            </motion.p>
            <motion.p
              className="text-5xl font-black leading-none text-white sm:text-6xl"
              variants={itemVariants}
            >
              {displayNumber}
            </motion.p>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="mx-auto mt-5 max-w-xs"
        variants={itemVariants}
      >
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-left">
          <Video className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-xs leading-relaxed text-amber-800">
            Las asesorías podrán ser grabadas para verificar la calidad de la atención y el cumplimiento de normas éticas institucionales de los participantes.
          </p>
        </div>

        <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-utpl-blue/30 focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2">
          <input
            type="checkbox"
            checked={recordingAccepted}
            onChange={(event) => setRecordingAccepted(event.target.checked)}
            className="accent-utpl-blue mt-0.5 h-4 w-4 rounded border-gray-300 focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2"
          />
          <span className="text-xs font-medium text-utpl-text">
            Acepto el{' '}
            <a
              href="https://procuraduria.utpl.edu.ec/sitios/documentos/NormativasPublicas/Reglamento%20de%20%C3%89tica%20y%20R%C3%A9gimen%20Disciplinario%20UTPL.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-utpl-blue underline underline-offset-2 hover:text-utpl-blue-hover"
              onClick={(e) => e.stopPropagation()}
            >
              Reglamento de Ética y Régimen Disciplinario de la UTPL
            </a>
          </span>
        </label>
      </motion.div>

      <motion.div
        className="mx-auto mt-4 max-w-xs"
        variants={itemVariants}
      >
        {recordingAccepted ? (
          <>
            <motion.button
              type="button"
              onClick={handleJoinZoom}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-utpl-blue/20 bg-white px-5 py-3 text-sm font-bold text-utpl-blue shadow-lg transition-all hover:bg-utpl-blue hover:text-white focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Video className="h-4 w-4" />
              Unirse a Zoom
            </motion.button>
            {!isMobile && (
              <p className="mt-2 text-[10px] text-slate-400">
                o{' '}
                <a
                  href={webZoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-colors hover:text-utpl-blue focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  abrir en navegador
                </a>
              </p>
            )}
          </>
        ) : (
          <button
            type="button"
            disabled
            aria-label="Acepta el reglamento para desbloquear el acceso a Zoom"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-400 cursor-not-allowed"
          >
            <Lock className="h-4 w-4" />
            Unirse a Zoom
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
