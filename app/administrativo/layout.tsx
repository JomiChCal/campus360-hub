export default function AdministrativoLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative z-10 min-h-screen bg-utpl-surface py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
