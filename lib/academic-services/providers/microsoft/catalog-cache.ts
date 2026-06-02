import { EMPTY_MICROSOFT_CATALOG, type MicrosoftPrototypeData } from '@/lib/academic-services/providers/microsoft/types';

type UnknownRecord = Record<string, unknown>;

export type CanonicalListName =
  | 'servicesCatalog'
  | 'studentTypes'
  | 'serviceCategories'
  | 'services'
  | 'serviceRequirements'
  | 'serviceDocumentation'
  | 'servicePeriods'
  | 'serviceManuals';

export type MicrosoftListsSnapshot = Partial<Record<CanonicalListName, UnknownRecord[]>>;

const LIST_ALIASES: Record<string, CanonicalListName> = {
  // Single-list mode (one row per service with JSON columns)
  servicescatalog: 'servicesCatalog',
  servicecatalog: 'servicesCatalog',
  catalogservices: 'servicesCatalog',
  catalogo: 'servicesCatalog',
  servicioscatalogo: 'servicesCatalog',

  // Seven-list mode
  studenttypes: 'studentTypes',
  tiposestudiante: 'studentTypes',
  servicecategories: 'serviceCategories',
  categoriasservicio: 'serviceCategories',
  categories: 'serviceCategories',
  services: 'services',
  servicios: 'services',
  servicerequirements: 'serviceRequirements',
  requisitosservicio: 'serviceRequirements',
  servicedocumentation: 'serviceDocumentation',
  documentacionservicio: 'serviceDocumentation',
  serviceperiods: 'servicePeriods',
  periodosservicio: 'servicePeriods',
  servicemanuals: 'serviceManuals',
  manualesservicio: 'serviceManuals',

  // SharePoint list names with numeric prefix + suffix variants (AA/AAA)
  '1studenttypesaa': 'studentTypes',
  '2servicecategoriesaa': 'serviceCategories',
  '3servicesaa': 'services',
  '4servicerequirementsaa': 'serviceRequirements',
  '5servicedocumentationaa': 'serviceDocumentation',
  '6serviceperiodsaa': 'servicePeriods',
  '7servicemanualsaaa': 'serviceManuals',
};

function normalizeToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function normalizeValue(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function parseJsonUnknown(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseJsonUnknown(value.trim());
    if (Array.isArray(parsed)) return parsed;
    return [];
  }
  return [];
}

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as UnknownRecord;
}

function rowEntries(row: UnknownRecord): Array<[string, unknown]> {
  return Object.entries(row).map(([key, value]) => [normalizeToken(key), value]);
}

function getField(row: UnknownRecord, candidates: string[]): unknown {
  for (const candidate of candidates) {
    if (candidate in row) return row[candidate];
  }

  const entries = rowEntries(row);
  for (const candidate of candidates) {
    const token = normalizeToken(candidate);
    const matched = entries.find(([key]) => key === token);
    if (matched) return matched[1];
  }

  return null;
}

function toBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const token = normalizeToken(value);
    if (['1', 'true', 'yes', 'si', 'active', 'activo', 'published'].includes(token)) return true;
    if (['0', 'false', 'no', 'inactive', 'inactivo', 'draft'].includes(token)) return false;
  }
  return fallback;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toStatus(value: unknown): 'draft' | 'published' | 'needs_review' {
  const token = normalizeToken(normalizeValue(value) ?? '');
  if (token === 'published' || token === 'publicado') return 'published';
  if (token === 'needsreview' || token === 'revision' || token === 'needs_review') return 'needs_review';
  return 'draft';
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function isLikelySlugCode(value: unknown): boolean {
  const normalized = normalizeValue(value);
  if (!normalized) return false;
  const token = normalized.trim();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(token);
}

function parsePrograms(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((entry) => normalizeValue(entry)).filter(Boolean) as string[];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      const parsed = parseJsonUnknown(trimmed);
      if (Array.isArray(parsed)) return parsed.map((entry) => normalizeValue(entry)).filter(Boolean) as string[];
    }
    return trimmed
      .split(/[,;\n]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function parseRequirements(value: unknown): Array<{ text: string; sortOrder: number }> {
  const list = asArray(value);
  const parsed = list
    .map((entry, index) => {
      const row = asRecord(entry);
      if (!row) return null;
      const text = normalizeValue(getField(row, ['text', 'requirement', 'requisito']));
      if (!text) return null;
      return {
        text,
        sortOrder: toNumber(getField(row, ['sortOrder', 'sort', 'orden']), index + 1),
      };
    })
    .filter(Boolean) as Array<{ text: string; sortOrder: number }>;

  return parsed.sort((a, b) => a.sortOrder - b.sortOrder);
}

function parseRequirementTabs(value: unknown): Array<{
  tabName: string;
  title: string | null;
  sortOrder: number;
  items: Array<{ text: string; pdfUrl: string | null; sortOrder: number }>;
  guides: Array<{ label: string; url: string; sortOrder: number }>;
}> {
  const tabs = asArray(value);
  const parsed = tabs
    .map((entry, tabIndex) => {
      const tabRow = asRecord(entry);
      if (!tabRow) return null;
      const tabName = normalizeValue(getField(tabRow, ['tabName', 'tab', 'pestana', 'pestaña']));
      if (!tabName) return null;
      const blocks = asArray(getField(tabRow, ['blocks', 'block', 'bloques']));
      const flatItems: Array<{ text: string; pdfUrl: string | null; sortOrder: number }> = [];
      const flatGuides: Array<{ label: string; url: string; sortOrder: number }> = [];
      let title: string | null = null;

      for (const blockEntry of blocks) {
        const blockRow = asRecord(blockEntry);
        if (!blockRow) continue;
        if (!title) {
          title = normalizeValue(getField(blockRow, ['title', 'blockTitle', 'titulo']));
        }

        const items = asArray(getField(blockRow, ['items']));
        for (const [itemIndex, itemEntry] of items.entries()) {
          const itemRow = asRecord(itemEntry);
          if (!itemRow) continue;
          const text = normalizeValue(getField(itemRow, ['text', 'itemText']));
          if (!text) continue;
          flatItems.push({
            text,
            pdfUrl: normalizeValue(getField(itemRow, ['pdfUrl', 'url', 'itemPdfUrl'])),
            sortOrder: toNumber(getField(itemRow, ['sortOrder', 'sort', 'orden']), itemIndex + 1),
          });
        }

        const guides = asArray(getField(blockRow, ['guides']));
        for (const [guideIndex, guideEntry] of guides.entries()) {
          const guideRow = asRecord(guideEntry);
          if (!guideRow) continue;
          const label = normalizeValue(getField(guideRow, ['label']));
          const url = normalizeValue(getField(guideRow, ['url']));
          if (!label || !url) continue;
          flatGuides.push({
            label,
            url,
            sortOrder: toNumber(getField(guideRow, ['sortOrder', 'sort', 'orden']), guideIndex + 1),
          });
        }
      }

      return {
        tabName,
        title,
        sortOrder: toNumber(getField(tabRow, ['sortOrder', 'sort', 'orden']), tabIndex + 1),
        items: flatItems.sort((a, b) => a.sortOrder - b.sortOrder),
        guides: flatGuides.sort((a, b) => a.sortOrder - b.sortOrder),
      };
    })
    .filter(Boolean) as Array<{
    tabName: string;
    title: string | null;
    sortOrder: number;
    items: Array<{ text: string; pdfUrl: string | null; sortOrder: number }>;
    guides: Array<{ label: string; url: string; sortOrder: number }>;
  }>;

  return parsed.sort((a, b) => a.sortOrder - b.sortOrder);
}

function parsePeriods(value: unknown): Array<{
  name: string;
  sortOrder: number;
  modalities: Array<{
    modality: string;
    requestWindow: string | null;
    responseWindow: string | null;
    enabledFrom: string | null;
    enabledTo: string | null;
    sortOrder: number;
  }>;
}> {
  const periods = asArray(value);
  const parsed = periods
    .map((entry, periodIndex) => {
      const row = asRecord(entry);
      if (!row) return null;
      const name = normalizeValue(getField(row, ['name', 'periodName', 'periodo']));
      if (!name) return null;
      const modalities = asArray(getField(row, ['modalities']));
      const parsedModalities = modalities
        .map((modalityEntry, modalityIndex) => {
          const modalityRow = asRecord(modalityEntry);
          if (!modalityRow) return null;
          const modality = normalizeValue(getField(modalityRow, ['modality', 'modalidad']));
          if (!modality) return null;
          return {
            modality,
            requestWindow: normalizeValue(getField(modalityRow, ['requestWindow', 'solicitud'])),
            responseWindow: normalizeValue(getField(modalityRow, ['responseWindow', 'respuesta'])),
            enabledFrom: normalizeValue(getField(modalityRow, ['enabledFrom', 'desde'])),
            enabledTo: normalizeValue(getField(modalityRow, ['enabledTo', 'hasta'])),
            sortOrder: toNumber(getField(modalityRow, ['sortOrder', 'sort', 'orden']), modalityIndex + 1),
          };
        })
        .filter(Boolean) as Array<{
        modality: string;
        requestWindow: string | null;
        responseWindow: string | null;
        enabledFrom: string | null;
        enabledTo: string | null;
        sortOrder: number;
      }>;

      return {
        name,
        sortOrder: toNumber(getField(row, ['sortOrder', 'sort', 'orden']), periodIndex + 1),
        modalities: parsedModalities.sort((a, b) => a.sortOrder - b.sortOrder),
      };
    })
    .filter(Boolean) as Array<{
    name: string;
    sortOrder: number;
    modalities: Array<{
      modality: string;
      requestWindow: string | null;
      responseWindow: string | null;
      enabledFrom: string | null;
      enabledTo: string | null;
      sortOrder: number;
    }>;
  }>;

  return parsed.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** SharePoint connector rows use Title + field_1..field_N instead of semantic column names. */
function isPowerAutomateSharePointRow(row: UnknownRecord): boolean {
  const hasTitle = normalizeValue(getField(row, ['Title', 'title'])) !== null;
  const hasField1 = getField(row, ['field_1', 'field1']) !== null;
  const hasSemanticCode = normalizeValue(getField(row, ['code', 'studentTypeCode', 'serviceCode', 'categoryCode'])) !== null;
  return hasTitle && hasField1 && !hasSemanticCode;
}

function normalizeSharePointListRow(
  listName: CanonicalListName,
  row: UnknownRecord,
): UnknownRecord {
  if (!isPowerAutomateSharePointRow(row)) return row;

  const title = normalizeValue(getField(row, ['Title', 'title']));
  const field1 = getField(row, ['field_1', 'field1']);
  const field2 = getField(row, ['field_2', 'field2']);
  const field3 = getField(row, ['field_3', 'field3']);
  const field4 = getField(row, ['field_4', 'field4']);
  const field5 = getField(row, ['field_5', 'field5']);

  switch (listName) {
    case 'studentTypes':
      return {
        ...row,
        code: getField(row, ['code', 'studentTypeCode']) ?? title,
        name: getField(row, ['name', 'studentTypeName']) ?? field1,
        description: getField(row, ['description']) ?? field2,
        sortOrder: getField(row, ['sortOrder']) ?? field3,
        isActive: getField(row, ['isActive']) ?? field4,
      };
    case 'serviceCategories':
      return {
        ...row,
        code: getField(row, ['code', 'slug', 'categoryCode']) ?? title,
        name: getField(row, ['name', 'categoryName']) ?? field1,
        description: getField(row, ['description']) ?? field2,
        // SharePoint actual layout: field_3=studentTypeCode, field_4=sortOrder, field_5=isActive
        studentTypeCode: getField(row, ['studentTypeCode', 'typeCode']) ?? field3,
        sortOrder: getField(row, ['sortOrder']) ?? field4,
        isActive: getField(row, ['isActive']) ?? field5,
      };
    case 'services': {
      const field6 = getField(row, ['field_6', 'field6']);
      const field7 = getField(row, ['field_7', 'field7']);
      const field8 = getField(row, ['field_8', 'field8']);
      const field9 = getField(row, ['field_9', 'field9']);
      const field10 = getField(row, ['field_10', 'field10']);
      const field11 = getField(row, ['field_11', 'field11']);
      const field12 = getField(row, ['field_12', 'field12']);
      const field13 = getField(row, ['field_13', 'field13']);
      const semanticCategoryCode = getField(row, ['categoryCode', 'serviceCategoryCode', 'categorySlug']);
      const semanticTitle = getField(row, ['serviceTitle']);
      const categoryFromFields = (() => {
        if (isLikelySlugCode(field1) && !isLikelySlugCode(field2)) return field1;
        if (isLikelySlugCode(field2) && !isLikelySlugCode(field1)) return field2;
        return field1 ?? field2;
      })();
      const titleFromFields = categoryFromFields === field2 ? field1 : field2;
      return {
        ...row,
        code: getField(row, ['code', 'serviceCode', 'sourceKey']) ?? title,
        serviceTitle:
          normalizeValue(semanticTitle) ??
          normalizeValue(titleFromFields) ??
          normalizeValue(field1) ??
          normalizeValue(field2) ??
          title,
        categoryCode:
          semanticCategoryCode ?? categoryFromFields,
        description: getField(row, ['description']) ?? field3,
        modality: getField(row, ['modality']) ?? field4,
        level: getField(row, ['level']) ?? field5,
        responseTime: getField(row, ['responseTime']) ?? field6,
        cost: getField(row, ['cost']) ?? field7,
        status: getField(row, ['status']) ?? field8,
        sortOrder: getField(row, ['sortOrder']) ?? field9,
        isActive: getField(row, ['isActive']) ?? field10,
        programs: getField(row, ['programs']) ?? field11,
        note: getField(row, ['note']) ?? field12,
        calendarText: getField(row, ['calendarText']) ?? field13,
      };
    }
    case 'servicePeriods': {
      const field5 = getField(row, ['field_5', 'field5']);
      const field6 = getField(row, ['field_6', 'field6']);
      return {
        ...row,
        serviceCode: getField(row, ['serviceCode', 'code']) ?? title,
        periodName: getField(row, ['periodName', 'name']) ?? field1,
        modality: getField(row, ['modality', 'modalidad']) ?? field2,
        requestWindow: getField(row, ['requestWindow']) ?? field3,
        responseWindow: getField(row, ['responseWindow']) ?? field4,
        enabledFrom: getField(row, ['enabledFrom']) ?? field5,
        enabledTo: getField(row, ['enabledTo']) ?? field6,
      };
    }
    case 'serviceDocumentation': {
      const field5 = getField(row, ['field_5', 'field5']);
      const field6 = getField(row, ['field_6', 'field6']);
      const field7 = getField(row, ['field_7', 'field7']);
      return {
        ...row,
        serviceCode: getField(row, ['serviceCode', 'code']) ?? title,
        tabName: getField(row, ['tabName', 'tab']) ?? field1,
        blockTitle: getField(row, ['blockTitle', 'title']) ?? field2,
        itemText: getField(row, ['itemText', 'text']) ?? field3,
        itemPdfUrl: getField(row, ['itemPdfUrl', 'pdfUrl']) ?? field4,
        tabSortOrder: getField(row, ['tabSortOrder', 'sortOrder']) ?? field5,
        guideLabel: getField(row, ['guideLabel', 'label']) ?? field6,
        guideUrl: getField(row, ['guideUrl', 'url']) ?? field7,
      };
    }
    case 'serviceRequirements':
      return {
        ...row,
        serviceCode: getField(row, ['serviceCode', 'code']) ?? title,
        text: getField(row, ['text', 'requirement']) ?? field1,
        sortOrder: getField(row, ['sortOrder']) ?? field2 ?? field3,
      };
    case 'serviceManuals': {
      const text = normalizeValue(field1);
      const looksLikeRequirement =
        !!title &&
        normalizeToken(title).startsWith('srv') &&
        !!text &&
        !/^https?:\/\//i.test(text);
      if (looksLikeRequirement) {
        return {
          ...row,
          serviceCode: title,
          text: field1,
          sortOrder: getField(row, ['sortOrder']) ?? field2 ?? field3,
        };
      }
      return {
        ...row,
        serviceCode: getField(row, ['serviceCode', 'code']) ?? title,
        label: getField(row, ['label', 'manualLabel']) ?? field1,
        url: getField(row, ['url', 'link']) ?? field2,
        sortOrder: getField(row, ['sortOrder']) ?? field3,
      };
    }
    default:
      return row;
  }
}

function normalizeSharePointSnapshot(snapshot: MicrosoftListsSnapshot): MicrosoftListsSnapshot {
  const normalized: MicrosoftListsSnapshot = {};
  for (const [listName, rows] of Object.entries(snapshot) as Array<
    [CanonicalListName, UnknownRecord[] | undefined]
  >) {
    if (!rows?.length) continue;
    normalized[listName] = rows.map((row) => normalizeSharePointListRow(listName, row));
  }
  return normalized;
}

function collectRequirementRows(snapshot: MicrosoftListsSnapshot): UnknownRecord[] {
  const explicit = (snapshot.serviceRequirements ?? []).map((row) =>
    normalizeSharePointListRow('serviceRequirements', row),
  );
  const fromMislabeledManuals = (snapshot.serviceManuals ?? [])
    .filter((row) => {
      const normalized = normalizeSharePointListRow('serviceManuals', row);
      return normalizeValue(getField(normalized, ['text', 'requirement'])) !== null;
    })
    .map((row) => normalizeSharePointListRow('serviceManuals', row));

  return [...explicit, ...fromMislabeledManuals];
}

function collectManualRows(snapshot: MicrosoftListsSnapshot): UnknownRecord[] {
  return (snapshot.serviceManuals ?? [])
    .filter((row) => {
      const normalized = normalizeSharePointListRow('serviceManuals', row);
      return (
        normalizeValue(getField(normalized, ['url', 'link'])) !== null &&
        normalizeValue(getField(normalized, ['text', 'requirement'])) === null
      );
    })
    .map((row) => normalizeSharePointListRow('serviceManuals', row));
}

function parseManuals(value: unknown): Array<{ label: string; url: string; sortOrder: number }> {
  const manuals = asArray(value);
  const parsed = manuals
    .map((entry, index) => {
      const row = asRecord(entry);
      if (!row) return null;
      const label = normalizeValue(getField(row, ['label', 'manual', 'titulo']));
      const url = normalizeValue(getField(row, ['url', 'link']));
      if (!label || !url) return null;
      return {
        label,
        url,
        sortOrder: toNumber(getField(row, ['sortOrder', 'sort', 'orden']), index + 1),
      };
    })
    .filter(Boolean) as Array<{ label: string; url: string; sortOrder: number }>;

  return parsed.sort((a, b) => a.sortOrder - b.sortOrder);
}

function buildFromSingleList(rows: UnknownRecord[]): MicrosoftPrototypeData {
  if (rows.length === 0) return EMPTY_MICROSOFT_CATALOG;

  const studentTypeMap = new Map<string, { id: number; code: string; name: string; description: string | null; sortOrder: number; isActive: boolean }>();
  const categoryMap = new Map<string, { id: number; name: string; description: string | null; studentTypeId: number; sortOrder: number; isActive: boolean }>();
  const serviceRows: Array<{
    row: UnknownRecord;
    key: string;
    id: number;
    sortOrder: number;
    title: string;
    categoryId: number;
    studentTypeId: number;
  }> = [];

  let studentTypeIdCounter = 1;
  let categoryIdCounter = 1;
  let serviceIdCounter = 1;

  for (const row of rows) {
    const studentTypeCode = normalizeValue(getField(row, ['studentTypeCode', 'typeCode', 'tipoEstudianteCodigo'])) ?? 'GENERAL';
    const studentTypeName = normalizeValue(getField(row, ['studentTypeName', 'studentType', 'tipoEstudianteNombre'])) ?? studentTypeCode;
    const studentTypeKey = normalizeToken(studentTypeCode);

    if (!studentTypeMap.has(studentTypeKey)) {
      studentTypeMap.set(studentTypeKey, {
        id: studentTypeIdCounter++,
        code: studentTypeCode.toUpperCase(),
        name: studentTypeName,
        description: normalizeValue(getField(row, ['studentTypeDescription', 'typeDescription'])),
        sortOrder: toNumber(getField(row, ['studentTypeSortOrder', 'typeSortOrder']), studentTypeMap.size + 1),
        isActive: true,
      });
    }

    const studentType = studentTypeMap.get(studentTypeKey)!;
    const categorySlug = normalizeValue(getField(row, ['categorySlug', 'categoryCode', 'categoriaCodigo'])) ?? slugify(normalizeValue(getField(row, ['categoryName', 'category'])) ?? 'categoria');
    const categoryName = normalizeValue(getField(row, ['categoryName', 'category', 'categoriaNombre'])) ?? categorySlug;
    const categoryKey = `${studentType.id}:${normalizeToken(categorySlug)}`;

    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, {
        id: categoryIdCounter++,
        name: categoryName,
        description: normalizeValue(getField(row, ['categoryDescription'])),
        studentTypeId: studentType.id,
        sortOrder: toNumber(getField(row, ['categorySortOrder', 'sortOrderCategory']), categoryMap.size + 1),
        isActive: true,
      });
    }

    const category = categoryMap.get(categoryKey)!;
    const title =
      normalizeValue(getField(row, ['serviceTitle', 'title', 'Title'])) ??
      normalizeValue(getField(row, ['name'])) ??
      'Servicio sin título';

    const idCandidate = toNumber(getField(row, ['serviceId', 'ID', 'Id']), 0);
    const id = idCandidate > 0 ? idCandidate : serviceIdCounter++;
    const sortOrder = toNumber(getField(row, ['sortOrder', 'serviceSortOrder']), serviceRows.length + 1);
    const key =
      normalizeValue(getField(row, ['sourceKey', 'serviceCode', 'serviceSlug'])) ??
      `${category.id}-${slugify(title)}-${id}`;

    serviceRows.push({
      row,
      key,
      id,
      sortOrder,
      title,
      categoryId: category.id,
      studentTypeId: studentType.id,
    });
  }

  const services = serviceRows
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ row, key, id, sortOrder, title, categoryId, studentTypeId }) => {
      const requirementTabs = parseRequirementTabs(getField(row, ['requirementTabsJson', 'requirementTabs']));
      const modality = normalizeValue(getField(row, ['modality']));
      const level = normalizeValue(getField(row, ['level']));
      const modalityLevelRaw = normalizeValue(getField(row, ['modalityLevel']));
      const modalityLevel = modalityLevelRaw ?? (modality || level ? `Modalidad: ${modality ?? '-'} - Nivel: ${level ?? '-'}` : null);

      return {
        id,
        categoryId,
        studentTypeId,
        slug:
          normalizeValue(getField(row, ['serviceSlug', 'slug'])) ??
          slugify(title),
        title,
        responseTime: normalizeValue(getField(row, ['responseTime'])),
        cost: normalizeValue(getField(row, ['cost'])),
        modalityLevel,
        status: toStatus(getField(row, ['status'])),
        isActive: toBoolean(getField(row, ['isActive']), true),
        sortOrder,
        description: normalizeValue(getField(row, ['description'])),
        programs: parsePrograms(getField(row, ['programsJson', 'programs'])),
        note: normalizeValue(getField(row, ['note'])),
        calendarText: normalizeValue(getField(row, ['calendarText'])),
        requirements: parseRequirements(getField(row, ['requirementsJson', 'requirements'])),
        requirementTabs,
        periods: parsePeriods(getField(row, ['periodsJson', 'periods'])),
        manuals: parseManuals(getField(row, ['manualsJson', 'manuals'])),
        sourceKey: key,
      };
    });

  return {
    studentTypes: [...studentTypeMap.values()]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ id, code, name, description, sortOrder, isActive }) => ({
        id,
        code,
        name,
        description,
        sortOrder,
        isActive,
      })),
    categories: [...categoryMap.values()]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ id, name, description, studentTypeId, sortOrder, isActive }) => ({
        id,
        name,
        description,
        studentTypeId,
        sortOrder,
        isActive,
      })),
    services: services.map(({ sourceKey: _sourceKey, ...service }) => service),
  };
}

function buildFromSevenLists(snapshot: MicrosoftListsSnapshot): MicrosoftPrototypeData {
  const normalizedSnapshot = normalizeSharePointSnapshot(snapshot);
  const studentTypeRows = normalizedSnapshot.studentTypes ?? [];
  const categoryRows = normalizedSnapshot.serviceCategories ?? [];
  const serviceRows = normalizedSnapshot.services ?? [];
  const requirementRows = collectRequirementRows(normalizedSnapshot);
  const documentationRows = normalizedSnapshot.serviceDocumentation ?? [];
  const periodRows = normalizedSnapshot.servicePeriods ?? [];
  const manualRows = collectManualRows(normalizedSnapshot);

  if (studentTypeRows.length === 0) {
    return EMPTY_MICROSOFT_CATALOG;
  }

  const studentTypes = studentTypeRows.map((row, index) => ({
    id: toNumber(getField(row, ['id', 'ID']), index + 1),
    code: (
      normalizeValue(getField(row, ['code', 'studentTypeCode', 'Title', 'title'])) ?? `TYPE${index + 1}`
    ).toUpperCase(),
    name:
      normalizeValue(getField(row, ['name', 'studentTypeName', 'field_1', 'field1'])) ??
      `Tipo ${index + 1}`,
    description: normalizeValue(getField(row, ['description'])),
    sortOrder: toNumber(getField(row, ['sortOrder']), index + 1),
    isActive: toBoolean(getField(row, ['isActive']), true),
  }));

  const studentTypeByCode = new Map(studentTypes.map((entry) => [normalizeToken(entry.code), entry]));

  const categories = categoryRows
    .map((row, index) => {
      const studentTypeCode = normalizeValue(getField(row, ['studentTypeCode', 'typeCode']));
      const studentTypeName = normalizeValue(getField(row, ['studentTypeName']));
      const byCode = studentTypeCode ? studentTypeByCode.get(normalizeToken(studentTypeCode)) : null;
      const byName = studentTypeName
        ? studentTypes.find((entry) => normalizeToken(entry.name) === normalizeToken(studentTypeName))
        : null;
      const studentType = byCode ?? byName;
      if (!studentType) return null;

      return {
        id: toNumber(getField(row, ['id', 'ID']), index + 1),
        name: normalizeValue(getField(row, ['name', 'categoryName'])) ?? `Categoría ${index + 1}`,
        description: normalizeValue(getField(row, ['description'])),
        studentTypeId: studentType.id,
        sortOrder: toNumber(getField(row, ['sortOrder']), index + 1),
        isActive: toBoolean(getField(row, ['isActive']), true),
        categoryCode:
          normalizeValue(getField(row, ['code', 'slug', 'categoryCode'])) ??
          slugify(normalizeValue(getField(row, ['name', 'categoryName'])) ?? `categoria-${index + 1}`),
      };
    })
    .filter(Boolean) as Array<{
    id: number;
    name: string;
    description: string | null;
    studentTypeId: number;
    sortOrder: number;
    isActive: boolean;
    categoryCode: string;
  }>;

  const categoryByCode = new Map(categories.map((entry) => [normalizeToken(entry.categoryCode), entry]));

  const serviceByCode = new Map<
    string,
    {
      id: number;
      title: string;
      responseTime: string | null;
      cost: string | null;
      modalityLevel: string | null;
      status: 'draft' | 'published' | 'needs_review';
      isActive: boolean;
      sortOrder: number;
      categoryId: number;
      studentTypeId: number;
      slug: string;
      description: string | null;
      programs: string[];
      note: string | null;
      calendarText: string | null;
      requirements: Array<{ text: string; sortOrder: number }>;
      requirementTabs: Array<{
        tabName: string;
        title: string | null;
        sortOrder: number;
        items: Array<{ text: string; pdfUrl: string | null; sortOrder: number }>;
        guides: Array<{ label: string; url: string; sortOrder: number }>;
      }>;
      periods: Array<{
        name: string;
        sortOrder: number;
        modalities: Array<{
          modality: string;
          requestWindow: string | null;
          responseWindow: string | null;
          enabledFrom: string | null;
          enabledTo: string | null;
          sortOrder: number;
        }>;
      }>;
      manuals: Array<{ label: string; url: string; sortOrder: number }>;
    }
  >();

  for (const [index, row] of serviceRows.entries()) {
    const categoryCode = normalizeValue(getField(row, ['categoryCode', 'serviceCategoryCode', 'categorySlug']));
    const categoryName = normalizeValue(getField(row, ['categoryName']));
    const byCode = categoryCode ? categoryByCode.get(normalizeToken(categoryCode)) : null;
    const byName = categoryName
      ? categories.find((entry) => normalizeToken(entry.name) === normalizeToken(categoryName))
      : null;
    const category = byCode ?? byName;
    if (!category) continue;

    const title =
      normalizeValue(getField(row, ['serviceTitle', 'title', 'name'])) ??
      normalizeValue(getField(row, ['Title'])) ??
      `Servicio ${index + 1}`;
    const code =
      normalizeValue(getField(row, ['code', 'serviceCode', 'sourceKey'])) ??
      slugify(title);

    const id = toNumber(getField(row, ['id', 'ID']), index + 1);
    const modality = normalizeValue(getField(row, ['modality']));
    const level = normalizeValue(getField(row, ['level']));
    const modalityLevelRaw = normalizeValue(getField(row, ['modalityLevel']));
    const modalityLevel = modalityLevelRaw ?? (modality || level ? `Modalidad: ${modality ?? '-'} - Nivel: ${level ?? '-'}` : null);

    serviceByCode.set(normalizeToken(code), {
      id,
      title,
      responseTime: normalizeValue(getField(row, ['responseTime'])),
      cost: normalizeValue(getField(row, ['cost'])),
      modalityLevel,
      status: toStatus(getField(row, ['status'])),
      isActive: toBoolean(getField(row, ['isActive']), true),
      sortOrder: toNumber(getField(row, ['sortOrder']), index + 1),
      categoryId: category.id,
      studentTypeId: category.studentTypeId,
      slug: normalizeValue(getField(row, ['slug', 'serviceSlug'])) ?? slugify(title),
      description: normalizeValue(getField(row, ['description'])),
      programs: parsePrograms(getField(row, ['programs', 'programsJson'])),
      note: normalizeValue(getField(row, ['note'])),
      calendarText: normalizeValue(getField(row, ['calendarText'])),
      requirements: [],
      requirementTabs: [],
      periods: [],
      manuals: [],
    });
  }

  for (const row of requirementRows) {
    const serviceCode = normalizeValue(getField(row, ['serviceCode', 'code']));
    if (!serviceCode) continue;
    const service = serviceByCode.get(normalizeToken(serviceCode));
    if (!service) continue;
    const text = normalizeValue(getField(row, ['text', 'requirement']));
    if (!text) continue;
    service.requirements.push({
      text,
      sortOrder: toNumber(getField(row, ['sortOrder']), service.requirements.length + 1),
    });
  }

  const docsByServiceTabBlock = new Map<
    string,
    {
      serviceCode: string;
      tabName: string;
      title: string | null;
      sortOrder: number;
      items: Array<{ text: string; pdfUrl: string | null; sortOrder: number }>;
      guides: Array<{ label: string; url: string; sortOrder: number }>;
    }
  >();

  for (const row of documentationRows) {
    const serviceCode = normalizeValue(getField(row, ['serviceCode', 'code']));
    if (!serviceCode) continue;
    const tabName = normalizeValue(getField(row, ['tabName', 'tab'])) ?? 'General';
    const blockTitle = normalizeValue(getField(row, ['blockTitle', 'title']));
    const tabSortOrder = toNumber(getField(row, ['tabSortOrder', 'sortOrder']), 1);
    const key = `${normalizeToken(serviceCode)}|${normalizeToken(tabName)}|${normalizeToken(blockTitle ?? '')}`;

    if (!docsByServiceTabBlock.has(key)) {
      docsByServiceTabBlock.set(key, {
        serviceCode,
        tabName,
        title: blockTitle,
        sortOrder: tabSortOrder,
        items: [],
        guides: [],
      });
    }

    const group = docsByServiceTabBlock.get(key)!;
    const itemText = normalizeValue(getField(row, ['itemText', 'text']));
    if (itemText) {
      group.items.push({
        text: itemText,
        pdfUrl: normalizeValue(getField(row, ['itemPdfUrl', 'pdfUrl'])),
        sortOrder: toNumber(getField(row, ['itemSortOrder', 'sortOrder']), group.items.length + 1),
      });
    }

    const guideLabel = normalizeValue(getField(row, ['guideLabel', 'label']));
    const guideUrl = normalizeValue(getField(row, ['guideUrl', 'url']));
    if (guideLabel && guideUrl) {
      group.guides.push({
        label: guideLabel,
        url: guideUrl,
        sortOrder: toNumber(getField(row, ['guideSortOrder', 'sortOrder']), group.guides.length + 1),
      });
    }
  }

  for (const group of docsByServiceTabBlock.values()) {
    const service = serviceByCode.get(normalizeToken(group.serviceCode));
    if (!service) continue;
    service.requirementTabs.push({
      tabName: group.tabName,
      title: group.title,
      sortOrder: group.sortOrder,
      items: group.items.sort((a, b) => a.sortOrder - b.sortOrder),
      guides: group.guides.sort((a, b) => a.sortOrder - b.sortOrder),
    });
  }

  const periodsByServicePeriod = new Map<
    string,
    {
      serviceCode: string;
      name: string;
      sortOrder: number;
      modalities: Array<{
        modality: string;
        requestWindow: string | null;
        responseWindow: string | null;
        enabledFrom: string | null;
        enabledTo: string | null;
        sortOrder: number;
      }>;
    }
  >();

  for (const row of periodRows) {
    const serviceCode = normalizeValue(getField(row, ['serviceCode', 'code']));
    if (!serviceCode) continue;
    const periodName = normalizeValue(getField(row, ['periodName', 'name'])) ?? 'Periodo';
    const key = `${normalizeToken(serviceCode)}|${normalizeToken(periodName)}`;
    if (!periodsByServicePeriod.has(key)) {
      periodsByServicePeriod.set(key, {
        serviceCode,
        name: periodName,
        sortOrder: toNumber(getField(row, ['periodSortOrder', 'sortOrder']), periodsByServicePeriod.size + 1),
        modalities: [],
      });
    }

    const period = periodsByServicePeriod.get(key)!;
    const modality = normalizeValue(getField(row, ['modality', 'modalidad']));
    if (!modality) continue;
    period.modalities.push({
      modality,
      requestWindow: normalizeValue(getField(row, ['requestWindow'])),
      responseWindow: normalizeValue(getField(row, ['responseWindow'])),
      enabledFrom: normalizeValue(getField(row, ['enabledFrom'])),
      enabledTo: normalizeValue(getField(row, ['enabledTo'])),
      sortOrder: toNumber(getField(row, ['modalitySortOrder', 'sortOrder']), period.modalities.length + 1),
    });
  }

  for (const period of periodsByServicePeriod.values()) {
    const service = serviceByCode.get(normalizeToken(period.serviceCode));
    if (!service) continue;
    service.periods.push({
      name: period.name,
      sortOrder: period.sortOrder,
      modalities: period.modalities.sort((a, b) => a.sortOrder - b.sortOrder),
    });
  }

  for (const row of manualRows) {
    const serviceCode = normalizeValue(getField(row, ['serviceCode', 'code']));
    if (!serviceCode) continue;
    const service = serviceByCode.get(normalizeToken(serviceCode));
    if (!service) continue;
    const label = normalizeValue(getField(row, ['label', 'manualLabel']));
    const url = normalizeValue(getField(row, ['url']));
    if (!label || !url) continue;
    service.manuals.push({
      label,
      url,
      sortOrder: toNumber(getField(row, ['sortOrder']), service.manuals.length + 1),
    });
  }

  const services = [...serviceByCode.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((service) => ({
      ...service,
      requirements: service.requirements.sort((a, b) => a.sortOrder - b.sortOrder),
      requirementTabs: service.requirementTabs.sort((a, b) => a.sortOrder - b.sortOrder),
      periods: service.periods.sort((a, b) => a.sortOrder - b.sortOrder),
      manuals: service.manuals.sort((a, b) => a.sortOrder - b.sortOrder),
    }));

  return {
    studentTypes: studentTypes.sort((a, b) => a.sortOrder - b.sortOrder),
    categories: categories
      .map(({ categoryCode: _categoryCode, ...rest }) => rest)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    services,
  };
}

export function canonicalizeListName(name: string | null | undefined): CanonicalListName | null {
  if (!name) return null;
  const normalized = normalizeToken(name);
  return LIST_ALIASES[normalized] ?? null;
}

export function normalizeIncomingItems(input: unknown): UnknownRecord[] {
  const rows = asArray(input);
  return rows.map((entry) => asRecord(entry)).filter(Boolean) as UnknownRecord[];
}

export function mergeSnapshot(
  snapshot: MicrosoftListsSnapshot,
  listName: CanonicalListName,
  items: UnknownRecord[],
): MicrosoftListsSnapshot {
  return {
    ...snapshot,
    [listName]: items,
  };
}

export function buildCatalogFromSnapshot(snapshot: MicrosoftListsSnapshot): MicrosoftPrototypeData {
  const singleListRows = snapshot.servicesCatalog ?? [];
  if (singleListRows.length > 0) {
    return buildFromSingleList(singleListRows);
  }
  return buildFromSevenLists(snapshot);
}
