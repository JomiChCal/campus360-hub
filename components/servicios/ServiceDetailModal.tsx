'use client';

import { useEffect, useState, useTransition } from 'react';

import { fetchServiceDetail } from '@/app/servicios/actions';
import { ServiceDetailContent } from '@/components/servicios/ServiceDetailContent';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import styles from '@/components/servicios/service-detail-modal.module.css';

type Props = {
  open: boolean;
  categoryId: number | null;
  serviceId: number | null;
  serviceTitle: string | null;
  onOpenChange: (open: boolean) => void;
};

function ServiceDetailSkeleton() {
  return (
    <div className="space-y-5 p-7 animate-pulse" aria-hidden>
      <div className="space-y-2">
        <div className="h-3 w-36 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
      <div className="h-16 rounded bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3 w-full rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}

export function ServiceDetailModal({
  open,
  categoryId,
  serviceId,
  serviceTitle,
  onOpenChange,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchServiceDetail>>>(null);

  useEffect(() => {
    if (!open || !categoryId || !serviceId) {
      setDetail(null);
      return;
    }

    startTransition(async () => {
      const result = await fetchServiceDetail(categoryId, serviceId);
      setDetail(result);
    });
  }, [open, categoryId, serviceId]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName={`${styles.overlay} data-open:fade-in-0`}
        className={`w-full max-w-[calc(100%-2rem)] sm:max-w-[860px] ${styles.content}`}
      >
        {isPending ? <ServiceDetailSkeleton /> : null}
        {!isPending && detail ? (
          <ServiceDetailContent
            detail={detail}
            title={detail.title || serviceTitle || 'Detalle del servicio'}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
        {!isPending && !detail ? (
          <p className="py-12 text-center text-sm text-utpl-muted">
            No se pudo cargar el detalle del servicio.
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
