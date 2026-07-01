import { motion } from 'framer-motion';
import { ArrowRight, User, UserPlus } from 'lucide-react';

import { c } from '@/data/content';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      delay: index * 0.2,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

interface StepUserTypeProperties {
  onSelect: (type: 'estudiante' | 'aspirante') => void;
}

function UserIcon({ type }: { type: 'estudiante' | 'aspirante' }) {
  const Icon = type === 'estudiante' ? User : UserPlus;
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#febe10]">
      <Icon className="h-6 w-6" style={{ color: '#0d2e5c' }} strokeWidth={2} />
    </div>
  );
}

export default function StepUserType({ onSelect }: StepUserTypeProperties) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <motion.button
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        type="button"
        onClick={() => onSelect('estudiante')}
        className="group relative rounded-2xl border-l-4 border-l-utpl-navy bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-utpl-navy focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <UserIcon type="estudiante" />
        <h3 className="mt-4 font-display text-xl font-bold text-utpl-navy">{c.steps.tipo.estudiante.heading}</h3>
        <p className="mt-2 text-sm leading-relaxed text-utpl-muted">{c.steps.tipo.estudiante.description}</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-utpl-navy px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-utpl-navy-medium">
          <span>{c.steps.tipo.estudiante.button}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </motion.button>

      <motion.button
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        type="button"
        onClick={() => onSelect('aspirante')}
        className="group relative rounded-2xl border-l-4 border-l-utpl-gold bg-white p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-utpl-navy focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <UserIcon type="aspirante" />
        <h3 className="mt-4 font-display text-xl font-bold text-utpl-navy">{c.steps.tipo.aspirante.heading}</h3>
        <p className="mt-2 text-sm leading-relaxed text-utpl-muted">{c.steps.tipo.aspirante.description}</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#febe10] px-4 py-2 text-sm font-semibold text-utpl-navy transition-colors group-hover:brightness-95">
          <span>{c.steps.tipo.aspirante.button}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </motion.button>
    </div>
  );
}