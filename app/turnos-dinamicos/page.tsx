'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import Carrusel from '@/components/Carrusel';
import UtplLogo from '@/components/UtplLogo';

const slides = [
  { src: '/images/carrusel/slide-1.jpg', alt: 'Matrículas Presenciales - Slide 1' },
  { src: '/images/carrusel/slide-2.jpg', alt: 'Matrículas Presenciales - Slide 2' },
  { src: '/images/carrusel/slide-3.jpg', alt: 'Matrículas Presenciales - Slide 3' },
  { src: '/images/carrusel/slide-4.png', alt: 'Matrículas Presenciales - Slide 4' },
  { src: '/images/carrusel/slide-5.png', alt: 'Matrículas Presenciales - Slide 5' },
];

interface TurnoData {
  currentTurno: number;
  nextTurno: number;
  totalAtendidos: number;
}

function TurnoDisplay() {
  const [data, setData] = useState<TurnoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchData = () => {
      fetch('/api/turnos-dinamicos')
        .then((res) => {
          if (!res.ok) throw new Error('Error al cargar');
          return res.json();
        })
        .then((json) => {
          if (!cancelled) {
            setTimeout(() => {
              setData(json);
              setError(false);
              setLoading(false);
            });
          }
          return undefined;
        })
        .catch(() => {
          if (!cancelled) {
            setTimeout(() => {
              setError(true);
              setLoading(false);
            });
          }
        });
    };

    fetchData();
    const id = setInterval(fetchData, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-4 text-center">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <Users className="h-6 w-6 text-utpl-gold" />
        </div>
        <h1 className="text-xl font-black text-white sm:text-2xl">Turnos en Vivo</h1>
      </div>

      {loading && <p className="text-sm text-white/60">Cargando...</p>}

      {error && <p className="text-sm text-red-300">No se pudo conectar. Reintentando...</p>}

      {data && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="rounded-2xl bg-white/10 px-8 py-3 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-utpl-gold">
              Estamos atendiendo
            </p>
            <p className="mt-1 text-5xl font-black text-white sm:text-6xl">
              #{String(data.currentTurno).padStart(3, '0')}
            </p>
          </div>

          <div className="rounded-xl bg-white/5 px-6 py-2 backdrop-blur-sm">
            <p className="text-sm text-white/80">
              Siguiente turno:{' '}
              <span className="font-bold text-white">
                #{String(data.nextTurno).padStart(3, '0')}
              </span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function TurnosDinamicosPage() {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#0a1628]">
      <div className="absolute top-4 left-4 z-20">
        <UtplLogo variant="compact" />
      </div>

      <div className="flex h-[30vh] min-h-[200px] items-center justify-center bg-gradient-to-br from-[#004270] via-[#003358] to-[#002d4d]">
        <TurnoDisplay />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Carrusel
          slides={slides}
          interval={6000}
        />
      </div>
    </div>
  );
}
