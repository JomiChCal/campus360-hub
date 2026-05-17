'use client';

import { useEffect, useState, useTransition } from 'react';

import { fetchServiceDetail } from '@/app/servicios/actions';
import { ServiceDetailContent } from '@/components/servicios/ServiceDetailContent';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  categoryId: number | null;
  serviceId: number | null;
  serviceTitle: string | null;
  onOpenChange: (open: boolean) => void;
};

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
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-utpl-blue">
            {serviceTitle ?? 'Detalle del servicio'}
          </DialogTitle>
        </DialogHeader>
        {isPending ? (
          <p className="py-8 text-center text-sm text-utpl-muted">Cargando detalle…</p>
        ) : detail ? (
          <ServiceDetailContent detail={detail} />
        ) : (
          <p className="py-8 text-center text-sm text-utpl-muted">
            No se pudo cargar el detalle del servicio.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
