import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type {
  AcademicServicesReadPort,
  AdminDashboardCounts,
  AdminServiceEdit,
  AdminServiceListItem,
  CategoryWithCount,
  PublicPortalCatalog,
} from '@/lib/academic-services/ports/academic-services-read';
import { ProviderNotImplementedError } from '@/lib/academic-services/providers/errors';
import {
  buildCatalogFromSnapshot,
  canonicalizeListName,
  normalizeIncomingItems,
  type MicrosoftListsSnapshot,
} from '@/lib/academic-services/providers/microsoft/catalog-cache';
import {
  EMPTY_MICROSOFT_CATALOG,
  type MicrosoftPrototypeData,
  type MicrosoftPrototypeService,
} from '@/lib/academic-services/providers/microsoft/types';

const PROTOTYPE_MODES = new Set(['prototype', 'fixture', 'mock']);
const FLOW_MODES = new Set(['powerautomate', 'flow', 'direct']);
const FLOW_CACHE_TTL_MS = 30_000;

let flowCache: { data: MicrosoftPrototypeData; cachedAtMs: number } | null = null;
const DEFAULT_FIXTURE_PATH = resolve(process.cwd(), 'data/microsoft-sharepoint-prototype.json');

let prototypeCache: {
  path: string;
  data: MicrosoftPrototypeData;
} | null = null;

function notImplemented(): never {
  throw new ProviderNotImplementedError('microsoft');
}

function getProviderMode() {
  return process.env.MICROSOFT_PROVIDER_MODE?.trim().toLowerCase() ?? '';
}

function isPrototypeMode() {
  return PROTOTYPE_MODES.has(getProviderMode());
}

function isFlowMode() {
  return FLOW_MODES.has(getProviderMode());
}

function coerceCatalog(input: unknown): MicrosoftPrototypeData {
  if (!input || typeof input !== 'object') return EMPTY_MICROSOFT_CATALOG;
  const value = input as Record<string, unknown>;
  return {
    studentTypes: Array.isArray(value.studentTypes)
      ? (value.studentTypes as MicrosoftPrototypeData['studentTypes'])
      : [],
    categories: Array.isArray(value.categories)
      ? (value.categories as MicrosoftPrototypeData['categories'])
      : [],
    services: Array.isArray(value.services)
      ? (value.services as MicrosoftPrototypeData['services'])
      : [],
  };
}

async function loadPrototypeData(): Promise<MicrosoftPrototypeData> {
  const fixturePath = process.env.MICROSOFT_PROTOTYPE_FIXTURE_PATH?.trim() || DEFAULT_FIXTURE_PATH;
  if (prototypeCache?.path === fixturePath) return prototypeCache.data;

  const raw = await readFile(fixturePath, 'utf8');
  const data = coerceCatalog(JSON.parse(raw));
  prototypeCache = { path: fixturePath, data };
  return data;
}

function splitModalityAndLevel(modalityLevel: string | null) {
  if (!modalityLevel) return { modality: null, level: null };
  const normalized = modalityLevel.replace(/\s+/g, ' ').trim();
  if (!normalized) return { modality: null, level: null };

  const [leftRaw, rightRaw] = normalized.split(/—|-/);
  const modality = leftRaw
    ?.replace(/^modalidad\s*(y\s*nivel\s*de\s*estudios?)?\s*:?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const level = rightRaw
    ?.replace(/^nivel\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    modality: modality && modality.length > 0 ? modality : null,
    level: level && level.length > 0 ? level : null,
  };
}

function getCategoryName(data: MicrosoftPrototypeData, categoryId: number) {
  return data.categories.find((category) => category.id === categoryId)?.name ?? null;
}

function mapPrototypeService(
  data: MicrosoftPrototypeData,
  service: MicrosoftPrototypeService,
): AdminServiceEdit {
  const categoryName = getCategoryName(data, service.categoryId);
  const { modality, level } = splitModalityAndLevel(service.modalityLevel);

  return {
    id: service.id,
    categoryId: service.categoryId,
    slug: service.slug,
    title: service.title,
    categoryName,
    description: service.description,
    programs: service.programs,
    modality,
    level,
    modalityLevel: service.modalityLevel,
    responseTime: service.responseTime,
    cost: service.cost,
    note: service.note,
    calendarText: service.calendarText,
    status: service.status,
    isActive: service.isActive,
    requirements: [...service.requirements].sort((a, b) => a.sortOrder - b.sortOrder),
    requirementTabs: [...service.requirementTabs]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((tab) => ({
        tabName: tab.tabName,
        blocks: [
          {
            title: tab.title,
            items: [...tab.items].sort((a, b) => a.sortOrder - b.sortOrder),
            guides: [...tab.guides].sort((a, b) => a.sortOrder - b.sortOrder),
          },
        ],
      })),
    periods: [...service.periods]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((period) => ({
        name: period.name,
        sortOrder: period.sortOrder,
        modalities: [...period.modalities].sort((a, b) => a.sortOrder - b.sortOrder),
      })),
    manuals: [...service.manuals].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

function listAllServicesFromCatalog(data: MicrosoftPrototypeData): AdminServiceListItem[] {
  return data.services.map((service) => ({
    id: service.id,
    title: service.title,
    responseTime: service.responseTime,
    cost: service.cost,
    modalityLevel: service.modalityLevel,
    status: service.status,
    isActive: service.isActive,
    sortOrder: service.sortOrder,
    categoryId: service.categoryId,
    studentTypeId: service.studentTypeId,
  }));
}

function parseFlowResponse(raw: unknown): MicrosoftListsSnapshot {
  if (!raw) return {};

  if (Array.isArray(raw)) {
    const snapshot: MicrosoftListsSnapshot = {};
    const isArrayOfArrays = raw.length > 0 && Array.isArray(raw[0]);

    const allItems: unknown[] = isArrayOfArrays ? (raw as unknown[][]).flat() : raw;

    for (const item of allItems) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      const row = item as Record<string, unknown>;
      const path = row['{Path}'] as string | undefined;
      if (!path) continue;
      const match = path.match(/Lists\/([^/]+)\//);
      if (!match) continue;
      const canonical = canonicalizeListName(match[1]);
      if (!canonical) continue;
      if (!snapshot[canonical]) snapshot[canonical] = [];
      snapshot[canonical]!.push(row);
    }
    return snapshot;
  }

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const snapshot: MicrosoftListsSnapshot = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      const canonical = canonicalizeListName(key);
      if (canonical) snapshot[canonical] = normalizeIncomingItems(value);
    }
    return snapshot;
  }

  return {};
}

function splitConcatenatedArrays(text: string): unknown[] {
  const trimmed = text.trim();
  const parts: unknown[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '[') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === ']') {
      depth--;
      if (depth === 0) {
        try {
          parts.push(JSON.parse(trimmed.slice(start, i + 1)));
        } catch {
          // skip malformed chunk
        }
      }
    }
  }

  return parts;
}

async function loadFromPowerAutomate(): Promise<MicrosoftPrototypeData> {
  if (flowCache && Date.now() - flowCache.cachedAtMs < FLOW_CACHE_TTL_MS) {
    return flowCache.data;
  }

  const url = process.env.MICROSOFT_FLOW_URL?.trim();
  if (!url) throw new Error('MICROSOFT_FLOW_URL is not set');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Power Automate flow returned ${response.status}: ${await response.text()}`);
  }

  const text = await response.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    const parts = splitConcatenatedArrays(text);
    raw = parts;
  }

  const snapshot = parseFlowResponse(raw);
  const data = buildCatalogFromSnapshot(snapshot);
  flowCache = { data, cachedAtMs: Date.now() };
  return data;
}

async function getMicrosoftDataOrThrow() {
  if (isPrototypeMode()) return loadPrototypeData();
  if (isFlowMode()) return loadFromPowerAutomate();
  notImplemented();
}

export const microsoftReadPort: AcademicServicesReadPort = {
  async listStudentTypes() {
    const data = await getMicrosoftDataOrThrow();
    return data.studentTypes;
  },

  async getStudentTypeByCode(code) {
    const data = await getMicrosoftDataOrThrow();
    return (
      data.studentTypes.find((studentType) => studentType.code === code.trim().toUpperCase()) ??
      null
    );
  },

  async listCategoriesWithActiveCounts(studentTypeId) {
    const data = await getMicrosoftDataOrThrow();
    const activeServiceCounts = new Map<number, number>();

    for (const service of data.services) {
      if (service.isActive && service.status === 'published') {
        activeServiceCounts.set(
          service.categoryId,
          (activeServiceCounts.get(service.categoryId) ?? 0) + 1,
        );
      }
    }

    return data.categories
      .filter((category) => category.studentTypeId === studentTypeId && category.isActive)
      .map(
        (category): CategoryWithCount => ({
          id: category.id,
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
          activeServiceCount: activeServiceCounts.get(category.id) ?? 0,
        }),
      );
  },

  async getCategoryForStudentType(studentTypeId, categoryId) {
    const data = await getMicrosoftDataOrThrow();
    const category = data.categories.find(
      (entry) => entry.id === categoryId && entry.studentTypeId === studentTypeId && entry.isActive,
    );
    return category
      ? {
          id: category.id,
          name: category.name,
          description: category.description,
          studentTypeId: category.studentTypeId,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }
      : null;
  },

  async listActiveServicesByCategoryId(categoryId) {
    const data = await getMicrosoftDataOrThrow();
    return data.services
      .filter(
        (service) =>
          service.categoryId === categoryId && service.isActive && service.status === 'published',
      )
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((service) => ({
        id: service.id,
        title: service.title,
        responseTime: service.responseTime,
        cost: service.cost,
        modalityLevel: service.modalityLevel,
        status: service.status,
        isActive: service.isActive,
        sortOrder: service.sortOrder,
      }));
  },

  async getActiveServiceDetail(categoryId, serviceId) {
    const data = await getMicrosoftDataOrThrow();
    const service = data.services.find(
      (entry) =>
        entry.id === serviceId &&
        entry.categoryId === categoryId &&
        entry.isActive &&
        entry.status === 'published',
    );
    return service ? mapPrototypeService(data, service) : null;
  },

  async getPublicPortalCatalog() {
    const data = await getMicrosoftDataOrThrow();
    const services = data.services
      .filter((service) => service.isActive && service.status === 'published')
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((service) => ({
        id: service.id,
        title: service.title,
        responseTime: service.responseTime,
        cost: service.cost,
        modalityLevel: service.modalityLevel,
        status: service.status,
        isActive: service.isActive,
        sortOrder: service.sortOrder,
        categoryId: service.categoryId,
        studentTypeId: service.studentTypeId,
      }));

    return {
      studentTypes: data.studentTypes,
      categories: data.categories
        .filter((category) => category.isActive)
        .map((category) => ({
          id: category.id,
          studentTypeId: category.studentTypeId,
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
        })),
      services,
    } satisfies PublicPortalCatalog;
  },

  async getDashboardCounts() {
    const data = await getMicrosoftDataOrThrow();
    const activeServices = data.services.filter(
      (service) => service.isActive && service.status === 'published',
    ).length;
    const counts: AdminDashboardCounts = {
      studentTypes: data.studentTypes.length,
      categories: data.categories.length,
      services: data.services.length,
      activeServices,
    };
    return counts;
  },

  async listAllCategories() {
    const data = await getMicrosoftDataOrThrow();
    return data.categories.map((category) => {
      const studentType = data.studentTypes.find((entry) => entry.id === category.studentTypeId);
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        studentTypeId: category.studentTypeId,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        studentTypeCode: studentType?.code ?? '',
        studentTypeName: studentType?.name ?? '',
      };
    });
  },

  async listAllServices() {
    const data = await getMicrosoftDataOrThrow();
    return listAllServicesFromCatalog(data);
  },

  async getServiceDetailForAdmin(serviceId) {
    const data = await getMicrosoftDataOrThrow();
    const service = data.services.find((entry) => entry.id === serviceId);
    return service ? mapPrototypeService(data, service) : null;
  },
};
