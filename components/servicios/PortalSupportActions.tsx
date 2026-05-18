'use client';

import Link from 'next/link';

import styles from '@/components/servicios/servicios-presentational.module.css';

export const PORTAL_CANVAS_ID = 'portal-servicios';

export function PortalSupportActions() {
  const scrollToCatalog = () => {
    document.getElementById(PORTAL_CANVAS_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className={`container ${styles.portalActions}`}>
      <button
        type="button"
        onClick={scrollToCatalog}
        className={`btn-utpl btn-tipo-estudiante ${styles.portalActionButton}`}
      >
        Solucione mi problema
      </button>
      <Link
        href="/tipo"
        className={`btn-utpl btn-tipo-estudiante-select ${styles.portalActionButton} d-flex align-items-center justify-content-center text-decoration-none`}
      >
        Deseo asesoría
      </Link>
    </div>
  );
}
