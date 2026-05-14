'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProperties {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  hideTitle?: boolean;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  hideTitle = false,
  maxWidth = 'max-w-lg',
}: ModalProperties) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
            aria-label="Cerrar fondo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={`relative z-10 flex max-h-[85vh] w-full ${maxWidth} flex-col rounded-2xl bg-white/95 shadow-2xl backdrop-blur-xl`}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {(title || showCloseButton) && !hideTitle && (
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
                {title && <h2 className="text-lg font-semibold text-utpl-text">{title}</h2>}
                {showCloseButton && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1.5 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5 text-utpl-muted" />
                  </button>
                )}
              </div>
            )}
            <div className="overflow-visible px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
