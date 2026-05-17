import PageHeader from '@/components/PageHeader';

export default function ServiciosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader />
      <main className="relative z-10 min-h-screen bg-utpl-surface pt-20 pb-12">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </>
  );
}
