'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface CarruselSlide {
  src: string;
  alt: string;
}

interface CarruselProperties {
  slides: CarruselSlide[];
  interval?: number;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function Carrusel({ slides, interval = 6000 }: CarruselProperties) {
  const [[slideIndex, direction], setSlideState] = useState([0, 0]);
  const timerReference = useRef<ReturnType<typeof setInterval> | null>(null);

  const paginate = useCallback(
    (newDirection: number) => {
      setSlideState((previous) => {
        const nextIndex = (previous[0] + newDirection + slides.length) % slides.length;
        return [nextIndex, newDirection];
      });
    },
    [slides.length]
  );

  const goToSlide = useCallback((index: number) => {
    setSlideState((previous) => [index, index > previous[0] ? 1 : -1]);
  }, []);

  useEffect(() => {
    timerReference.current = setInterval(() => paginate(1), interval);
    return () => {
      if (timerReference.current) clearInterval(timerReference.current);
    };
  }, [paginate, interval]);

  const handlePointerDown = useCallback(() => {
    if (timerReference.current) {
      clearInterval(timerReference.current);
      timerReference.current = null;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!timerReference.current) {
      timerReference.current = setInterval(() => paginate(1), interval);
    }
  }, [paginate, interval]);

  if (slides.length === 0) return null;

  const currentSlide = slides[slideIndex];

  return (
    <div
      className="relative flex h-full w-full select-none items-center justify-center overflow-hidden bg-black"
      role="presentation"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
    >
      <AnimatePresence
        initial={false}
        custom={direction}
        mode="popLayout"
      >
        <motion.img
          key={slideIndex}
          src={currentSlide.src}
          alt={currentSlide.alt}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </AnimatePresence>

      <button
        type="button"
        onClick={() => paginate(-1)}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={() => paginate(1)}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        aria-label="Slide siguiente"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
              index === slideIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
