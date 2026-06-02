'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useState } from 'react';

import Modal from '@/components/Modal';

type Properties = {
  isOpen: boolean;
  onClose: () => void;
};

export default function RatingModal({ isOpen, onClose }: Properties) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    console.log('Rating submitted:', { rating, comment });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setComment('');
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      hideTitle
      showCloseButton={false}
      maxWidth="max-w-md"
    >
      <div className="space-y-6 py-2 text-center">
        {submitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4 py-6"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg font-bold text-utpl-text">¡Gracias por tu opinión!</p>
          </motion.div>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-utpl-surface shadow-md">
              <Star className="h-8 w-8 text-utpl-gold" />
            </div>

            <div>
              <h3 className="text-xl font-black text-utpl-text">
                ¡Gracias por usar la autogestión!
              </h3>
              <p className="mt-1 text-sm text-utpl-muted">
                Califica tu experiencia para ayudarnos a mejorar.
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="transition-colors"
                >
                  <Star
                    className={`h-9 w-9 ${
                      star <= (hoverRating || rating)
                        ? 'fill-utpl-gold text-utpl-gold'
                        : 'text-utpl-border'
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            <textarea
              placeholder="Cuéntanos qué te pareció (opcional)..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="w-full rounded-xl border-2 border-utpl-border bg-white px-4 py-3.5 text-sm outline-none transition-all focus:border-utpl-blue focus:ring-4 focus:ring-utpl-blue/[0.06]"
              rows={3}
            />

            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0}
              className="w-full rounded-xl bg-utpl-blue px-6 py-3.5 text-base font-bold text-white shadow-md shadow-utpl-blue/20 transition-all duration-300 hover:bg-utpl-blue-hover hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              whileHover={rating > 0 ? { scale: 1.02 } : undefined}
              whileTap={rating > 0 ? { scale: 0.98 } : undefined}
            >
              Enviar calificación
            </motion.button>
          </>
        )}
      </div>
    </Modal>
  );
}
