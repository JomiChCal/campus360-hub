interface UtplLogoProperties {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function UtplLogo({ className = '', variant = 'default' }: UtplLogoProperties) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-0 ${className}`}>
        <span className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          UTPL
        </span>
        <span className="font-display text-2xl font-bold text-[#febe10] sm:text-3xl">+</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-0">
        <span className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          UTPL
        </span>
        <span className="font-display text-2xl font-bold text-[#febe10] sm:text-3xl">+</span>
      </div>
      <span className="mt-0.5 font-sans text-[9px] font-semibold uppercase tracking-[0.25em] text-white/60">
        La Universidad Católica de Loja
      </span>
    </div>
  );
}