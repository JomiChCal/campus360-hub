'use client';

import { motion } from 'framer-motion';
import { FileText, Ticket, Video } from 'lucide-react';

import { c } from '@/data/content';

const flowVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
    },
  },
};

const iconMap: Record<string, typeof FileText> = {
  'file-text': FileText,
  ticket: Ticket,
  video: Video,
};

export default function ProcessFlow() {
  const flow = c.steps.tipo.flow;
  if (!flow || flow.length === 0) return null;

  return (
    <motion.div
      className="mx-auto mb-8 flex max-w-md items-start justify-center gap-0"
      variants={flowVariants}
      initial="hidden"
      animate="visible"
    >
      {flow.map((step, index) => {
        const IconComponent = iconMap[step.icon] || FileText;
        const isLast = index === flow.length - 1;

        return (
          <div
            key={step.label}
            className="flex items-start"
          >
            <motion.div
              className="flex flex-col items-center gap-1.5"
              variants={stepVariants}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-utpl-surface shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                <IconComponent className="h-5 w-5 text-utpl-blue" />
              </div>
              <span className="text-center text-xs font-bold uppercase tracking-[0.1em] text-utpl-text">
                {step.label}
              </span>
              <span className="-mt-0.5 text-center text-[10px] leading-tight text-utpl-text/60">
                {step.hint}
              </span>
            </motion.div>
            {!isLast && (
              <div className="mx-2 mt-5 flex items-center sm:mx-3">
                <div className="h-px w-6 bg-gradient-to-r from-utpl-gold/30 to-utpl-gold/70 sm:w-10" />
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
