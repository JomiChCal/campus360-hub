import { z } from 'zod';

export const studentTypeSchema = z.object({
  code: z.string().min(1).transform((v) => v.trim().toUpperCase()),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const categorySchema = z.object({
  studentTypeId: z.coerce.number().int().positive(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const serviceGeneralSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  modalityLevel: z.string().optional().nullable(),
  responseTime: z.string().optional().nullable(),
  cost: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  isActive: z.boolean(),
});

export const serviceFullSchema = serviceGeneralSchema.extend({
  requirements: z.array(z.object({ text: z.string().min(1), sortOrder: z.number().int() })),
  requirementTabs: z.array(
    z.object({
      tabName: z.string().min(1),
      title: z.string().optional().nullable(),
      sortOrder: z.number().int(),
      items: z.array(
        z.object({
          text: z.string().min(1),
          pdfUrl: z.string().url().optional().nullable().or(z.literal('')),
          sortOrder: z.number().int(),
        }),
      ),
    }),
  ),
  periods: z.array(
    z.object({
      name: z.string().min(1),
      sortOrder: z.number().int(),
      modalities: z.array(
        z.object({
          modality: z.string().min(1),
          requestWindow: z.string().optional().nullable(),
          responseWindow: z.string().optional().nullable(),
          sortOrder: z.number().int(),
        }),
      ),
    }),
  ),
  manuals: z.array(
    z.object({
      label: z.string().min(1),
      url: z.string().url(),
      sortOrder: z.number().int(),
    }),
  ),
});
