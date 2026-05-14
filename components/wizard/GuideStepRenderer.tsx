'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ImageIcon, Play, Video } from 'lucide-react';

import type { GuideStep } from '@/data/guides';

function GuideStepRenderer({ step }: { step: GuideStep }) {
  if (step.type === 'video') {
    return (
      <motion.div
        className="flex items-start gap-3 rounded-xl border-2 border-blue-100 bg-utpl-surface/50 p-4 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-200">
          <Play className="h-5 w-5 text-utpl-blue" />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            {step.stepNumber && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-utpl-blue text-xs font-bold text-white">
                {step.stepNumber}
              </span>
            )}
            <p className="text-sm font-bold text-utpl-text">{step.title ?? 'Video-tutorial'}</p>
          </div>
          <div className="rounded-xl border-2 border-blue-200 bg-blue-100 p-6 text-center">
            <div className="flex h-20 items-center justify-center">
              <div className="rounded-full bg-blue-200 p-4">
                <Video className="h-8 w-8 text-utpl-blue" />
              </div>
            </div>
            <p className="mt-2 text-xs font-medium text-utpl-blue">
              Reproducir video ({step.duration ?? 'N/A'})
            </p>
            <p className="mt-1 text-xs text-utpl-muted">{step.url}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (step.type === 'image') {
    return (
      <motion.div
        className="flex items-start gap-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 p-4 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <ImageIcon className="h-5 w-5 text-gray-500" />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            {step.stepNumber && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-utpl-blue text-xs font-bold text-white">
                {step.stepNumber}
              </span>
            )}
          </div>
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 p-6 text-center">
            <div className="flex h-16 items-center justify-center">
              <div className="rounded-full bg-gray-200 p-3">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <p className="mt-2 text-xs font-medium text-gray-500">
              {step.caption ?? 'Captura de pantalla'}
            </p>
            <p className="mt-1 text-xs text-gray-400">{step.url}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (step.type === 'tip') {
    return (
      <motion.div
        className="flex items-start gap-3 rounded-xl border-2 border-blue-200 bg-utpl-surface p-4 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-200">
          <AlertCircle className="h-4 w-4 text-utpl-blue" />
        </div>
        <p className="pt-1 text-sm font-medium leading-relaxed text-utpl-blue">{step.content}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex items-start gap-3 rounded-xl border-2 border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {step.stepNumber ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-utpl-blue text-sm font-black text-white shadow">
          {step.stepNumber}
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-utpl-surface">
          <CheckCircle className="h-4 w-4 text-utpl-blue" />
        </div>
      )}
      <p className="pt-1 text-sm font-medium leading-relaxed text-utpl-text">{step.content}</p>
    </motion.div>
  );
}

export default GuideStepRenderer;
