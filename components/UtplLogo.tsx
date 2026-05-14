interface UtplLogoProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function UtplLogo({ className = '', variant = 'default' }: UtplLogoProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-lg font-black tracking-tight text-utpl-blue sm:text-xl">UTPL</span>
        <span className="hidden text-[9px] font-semibold uppercase tracking-[0.15em] text-utpl-muted sm:inline">
          La Universidad Católica de Loja
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span className="text-2xl font-black tracking-tight text-utpl-blue sm:text-3xl">UTPL</span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-utpl-muted">
        La Universidad Católica de Loja
      </span>
    </div>
  );
}
