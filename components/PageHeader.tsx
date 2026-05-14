'use client';

import { motion } from 'framer-motion';

import UtplLogo from '@/components/UtplLogo';

export default function PageHeader() {
  return (
    <motion.div
      className="fixed top-3 left-3 z-20 sm:top-4 sm:left-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <UtplLogo variant="compact" />
    </motion.div>
  );
}
