import { X } from 'lucide-react';

interface AnnouncementBannerProperties {
  title: string;
  message?: string;
  onDismiss?: () => void;
}

export default function AnnouncementBanner({
  title,
  message,
  onDismiss,
}: AnnouncementBannerProperties) {
  return (
    <div className="mx-auto max-w-3xl px-4">
      <div className="flex items-center justify-between rounded-lg bg-utpl-navy px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-utpl-gold">
            <span className="font-display text-sm font-bold text-utpl-navy">!</span>
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white">{title}</p>
            {message && (
              <p className="mt-0.5 text-xs text-white/70">{message}</p>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}