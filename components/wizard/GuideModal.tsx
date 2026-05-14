'use client';

import { motion } from 'framer-motion';
import { CheckCircle, FileText, HelpCircle, RefreshCw } from 'lucide-react';

import Modal from '@/components/Modal';
import GuideStepRenderer from '@/components/wizard/GuideStepRenderer';
import { useFormContext } from '@/contexts/FormContext';
import { getGuide } from '@/data/guides';
import { findServiceById } from '@/data/services';

interface GuideModalProperties {
  isOpen: boolean;
}

export default function GuideModal({ isOpen }: GuideModalProperties) {
  const { data, handleSolvedFromModal, handleNeedAdvisorFromModal } = useFormContext();

  const selectedService = data.selectedServiceId ? findServiceById(data.selectedServiceId) : null;
  const guideSteps = selectedService ? getGuide(selectedService.service.id) : [];

  return (
    <Modal
      isOpen={isOpen}
      hideTitle={true}
      showCloseButton={false}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-utpl-surface shadow-md">
            <FileText className="h-7 w-7 text-utpl-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-utpl-text">Guía de Solución</h2>
            {selectedService && (
              <p className="text-sm font-medium text-utpl-muted">{selectedService.service.label}</p>
            )}
          </div>
        </div>

        <div className="h-1 w-full rounded-full bg-gradient-to-r from-blue-100 to-transparent" />

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
          {guideSteps.map((step, index) => (
            <GuideStepRenderer
              key={index}
              step={step}
            />
          ))}
        </div>

        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <HelpCircle className="h-5 w-5 text-utpl-blue" />
            </div>
            <div>
              <p className="text-base font-bold text-utpl-text">¿Resolvió tu problema?</p>
              <p className="mt-1 text-sm text-utpl-muted">
                Si fue suficiente, registra tu caso como resuelto. Si necesitas ayuda, solicita un
                asesor.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <motion.button
            type="button"
            onClick={handleSolvedFromModal}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <CheckCircle className="h-5 w-5" />
            Sí, problema resuelto
          </motion.button>
          <motion.button
            type="button"
            onClick={handleNeedAdvisorFromModal}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-blue-300 bg-white px-8 py-4 text-base font-bold text-utpl-blue transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-utpl-blue focus-visible:ring-offset-2 focus-visible:outline-none"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCw className="h-5 w-5" />
            No, necesito ayuda
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
