import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Campus360 Hub — Atención UTPL',
  description: 'Plataforma inteligente de servicios y turnos para la comunidad UTPL.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body
        className="relative flex min-h-full flex-col bg-[#f6f8fb]"
        suppressHydrationWarning
      >
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.08] mix-blend-multiply">
            <svg
              className="h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="hex"
                  width="64"
                  height="115"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M32 0L64 19V57.5L32 76.5L0 57.5V19Z"
                    fill="none"
                    stroke="#004270"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M32 76.5L64 57.5V96L32 115L0 96V57.5Z"
                    fill="none"
                    stroke="#004270"
                    strokeWidth="1.2"
                    opacity="0.5"
                  />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="url(#hex)"
              />
            </svg>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}