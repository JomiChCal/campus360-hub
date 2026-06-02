import { motion } from 'framer-motion';
import React, { memo } from 'react';

import UtplLogo from '@/components/UtplLogo';

function PageHeader() {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 h-14 bg-utpl-navy flex items-center px-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <a
        href="https://utpl.edu.ec"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-opacity hover:opacity-70 focus-visible:opacity-70 focus-visible:outline-none"
      >
        <UtplLogo variant="compact" />
      </a>
    </motion.header>
  );
}

export default memo(PageHeader);