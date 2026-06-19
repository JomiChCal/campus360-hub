import { sanitizeInput } from '@/lib/server/api-utilities';
import type { WizardCategory, WizardStudentType } from '@/types/category';

type SharePointChoiceField = {
  Value?: string;
};

type UnknownRecord = Record<string, unknown>;

function normalizeKey(key: string): string {
  return key
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function pickValue(record: UnknownRecord, aliases: string[]): unknown {
  const aliasSet = new Set(aliases.map(normalizeKey));
  for (const [key, value] of Object.entries(record)) {
    if (aliasSet.has(normalizeKey(key)) && value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

function readChoiceValue(value: unknown): string {
  if (!value || typeof value !== 'object') return String(value ?? '').trim();
  return String((value as SharePointChoiceField).Value ?? '').trim();
}

function isActivated(record: UnknownRecord): boolean {
  const raw = pickValue(record, ['Activo', 'activar', 'activo']);
  const value = readChoiceValue(raw).toLowerCase();
  return value === 'activado' || value === 'activada' || value === 'si' || value === 'sí';
}

function parseStudentType(record: UnknownRecord): WizardStudentType | null {
  const raw = readChoiceValue(pickValue(record, ['TipoEstudiante', 'Tipo de estudiante', 'field_3']));
  const normalized = raw.toLowerCase();

  if (normalized === 'continuo' || normalized.includes('ya soy')) return 'continuo';
  if (normalized === 'nuevo' || normalized.includes('quiero ser')) return 'nuevo';
  return null;
}

function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}

function mapRow(record: UnknownRecord): WizardCategory | null {
  if (!isActivated(record)) return null;

  const title = sanitizeInput(String(pickValue(record, ['Title', 'title']) ?? '').trim());
  if (!title) return null;

  const studentType = parseStudentType(record);
  if (!studentType) return null;

  const descriptionRaw = String(
    pickValue(record, ['Descripcion', 'Descripción', 'field_1', 'description']) ?? ''
  ).trim();
  const iconLabel = sanitizeInput(
    String(pickValue(record, ['Icono', 'icono', 'field_2', 'icon']) ?? '').trim()
  );

  const category: WizardCategory = {
    id: slugifyTitle(title) || `category-${title.slice(0, 8)}`,
    title,
    iconLabel: iconLabel || 'Ayuda – información general',
    studentType,
  };

  if (descriptionRaw) {
    category.description = sanitizeInput(descriptionRaw);
  }

  return category;
}

export function mapSharePointCategories(raw: unknown): WizardCategory[] {
  if (!Array.isArray(raw)) return [];

  const categories: WizardCategory[] = [];
  const seenIds = new Set<string>();

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const mapped = mapRow(item as UnknownRecord);
    if (!mapped) continue;

    let uniqueId = mapped.id;
    let suffix = 2;
    while (seenIds.has(uniqueId)) {
      uniqueId = `${mapped.id}-${suffix}`;
      suffix += 1;
    }
    seenIds.add(uniqueId);
    categories.push({ ...mapped, id: uniqueId });
  }

  return categories;
}

export function filterCategoriesByAudience(
  categories: WizardCategory[],
  audience: WizardStudentType
): WizardCategory[] {
  return categories.filter((category) => category.studentType === audience);
}
