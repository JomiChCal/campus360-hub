import { createHash } from 'node:crypto';

import { classifyUtplPortalRow } from '@/lib/seed/classify-utpl-portal-row';
import { parseUtplDescriptionHtml } from '@/lib/seed/parse-utpl-description-html';
import type { UtplPortalApiRow } from '@/lib/seed/utpl-portal-api-types';
import {
  STUDENT_TYPE_LABELS,
  STUDENT_TYPE_ORDER,
} from '@/lib/seed/utpl-portal-api-types';
import type { UtplServicesJson, UtplService, UtplStudentType } from '@/lib/seed/types';

export type UtplServiceSeed = UtplService & {
  sourceKey: string;
  sourceRowIndex: number;
  sortOrder: number;
  status: 'published' | 'needs_review';
  isActive: boolean;
};

export type UtplCategorySeed = {
  name: string;
  description?: string | null;
  sortOrder: number;
  services: UtplServiceSeed[];
};

export type UtplStudentTypeSeed = {
  code: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  categories: UtplCategorySeed[];
};

export type UtplImportReport = {
  rawRecords: number;
  expandedPlacements: number;
  studentTypes: number;
  categories: number;
  services: number;
  sectionHeaders: number;
  spacers: number;
  discardedRows: number;
  reviewRows: number;
  discardedRowDetails: Array<{ globalIndex: number; title: string; reason: string }>;
  reviewRowDetails: Array<{ globalIndex: number; title: string; reason: string }>;
};

function buildSourceKey(
  typeCode: string,
  category: string,
  title: string,
  globalIndex: number,
): string {
  const raw = `${typeCode}|${category}|${title}|${globalIndex}`;
  return createHash('sha256').update(raw).digest('hex').slice(0, 40);
}

export function stripUtplLeadingEmoji(title: string): string {
  return title.trim().replace(/^(\p{Extended_Pictographic})\s*/u, '').trim();
}

function normalizeTypeCodes(rawTypes: string): string[] {
  const valid = new Set(STUDENT_TYPE_ORDER);
  return rawTypes
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .filter((value) => value.length > 0)
    .filter((value): value is (typeof STUDENT_TYPE_ORDER)[number] => valid.has(value as never));
}

function mapRowToService(
  row: UtplPortalApiRow,
  typeCode: string,
  globalIndex: number,
  sortOrder: number,
  hasStudentTypes: boolean,
): UtplServiceSeed {
  const rawTitle = row.field_nombre_servicio.trim();
  const category = row.field_categoria_servicio.trim();
  const title = stripUtplLeadingEmoji(rawTitle);
  const parsed = parseUtplDescriptionHtml(row.field_descripcion_servicio);
  const normalizedStatus = hasStudentTypes ? 'published' : 'needs_review';

  return {
    sourceKey: buildSourceKey(typeCode, category, rawTitle, globalIndex),
    sourceRowIndex: globalIndex,
    title,
    description: parsed.description,
    programs: parsed.programs,
    modalityLevel: parsed.modalityLevel,
    responseTime: parsed.responseTime,
    cost: parsed.cost,
    note: parsed.note,
    calendarText: parsed.calendarText,
    status: normalizedStatus,
    isActive: normalizedStatus === 'published',
    sortOrder,
    requirements: parsed.requirements,
    requirementTabs: parsed.requirementTabs.map((tab) => ({
      tabName: tab.tabName,
      title: tab.title,
      items: tab.items,
      guides: [],
    })),
    periods: parsed.periods.map((period) => ({
      name: period.name,
      modalities: period.modalities.map((modality) => ({
        modality: modality.modality,
        requestWindow: modality.requestWindow,
        responseWindow: modality.responseWindow,
        enabledFrom: modality.enabledFrom ?? null,
        enabledTo: modality.enabledTo ?? null,
      })),
    })),
    manuals: parsed.manuals,
  };
}

export function mapUtplPortalApiToSeed(rows: UtplPortalApiRow[]): {
  studentTypes: UtplStudentTypeSeed[];
  report: UtplImportReport;
} {
  const buckets = new Map<
    string,
    Map<string, Array<{ row: UtplPortalApiRow; globalIndex: number; hasStudentTypes: boolean }>>
  >();
  const discardedRowDetails: UtplImportReport['discardedRowDetails'] = [];
  const reviewRowDetails: UtplImportReport['reviewRowDetails'] = [];

  rows.forEach((row, globalIndex) => {
    const classification = classifyUtplPortalRow(row);
    if (classification.kind === 'DISCARD') {
      discardedRowDetails.push({
        globalIndex,
        title: row.field_nombre_servicio,
        reason: classification.reason,
      });
      return;
    }

    const types = normalizeTypeCodes(row.field_tipo_estudiante);
    if (types.length === 0) {
      reviewRowDetails.push({
        globalIndex,
        title: row.field_nombre_servicio,
        reason: 'missing-student-type',
      });
      types.push(STUDENT_TYPE_ORDER[0]);
    }

    for (const typeCode of types) {
      if (!buckets.has(typeCode)) buckets.set(typeCode, new Map());
      const categoryMap = buckets.get(typeCode)!;
      const category = row.field_categoria_servicio.trim();
      if (!categoryMap.has(category)) categoryMap.set(category, []);
      categoryMap.get(category)!.push({
        row,
        globalIndex,
        hasStudentTypes: classification.hasStudentTypes,
      });
    }
  });

  const studentTypes: UtplStudentTypeSeed[] = [];
  let expandedPlacements = 0;
  let totalServices = 0;
  let totalCategories = 0;

  for (const [typeIndex, typeCode] of STUDENT_TYPE_ORDER.entries()) {
    const categoryMap = buckets.get(typeCode);
    if (!categoryMap) continue;

    const categories: UtplCategorySeed[] = [];
    let categorySort = 0;

    for (const [categoryName, categoryRows] of categoryMap.entries()) {
      const services = categoryRows.map(({ row, globalIndex, hasStudentTypes }, serviceIndex) => {
        expandedPlacements += 1;
        return mapRowToService(row, typeCode, globalIndex, serviceIndex, hasStudentTypes);
      });

      totalServices += services.length;
      categories.push({
        name: categoryName,
        description: null,
        sortOrder: categorySort++,
        services,
      });
    }

    totalCategories += categories.length;
    studentTypes.push({
      code: typeCode,
      name: STUDENT_TYPE_LABELS[typeCode],
      description: null,
      sortOrder: typeIndex,
      categories,
    });
  }

  return {
    studentTypes,
    report: {
      rawRecords: rows.length,
      expandedPlacements,
      studentTypes: studentTypes.length,
      categories: totalCategories,
      services: totalServices,
      sectionHeaders: 0,
      spacers: 0,
      discardedRows: discardedRowDetails.length,
      reviewRows: reviewRowDetails.length,
      discardedRowDetails,
      reviewRowDetails,
    },
  };
}

export function toUtplServicesJson(studentTypes: UtplStudentTypeSeed[]): UtplServicesJson {
  return {
    studentTypes: studentTypes.map(
      (st): UtplStudentType => ({
        code: st.code,
        name: st.name,
        description: st.description,
        sortOrder: st.sortOrder,
        categories: st.categories.map((cat) => ({
          name: cat.name,
          description: cat.description,
          sortOrder: cat.sortOrder,
          services: cat.services.map(
            (svc): UtplService => ({
              sourceKey: svc.sourceKey,
              sourceRowIndex: svc.sourceRowIndex,
              title: svc.title,
              description: svc.description,
              programs: svc.programs,
              modalityLevel: svc.modalityLevel,
              responseTime: svc.responseTime,
              cost: svc.cost,
              note: svc.note,
              calendarText: svc.calendarText,
              status: svc.status,
              isActive: svc.isActive,
              sortOrder: svc.sortOrder,
              requirements: svc.requirements,
              requirementTabs: svc.requirementTabs,
              periods: svc.periods,
              manuals: svc.manuals,
            }),
          ),
        })),
      }),
    ),
  };
}
