'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Monitor, Share2, Smartphone } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'campus360-mobile-warning-dismissed';

export default function MobileWarningModal() {
  const [isOpen, setIsOpen] = useState(() => {
    if (globalThis.window === undefined) return false;
    if (sessionStorage.getItem(STORAGE_KEY)) return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  }, []);

  const handleGoBack = useCallback(() => {
    globalThis.location.href = 'https://www.utpl.edu.ec';
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.button
            type="button"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            tabIndex={-1}
            aria-label="Cerrar fondo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-[#004270] via-[#003358] to-[#002d4d] px-6 pt-8 pb-10 text-center">
              <div className="absolute inset-0 opacity-[0.06]">
                <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white" />
                <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-utpl-gold" />
              </div>

              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
                <Smartphone className="h-8 w-8 text-white" />
              </div>

              <h2 className="relative text-2xl font-black text-white">Recomendación</h2>
              <p className="relative mt-1 text-sm font-semibold uppercase tracking-[0.15em] text-utpl-gold">
                Mejor experiencia en computadora
              </p>
            </div>

            <div className="space-y-4 px-6 pt-5 pb-1">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-utpl-surface">
                  <Monitor className="h-5 w-5 text-utpl-blue" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-bold text-utpl-text">
                    Usa una laptop o PC de escritorio
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-utpl-muted">
                    Para una mejor experiencia, te recomendamos usar una computadora.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                  <Share2 className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-bold text-utpl-text">Compartir pantalla en Zoom</p>
                  <p className="mt-1 text-sm leading-relaxed text-utpl-muted">
                    Tu asesor podría pedirte compartir pantalla para guiarte, algo limitado en
                    dispositivos móviles.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3">
                <p className="text-sm leading-relaxed text-amber-800">
                  Puedes continuar desde tu celular, pero la atención podría no ser tan eficiente.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-6 pt-3 pb-6">
              <motion.button
                type="button"
                onClick={handleDismiss}
                className="flex items-center justify-center gap-2 rounded-xl bg-utpl-blue px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-utpl-blue/20 transition-colors hover:bg-utpl-blue-hover focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Entendido, continuar
              </motion.button>

              <motion.button
                type="button"
                onClick={handleGoBack}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-utpl-muted transition-colors hover:border-utpl-blue/30 hover:text-utpl-blue focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al sitio UTPL
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
