import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google';

import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['700', '800'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
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
      className={`${plusJakarta.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body
        className="relative flex min-h-full flex-col bg-utpl-surface"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}