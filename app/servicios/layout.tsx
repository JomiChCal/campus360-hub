import PageHeader from '@/components/PageHeader';

const BOOTSTRAP_CSS = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
const UTPL_SERVICE_STYLES =
  'https://portales.utpl.edu.ec/themes/biblioteca/css/service-styles.css';

export default function ServiciosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href={BOOTSTRAP_CSS} />
      <link rel="stylesheet" href={UTPL_SERVICE_STYLES} />
      <PageHeader />
      <main className="relative z-10 min-h-screen bg-utpl-surface pt-20 pb-12">
        {children}
      </main>
    </>
  );
}
