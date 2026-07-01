'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import ResultCard from '@/components/ResultCard';
import { useFormContext } from '@/contexts/FormContext';

function ResultadoContent() {
  const { data, isSubmitting } = useFormContext();
  const searchParameters = useSearchParams();
  const contactTime = searchParameters.get('time') || '';

  if (isSubmitting) {
    return (
      <div className="py-8 text-center">
        <FileText className="mx-auto h-10 w-10 animate-pulse text-utpl-blue" />
        <p className="mt-3 text-sm text-utpl-muted">Procesando tu solicitud...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
    >
      {data.flowState === 'turno-assigned' && data.turnoNumber ? (
        <ResultCard
          mode="turno"
          turnoNumber={data.turnoNumber}
          nombres={data.nombres}
          apellidos={data.apellidos}
          zoomLink={data.zoomLink}
          webZoomLink={data.webZoomLink}
        />
      ) : null}

      {data.flowState === 'fuera-horario' && (
        <ResultCard
          mode="fuera-horario"
          horaContacto={contactTime}
        />
      )}

      {data.flowState === 'completed' && (
        <ResultCard
          mode="completed"
          turnoNumber={data.turnoNumber ?? undefined}
        />
      )}

      <div className="pt-6 text-center">
        <a
          href="https://www.utpl.edu.ec/contacto"
          className="inline-flex items-center gap-2 text-sm font-semibold text-utpl-blue transition-colors hover:text-utpl-blue-hover focus-visible:underline focus-visible:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al sitio UTPL
        </a>
      </div>
    </motion.div>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense
      fallback={<div className="py-8 text-center text-sm text-utpl-muted">Cargando...</div>}
    >
      <ResultadoContent />
    </Suspense>
  );
}
