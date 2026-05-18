'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import {
  createCategory,
  createStudentType,
  deleteCategory,
  deleteService,
  deleteStudentType,
  updateCategory,
  updateStudentType,
} from '@/lib/academic-services/repositories/admin';
import { getServiceDetailForAdmin, upsertService } from '@/lib/academic-services/repositories/services';
import {
  categorySchema,
  serviceFullSchema,
  studentTypeSchema,
} from '@/lib/validations/academic-service';

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error('No autorizado');
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export async function saveStudentTypeAction(formData: FormData) {
  await requireAuth();
  const id = formData.get('id');
  const parsed = studentTypeSchema.parse({
    code: formData.get('code'),
    name: formData.get('name'),
    description: formData.get('description') || null,
    isActive: formData.get('isActive') === 'true',
  });
  const input = { ...parsed, description: parsed.description ?? null };

  if (id) {
    await updateStudentType(Number(id), input);
  } else {
    await createStudentType(input);
  }

  revalidatePath('/administrativo');
  revalidatePath('/servicios');
}

export async function removeStudentTypeAction(id: number) {
  await requireAuth();
  await deleteStudentType(id);
  revalidatePath('/administrativo');
  revalidatePath('/servicios');
}

export async function saveCategoryAction(formData: FormData) {
  await requireAuth();
  const id = formData.get('id');
  const parsed = categorySchema.parse({
    studentTypeId: formData.get('studentTypeId'),
    name: formData.get('name'),
    description: formData.get('description') || null,
    isActive: formData.get('isActive') === 'true',
  });
  const input = { ...parsed, description: parsed.description ?? null };

  if (id) {
    await updateCategory(Number(id), input);
  } else {
    await createCategory(input);
  }

  revalidatePath('/administrativo');
  revalidatePath('/servicios');
}

export async function removeCategoryAction(id: number) {
  await requireAuth();
  await deleteCategory(id);
  revalidatePath('/administrativo');
  revalidatePath('/servicios');
}

export async function loadServiceForEditAction(serviceId: number) {
  await requireAuth();
  return getServiceDetailForAdmin(serviceId);
}

export async function saveServiceAction(payload: unknown) {
  await requireAuth();
  const raw = payload as { id?: number };
  const parsed = serviceFullSchema.parse(payload);
  const requirementTabs = parsed.requirementTabs.map((tab) => ({
    tabName: tab.tabName,
    title: tab.title ?? null,
    sortOrder: tab.sortOrder,
    items: tab.items.map((item) => ({
      text: item.text,
      sortOrder: item.sortOrder,
      pdfUrl: item.pdfUrl && item.pdfUrl.length > 0 ? item.pdfUrl : null,
    })),
    guides: tab.guides,
  }));

  await upsertService({
    id: raw.id,
    categoryId: parsed.categoryId,
    title: parsed.title,
    slug: parsed.slug?.trim() || slugify(parsed.title),
    description: parsed.description ?? null,
    programs: parsed.programs,
    modalityLevel: composeModalityLevel(parsed.modality, parsed.level, parsed.modalityLevel),
    responseTime: parsed.responseTime ?? null,
    cost: parsed.cost ?? null,
    note: parsed.note ?? null,
    calendarText: parsed.calendarText ?? null,
    status: parsed.status,
    isActive: parsed.isActive,
    requirements: parsed.requirements,
    requirementTabs,
    periods: parsed.periods.map((period) => ({
      name: period.name,
      sortOrder: period.sortOrder,
      modalities: period.modalities.map((modality) => ({
        modality: modality.modality,
        sortOrder: modality.sortOrder,
        requestWindow: modality.requestWindow ?? null,
        responseWindow: modality.responseWindow ?? null,
        enabledFrom: modality.enabledFrom ?? null,
        enabledTo: modality.enabledTo ?? null,
      })),
    })),
    manuals: parsed.manuals,
  });

  revalidatePath('/administrativo');
  revalidatePath('/servicios');
}

function composeModalityLevel(
  modality: string | null | undefined,
  level: string | null | undefined,
  fallback: string | null | undefined,
) {
  const normalizedModality = modality?.trim();
  const normalizedLevel = level?.trim();

  if (normalizedModality && normalizedLevel) {
    return `${normalizedModality} - ${normalizedLevel}`;
  }
  if (normalizedModality) return normalizedModality;
  if (normalizedLevel) return `Nivel ${normalizedLevel}`;
  return fallback?.trim() || null;
}

export async function removeServiceAction(id: number) {
  await requireAuth();
  await deleteService(id);
  revalidatePath('/administrativo');
  revalidatePath('/servicios');
}
