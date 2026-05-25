'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { saveServiceAction } from '@/app/administrativo/actions';
import {
  ADMIN_FIELD_CLASS,
  ADMIN_SELECT_CLASS,
  ADMIN_SHEET_TABS_LIST_CLASS,
  ADMIN_TABS_LIST_CLASS,
  ADMIN_TABS_TRIGGER_CLASS,
} from '@/components/administrativo/admin-tab-styles';
import {
  clearInvalidMessage,
  GENERIC_FORM_ERROR_MESSAGE,
  getControlKey,
  setGenericInvalidMessage,
} from '@/components/administrativo/form-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { AdminServiceEdit } from '@/lib/academic-services/ports/academic-services-read';
import type { StudentTypeSummary } from '@/lib/academic-services/ports/academic-services-read';
import { cn } from '@/lib/utils';

type CategoryRow = {
  id: number;
  name: string;
  studentTypeId: number;
};

type RequirementRow = {
  id: string;
  text: string;
};

type ManualRow = {
  id: string;
  label: string;
  url: string;
};

type DocItemRow = {
  id: string;
  text: string;
  pdfUrl: string;
};

type GuideRow = {
  id: string;
  label: string;
  url: string;
};

type DocBlockRow = {
  id: string;
  title: string;
  items: DocItemRow[];
  guides: GuideRow[];
};

type DocTabRow = {
  id: string;
  tabName: string;
  blocks: DocBlockRow[];
};

type PeriodModalityRow = {
  id: string;
  modality: string;
  requestWindow: string;
  responseWindow: string;
  enabledFrom: string;
  enabledTo: string;
};

type PeriodRow = {
  id: string;
  name: string;
  modalities: PeriodModalityRow[];
};

type Props = {
  categories: CategoryRow[];
  studentTypes: StudentTypeSummary[];
  modalityOptions: string[];
  levelOptions: string[];
  editing?: AdminServiceEdit | null;
  variant?: 'default' | 'sheet';
  onDone?: () => void;
};

const TAB_PANEL_CLASS = 'flex-none space-y-4 pt-4 outline-none';
const FIELD_LABEL_CLASS =
  'border-0 text-[var(--svc-text-2xs)] font-medium tracking-[0.08em] text-[color:var(--svc-color-text-muted)] uppercase';
const CARD_CLASS =
  'space-y-4 rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-elevated)] p-4';

const DEFAULT_TAB_NAMES = ['Distancia', 'Presencial', 'Tecnologías'];
const DEFAULT_STEP = 'general';

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function dedupeTrimmed(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function moveItem<T>(rows: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= rows.length) return rows;
  const next = [...rows];
  const [row] = next.splice(index, 1);
  next.splice(target, 0, row);
  return next;
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function initialRequirementsRows(editing?: AdminServiceEdit | null): RequirementRow[] {
  if (!editing?.requirements?.length) {
    return [{ id: uid('req'), text: '' }];
  }

  return editing.requirements.map((item) => ({
    id: uid('req'),
    text: item.text,
  }));
}

function initialManualRows(editing?: AdminServiceEdit | null): ManualRow[] {
  if (!editing?.manuals?.length) {
    return [{ id: uid('manual'), label: 'Descargar aquí', url: '' }];
  }

  return editing.manuals.map((manual) => ({
    id: uid('manual'),
    label: manual.label,
    url: manual.url,
  }));
}

function createEmptyBlock(): DocBlockRow {
  return {
    id: uid('block'),
    title: '',
    items: [{ id: uid('item'), text: '', pdfUrl: '' }],
    guides: [{ id: uid('guide'), label: '', url: '' }],
  };
}

function initialDocTabs(editing?: AdminServiceEdit | null): DocTabRow[] {
  if (editing?.requirementTabs?.length) {
    return editing.requirementTabs.map((tab) => ({
      id: uid('tab'),
      tabName: tab.tabName,
      blocks:
        tab.blocks.length > 0
          ? tab.blocks.map((block) => ({
              id: uid('block'),
              title: block.title ?? '',
              items:
                block.items.length > 0
                  ? block.items.map((item) => ({
                      id: uid('item'),
                      text: item.text,
                      pdfUrl: item.pdfUrl ?? '',
                    }))
                  : [{ id: uid('item'), text: '', pdfUrl: '' }],
              guides:
                block.guides.length > 0
                  ? block.guides.map((guide) => ({
                      id: uid('guide'),
                      label: guide.label,
                      url: guide.url,
                    }))
                  : [{ id: uid('guide'), label: '', url: '' }],
            }))
          : [createEmptyBlock()],
    }));
  }

  return DEFAULT_TAB_NAMES.map((tabName) => ({
    id: uid('tab'),
    tabName,
    blocks: [createEmptyBlock()],
  }));
}

function initialPeriods(editing?: AdminServiceEdit | null): PeriodRow[] {
  if (!editing?.periods?.length) {
    return [
      {
        id: uid('period'),
        name: '',
        modalities: [
          {
            id: uid('period-mod'),
            modality: 'GENERAL',
            requestWindow: '',
            responseWindow: '',
            enabledFrom: '',
            enabledTo: '',
          },
        ],
      },
    ];
  }

  return editing.periods.map((period) => ({
    id: uid('period'),
    name: period.name,
    modalities:
      period.modalities.length > 0
        ? period.modalities.map((modality) => ({
            id: uid('period-mod'),
            modality: modality.modality,
            requestWindow: modality.requestWindow ?? '',
            responseWindow: modality.responseWindow ?? '',
            enabledFrom: modality.enabledFrom ?? '',
            enabledTo: modality.enabledTo ?? '',
          }))
        : [
            {
              id: uid('period-mod'),
              modality: 'GENERAL',
              requestWindow: '',
              responseWindow: '',
              enabledFrom: '',
              enabledTo: '',
            },
          ],
  }));
}

function getInitialStudentTypeId(
  editing: AdminServiceEdit | null | undefined,
  categories: CategoryRow[],
): number | null {
  if (editing?.categoryId) {
    const matched = categories.find((category) => category.id === editing.categoryId);
    if (matched) return matched.studentTypeId;
  }
  return categories[0]?.studentTypeId ?? null;
}

function resolveStepFromControlKey(key: string): string {
  if (!key) return DEFAULT_STEP;
  if (key.startsWith('period-') || key.startsWith('modality-name-') || key.startsWith('request-window-') || key.startsWith('response-window-') || key.startsWith('enabled-')) {
    return 'periods';
  }
  if (key.startsWith('tab-name-') || key.startsWith('block-title-') || key.startsWith('item-') || key.startsWith('guide-')) {
    return 'documentation';
  }
  if (key.startsWith('manual-')) {
    return 'manuals';
  }
  if (key.startsWith('requirement-')) {
    return 'requirements';
  }
  return DEFAULT_STEP;
}

export function ServiceForm({
  categories,
  studentTypes,
  modalityOptions,
  levelOptions,
  editing,
  variant = 'default',
  onDone,
}: Props) {
  const isSheet = variant === 'sheet';
  const tabsListClass = isSheet ? ADMIN_SHEET_TABS_LIST_CLASS : ADMIN_TABS_LIST_CLASS;
  const tabsTriggerClass = isSheet
    ? cn(
        ADMIN_TABS_TRIGGER_CLASS,
        'min-w-0 whitespace-normal px-2 py-1.5 text-center text-[11px] leading-tight tracking-[0.03em]',
      )
    : ADMIN_TABS_TRIGGER_CLASS;

  const [isActive, setIsActive] = useState(editing?.isActive ?? true);
  const [status, setStatus] = useState<'draft' | 'published' | 'needs_review'>(
    editing?.status ?? 'draft',
  );
  const [modalityCatalog, setModalityCatalog] = useState<string[]>(() =>
    dedupeTrimmed([...(modalityOptions ?? []), editing?.modality ?? '']),
  );
  const [levelCatalog, setLevelCatalog] = useState<string[]>(() =>
    dedupeTrimmed([...(levelOptions ?? []), editing?.level ?? '']),
  );
  const [modalityValue, setModalityValue] = useState(editing?.modality ?? '');
  const [levelValue, setLevelValue] = useState(editing?.level ?? '');
  const [requirements, setRequirements] = useState<RequirementRow[]>(() => initialRequirementsRows(editing));
  const [manuals, setManuals] = useState<ManualRow[]>(() => initialManualRows(editing));
  const [docTabs, setDocTabs] = useState<DocTabRow[]>(() => initialDocTabs(editing));
  const [periods, setPeriods] = useState<PeriodRow[]>(() => initialPeriods(editing));
  const [selectedStudentTypeId, setSelectedStudentTypeId] = useState<number | null>(() =>
    getInitialStudentTypeId(editing, categories),
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(() =>
    editing?.categoryId ?? categories[0]?.id ?? null,
  );
  const [activeTab, setActiveTab] = useState('general');
  const [formError, setFormError] = useState<string | null>(null);

  const categoriesForSelectedType = useMemo(() => {
    if (!selectedStudentTypeId) return [];
    return categories.filter((category) => category.studentTypeId === selectedStudentTypeId);
  }, [categories, selectedStudentTypeId]);

  useEffect(() => {
    if (categoriesForSelectedType.length === 0) {
      setSelectedCategoryId(null);
      return;
    }

    const exists = categoriesForSelectedType.some((category) => category.id === selectedCategoryId);
    if (!exists) {
      setSelectedCategoryId(categoriesForSelectedType[0].id);
    }
  }, [categoriesForSelectedType, selectedCategoryId]);

  function setStepError(step: string, message: string) {
    setActiveTab(step);
    setFormError(message);
  }

  function addRequirement() {
    setRequirements((rows) => [...rows, { id: uid('req'), text: '' }]);
  }

  function updateRequirement(id: string, text: string) {
    setRequirements((rows) => rows.map((row) => (row.id === id ? { ...row, text } : row)));
  }

  function removeRequirement(id: string) {
    setRequirements((rows) => {
      if (rows.length === 1) return [{ ...rows[0], text: '' }];
      return rows.filter((row) => row.id !== id);
    });
  }

  function moveRequirement(index: number, direction: -1 | 1) {
    setRequirements((rows) => moveItem(rows, index, direction));
  }

  function addManual() {
    setManuals((rows) => [...rows, { id: uid('manual'), label: 'Manual', url: '' }]);
  }

  function updateManual(id: string, key: 'label' | 'url', value: string) {
    setManuals((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  }

  function removeManual(id: string) {
    setManuals((rows) => {
      if (rows.length === 1) return [{ ...rows[0], label: 'Descargar aquí', url: '' }];
      return rows.filter((row) => row.id !== id);
    });
  }

  function moveManual(index: number, direction: -1 | 1) {
    setManuals((rows) => moveItem(rows, index, direction));
  }

  function addTab() {
    setDocTabs((rows) => [...rows, { id: uid('tab'), tabName: '', blocks: [createEmptyBlock()] }]);
  }

  function updateTabName(tabId: string, tabName: string) {
    setDocTabs((rows) => rows.map((row) => (row.id === tabId ? { ...row, tabName } : row)));
  }

  function removeTab(tabId: string) {
    setDocTabs((rows) => {
      if (rows.length === 1) {
        return [{ ...rows[0], tabName: rows[0].tabName || 'Distancia', blocks: [createEmptyBlock()] }];
      }
      return rows.filter((row) => row.id !== tabId);
    });
  }

  function moveTab(index: number, direction: -1 | 1) {
    setDocTabs((rows) => moveItem(rows, index, direction));
  }

  function addBlock(tabId: string) {
    setDocTabs((rows) =>
      rows.map((tab) => (tab.id === tabId ? { ...tab, blocks: [...tab.blocks, createEmptyBlock()] } : tab)),
    );
  }

  function updateBlockTitle(tabId: string, blockId: string, title: string) {
    setDocTabs((rows) =>
      rows.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              blocks: tab.blocks.map((block) => (block.id === blockId ? { ...block, title } : block)),
            }
          : tab,
      ),
    );
  }

  function removeBlock(tabId: string, blockId: string) {
    setDocTabs((rows) =>
      rows.map((tab) => {
        if (tab.id !== tabId) return tab;
        if (tab.blocks.length === 1) return { ...tab, blocks: [createEmptyBlock()] };
        return { ...tab, blocks: tab.blocks.filter((block) => block.id !== blockId) };
      }),
    );
  }

  function moveBlock(tabId: string, blockIndex: number, direction: -1 | 1) {
    setDocTabs((rows) =>
      rows.map((tab) => {
        if (tab.id !== tabId) return tab;
        return { ...tab, blocks: moveItem(tab.blocks, blockIndex, direction) };
      }),
    );
  }

  function addDocItem(tabId: string, blockId: string) {
    setDocTabs((rows) =>
      rows.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          blocks: tab.blocks.map((block) =>
            block.id === blockId
              ? { ...block, items: [...block.items, { id: uid('item'), text: '', pdfUrl: '' }] }
              : block,
          ),
        };
      }),
    );
  }

  function updateDocItem(
    tabId: string,
    blockId: string,
    itemId: string,
    key: 'text' | 'pdfUrl',
    value: string,
  ) {
    setDocTabs((rows) =>
      rows.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          blocks: tab.blocks.map((block) => {
            if (block.id !== blockId) return block;
            return {
              ...block,
              items: block.items.map((item) => (item.id === itemId ? { ...item, [key]: value } : item)),
            };
          }),
        };
      }),
    );
  }

  function removeDocItem(tabId: string, blockId: string, itemId: string) {
    setDocTabs((rows) =>
      rows.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          blocks: tab.blocks.map((block) => {
            if (block.id !== blockId) return block;
            if (block.items.length === 1) return { ...block, items: [{ ...block.items[0], text: '', pdfUrl: '' }] };
            return { ...block, items: block.items.filter((item) => item.id !== itemId) };
          }),
        };
      }),
    );
  }

  function moveDocItem(tabId: string, blockId: string, index: number, direction: -1 | 1) {
    setDocTabs((rows) =>
      rows.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          blocks: tab.blocks.map((block) => {
            if (block.id !== blockId) return block;
            return { ...block, items: moveItem(block.items, index, direction) };
          }),
        };
      }),
    );
  }

  function addGuide(tabId: string, blockId: string) {
    setDocTabs((rows) =>
      rows.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          blocks: tab.blocks.map((block) =>
            block.id === blockId
              ? { ...block, guides: [...block.guides, { id: uid('guide'), label: '', url: '' }] }
              : block,
          ),
        };
      }),
    );
  }

  function updateGuide(tabId: string, blockId: string, guideId: string, key: 'label' | 'url', value: string) {
    setDocTabs((rows) =>
      rows.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          blocks: tab.blocks.map((block) => {
            if (block.id !== blockId) return block;
            return {
              ...block,
              guides: block.guides.map((guide) => (guide.id === guideId ? { ...guide, [key]: value } : guide)),
            };
          }),
        };
      }),
    );
  }

  function removeGuide(tabId: string, blockId: string, guideId: string) {
    setDocTabs((rows) =>
      rows.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          blocks: tab.blocks.map((block) => {
            if (block.id !== blockId) return block;
            if (block.guides.length === 1) return { ...block, guides: [{ ...block.guides[0], label: '', url: '' }] };
            return { ...block, guides: block.guides.filter((guide) => guide.id !== guideId) };
          }),
        };
      }),
    );
  }

  function moveGuide(tabId: string, blockId: string, index: number, direction: -1 | 1) {
    setDocTabs((rows) =>
      rows.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          blocks: tab.blocks.map((block) => {
            if (block.id !== blockId) return block;
            return { ...block, guides: moveItem(block.guides, index, direction) };
          }),
        };
      }),
    );
  }

  function addPeriod() {
    setPeriods((rows) => [
      ...rows,
      {
        id: uid('period'),
        name: '',
        modalities: [
          {
            id: uid('period-mod'),
            modality: 'GENERAL',
            requestWindow: '',
            responseWindow: '',
            enabledFrom: '',
            enabledTo: '',
          },
        ],
      },
    ]);
  }

  function updatePeriodName(periodId: string, name: string) {
    setPeriods((rows) => rows.map((row) => (row.id === periodId ? { ...row, name } : row)));
  }

  function removePeriod(periodId: string) {
    setPeriods((rows) => {
      if (rows.length === 1) {
        return [
          {
            ...rows[0],
            name: '',
            modalities: [
              {
                id: uid('period-mod'),
                modality: 'GENERAL',
                requestWindow: '',
                responseWindow: '',
                enabledFrom: '',
                enabledTo: '',
              },
            ],
          },
        ];
      }
      return rows.filter((row) => row.id !== periodId);
    });
  }

  function movePeriod(index: number, direction: -1 | 1) {
    setPeriods((rows) => moveItem(rows, index, direction));
  }

  function addPeriodModality(periodId: string) {
    setPeriods((rows) =>
      rows.map((period) =>
        period.id === periodId
          ? {
              ...period,
              modalities: [
                ...period.modalities,
                {
                  id: uid('period-mod'),
                  modality: '',
                  requestWindow: '',
                  responseWindow: '',
                  enabledFrom: '',
                  enabledTo: '',
                },
              ],
            }
          : period,
      ),
    );
  }

  function updatePeriodModality(
    periodId: string,
    modalityId: string,
    key: keyof Omit<PeriodModalityRow, 'id'>,
    value: string,
  ) {
    setPeriods((rows) =>
      rows.map((period) => {
        if (period.id !== periodId) return period;
        return {
          ...period,
          modalities: period.modalities.map((modality) =>
            modality.id === modalityId ? { ...modality, [key]: value } : modality,
          ),
        };
      }),
    );
  }

  function removePeriodModality(periodId: string, modalityId: string) {
    setPeriods((rows) =>
      rows.map((period) => {
        if (period.id !== periodId) return period;
        if (period.modalities.length === 1) {
          return {
            ...period,
            modalities: [
              {
                ...period.modalities[0],
                modality: 'GENERAL',
                requestWindow: '',
                responseWindow: '',
                enabledFrom: '',
                enabledTo: '',
              },
            ],
          };
        }
        return {
          ...period,
          modalities: period.modalities.filter((modality) => modality.id !== modalityId),
        };
      }),
    );
  }

  function movePeriodModality(periodId: string, index: number, direction: -1 | 1) {
    setPeriods((rows) =>
      rows.map((period) => {
        if (period.id !== periodId) return period;
        return { ...period, modalities: moveItem(period.modalities, index, direction) };
      }),
    );
  }

  function addModalityToCatalog() {
    const normalized = modalityValue.trim();
    if (!normalized) return;
    setModalityCatalog((rows) => dedupeTrimmed([...rows, normalized]));
  }

  function addLevelToCatalog() {
    const normalized = levelValue.trim();
    if (!normalized) return;
    setLevelCatalog((rows) => dedupeTrimmed([...rows, normalized]));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') ?? '').trim();

    if (!selectedCategoryId) {
      setStepError('general', 'Selecciona una categoría válida para el servicio.');
      return;
    }

    if (title.length < 3) {
      setStepError('general', 'El título debe tener al menos 3 caracteres.');
      return;
    }

    const parsedRequirements = requirements
      .map((item) => item.text.trim())
      .filter(Boolean)
      .map((text, sortOrder) => ({ text, sortOrder }));

    const parsedManuals = manuals
      .map((manual) => ({ label: manual.label.trim(), url: manual.url.trim() }))
      .filter((manual) => manual.label.length > 0 || manual.url.length > 0)
      .map((manual, sortOrder) => ({ ...manual, sortOrder }));

    for (const manual of parsedManuals) {
      if (!manual.label || !manual.url) {
        setStepError('manuals', 'Cada manual debe tener etiqueta y URL.');
        return;
      }
      if (!isValidUrl(manual.url)) {
        setStepError('manuals', `URL de manual inválida: ${manual.url}`);
        return;
      }
    }

    const parsedRequirementTabs: Array<{
      tabName: string;
      title: string | null;
      sortOrder: number;
      items: Array<{ text: string; pdfUrl: string | null; sortOrder: number }>;
      guides: Array<{ label: string; url: string; sortOrder: number }>;
    }> = [];

    for (const tab of docTabs) {
      const tabName = tab.tabName.trim();
      if (!tabName) {
        setStepError('documentation', 'Cada modalidad en documentación debe tener nombre.');
        return;
      }

      for (const block of tab.blocks) {
        const blockTitle = block.title.trim();
        const items = block.items
          .map((item) => ({ text: item.text.trim(), pdfUrl: item.pdfUrl.trim() }))
          .filter((item) => item.text.length > 0 || item.pdfUrl.length > 0)
          .map((item, sortOrder) => ({
            text: item.text,
            pdfUrl: item.pdfUrl.length > 0 ? item.pdfUrl : null,
            sortOrder,
          }));

        for (const item of items) {
          if (!item.text) {
            setStepError('documentation', `Documento sin nombre en modalidad ${tabName}.`);
            return;
          }
          if (item.pdfUrl && !isValidUrl(item.pdfUrl)) {
            setStepError('documentation', `URL inválida en documentación de ${tabName}: ${item.pdfUrl}`);
            return;
          }
        }

        const guides = block.guides
          .map((guide) => ({ label: guide.label.trim(), url: guide.url.trim() }))
          .filter((guide) => guide.label.length > 0 || guide.url.length > 0)
          .map((guide, sortOrder) => ({ ...guide, sortOrder }));

        for (const guide of guides) {
          if (!guide.label || !guide.url) {
            setStepError('documentation', `Cada guía de ${tabName} debe tener etiqueta y URL.`);
            return;
          }
          if (!isValidUrl(guide.url)) {
            setStepError('documentation', `URL inválida en guías de ${tabName}: ${guide.url}`);
            return;
          }
        }

        if (!blockTitle && items.length === 0 && guides.length === 0) {
          continue;
        }

        parsedRequirementTabs.push({
          tabName,
          title: blockTitle.length > 0 ? blockTitle : null,
          sortOrder: parsedRequirementTabs.length,
          items,
          guides,
        });
      }
    }

    const parsedPeriods = periods
      .map((period) => ({
        name: period.name.trim(),
        modalities: period.modalities
          .map((modality) => ({
            modality: modality.modality.trim(),
            requestWindow: modality.requestWindow.trim(),
            responseWindow: modality.responseWindow.trim(),
            enabledFrom: modality.enabledFrom.trim(),
            enabledTo: modality.enabledTo.trim(),
          }))
          .filter((modality) =>
            modality.modality.length > 0 ||
            modality.requestWindow.length > 0 ||
            modality.responseWindow.length > 0 ||
            modality.enabledFrom.length > 0 ||
            modality.enabledTo.length > 0,
          ),
      }))
      .filter((period) => period.name.length > 0 || period.modalities.length > 0)
      .map((period, periodIndex) => ({
        name: period.name,
        sortOrder: periodIndex,
        modalities: period.modalities.map((modality, modalityIndex) => ({
          modality: modality.modality,
          requestWindow: modality.requestWindow.length > 0 ? modality.requestWindow : null,
          responseWindow: modality.responseWindow.length > 0 ? modality.responseWindow : null,
          enabledFrom: modality.enabledFrom.length > 0 ? modality.enabledFrom : null,
          enabledTo: modality.enabledTo.length > 0 ? modality.enabledTo : null,
          sortOrder: modalityIndex,
        })),
      }));

    for (const period of parsedPeriods) {
      if (!period.name) {
        setStepError('periods', 'Cada periodo debe tener un nombre.');
        return;
      }
      for (const modality of period.modalities) {
        if (!modality.modality) {
          setStepError('periods', `Cada modalidad del periodo "${period.name}" debe tener nombre.`);
          return;
        }
      }
    }

    setFormError(null);

    try {
      await saveServiceAction({
        id: editing?.id,
        categoryId: selectedCategoryId,
        title,
        slug: null,
        description: formData.get('description') || null,
        programs: [],
        modality: modalityValue.trim() || null,
        level: levelValue.trim() || null,
        responseTime: formData.get('responseTime') || null,
        cost: formData.get('cost') || null,
        note: formData.get('note') || null,
        calendarText: formData.get('calendarText') || null,
        status,
        isActive,
        requirements: parsedRequirements,
        requirementTabs: parsedRequirementTabs,
        periods: parsedPeriods,
        manuals: parsedManuals,
      });

      onDone?.();
    } catch {
      setStepError(DEFAULT_STEP, GENERIC_FORM_ERROR_MESSAGE);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onInvalidCapture={(event) => {
        const controlKey = getControlKey(event.target);
        const step = resolveStepFromControlKey(controlKey);
        setGenericInvalidMessage(event.target);
        setStepError(step, GENERIC_FORM_ERROR_MESSAGE);
      }}
      onInputCapture={(event) => {
        clearInvalidMessage(event.target);
        if (formError === GENERIC_FORM_ERROR_MESSAGE) {
          setFormError(null);
        }
      }}
      className={cn(
        'flex flex-col',
        isSheet ? 'min-h-0 flex-1 bg-[color:var(--svc-color-surface-subtle)]/70' : 'space-y-4',
      )}
    >
      <div className={cn(isSheet && 'min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-6')}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={tabsListClass}>
            <TabsTrigger value="general" className={tabsTriggerClass}>
              General
            </TabsTrigger>
            <TabsTrigger value="requirements" className={tabsTriggerClass}>
              Requisitos
            </TabsTrigger>
            <TabsTrigger value="periods" className={tabsTriggerClass}>
              Periodos
            </TabsTrigger>
            <TabsTrigger value="documentation" className={tabsTriggerClass}>
              Documentación
            </TabsTrigger>
            <TabsTrigger value="manuals" className={tabsTriggerClass}>
              Manuales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className={TAB_PANEL_CLASS}>
            <div className={CARD_CLASS}>
              <Field label="Tipo de estudiante" htmlFor="studentTypeId">
                <select
                  id="studentTypeId"
                  value={selectedStudentTypeId ?? ''}
                  onChange={(event) => setSelectedStudentTypeId(Number(event.target.value))}
                  className={ADMIN_SELECT_CLASS}
                  required
                >
                  {studentTypes.map((studentType) => (
                    <option key={studentType.id} value={studentType.id}>
                      {studentType.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Categoría" htmlFor="categoryId">
                <select
                  id="categoryId"
                  name="categoryId"
                  value={selectedCategoryId ?? ''}
                  onChange={(event) => setSelectedCategoryId(Number(event.target.value))}
                  className={ADMIN_SELECT_CLASS}
                  required
                >
                  {categoriesForSelectedType.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Título" htmlFor="title">
                <Input
                  id="title"
                  name="title"
                  defaultValue={editing?.title}
                  className={ADMIN_FIELD_CLASS}
                  minLength={3}
                  required
                />
              </Field>

              <Field label="Descripción" htmlFor="description">
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing?.description ?? ''}
                  className={ADMIN_FIELD_CLASS}
                />
              </Field>


              <Field label="Estado" htmlFor="status">
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as 'draft' | 'published' | 'needs_review')}
                  className={ADMIN_SELECT_CLASS}
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="needs_review">Revisión</option>
                </select>
              </Field>

              <Field label="Calendario" htmlFor="calendarText">
                <Textarea
                  id="calendarText"
                  name="calendarText"
                  rows={3}
                  defaultValue={editing?.calendarText ?? ''}
                  className={ADMIN_FIELD_CLASS}
                />
              </Field>

              <ServiceMetaFields
                editing={editing}
                modalityOptions={modalityCatalog}
                levelOptions={levelCatalog}
                modalityValue={modalityValue}
                levelValue={levelValue}
                onModalityChange={setModalityValue}
                onLevelChange={setLevelValue}
                onAddModality={addModalityToCatalog}
                onAddLevel={addLevelToCatalog}
              />

              <div className="flex items-center gap-3 rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] px-3 py-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label className={FIELD_LABEL_CLASS}>Servicio activo (visible en /servicios)</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requirements" className={TAB_PANEL_CLASS}>
            <div className={CARD_CLASS}>
              <p className="text-sm text-[color:var(--svc-color-text-secondary)]">
                Agrega los requisitos en el orden exacto en que deben mostrarse en la modal pública.
              </p>
              {requirements.map((requirement, index) => (
                <div key={requirement.id} className="grid gap-2 rounded border border-[color:var(--svc-color-border-soft)] p-3">
                  <Label className={FIELD_LABEL_CLASS}>Requisito {index + 1}</Label>
                  <Textarea
                    value={requirement.text}
                    rows={2}
                    onChange={(event) => updateRequirement(requirement.id, event.target.value)}
                    className={ADMIN_FIELD_CLASS}
                  />
                  <RowActions
                    onMoveUp={() => moveRequirement(index, -1)}
                    onMoveDown={() => moveRequirement(index, 1)}
                    onRemove={() => removeRequirement(requirement.id)}
                    disableUp={index === 0}
                    disableDown={index === requirements.length - 1}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={addRequirement}>
                <Plus className="mr-2 h-4 w-4" /> Agregar requisito
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="periods" className={TAB_PANEL_CLASS}>
            <div className={CARD_CLASS}>
              <p className="text-sm text-[color:var(--svc-color-text-secondary)]">
                Define periodos y modalidades. El orden que configures se usa para mostrar los datos al estudiante.
              </p>
              {periods.map((period, periodIndex) => (
                <div key={period.id} className="space-y-3 rounded border border-[color:var(--svc-color-border-soft)] p-3">
                  <Field label={`Periodo ${periodIndex + 1}`} htmlFor={`period-name-${period.id}`}>
                    <Input
                      id={`period-name-${period.id}`}
                      value={period.name}
                      onChange={(event) => updatePeriodName(period.id, event.target.value)}
                      className={ADMIN_FIELD_CLASS}
                      placeholder="Periodo octubre 2026 - febrero 2027"
                    />
                  </Field>

                  {period.modalities.map((modality, modalityIndex) => (
                    <div key={modality.id} className="space-y-3 rounded border border-[color:var(--svc-color-border-soft)] p-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Modalidad" htmlFor={`modality-name-${modality.id}`}>
                          <Input
                            id={`modality-name-${modality.id}`}
                            value={modality.modality}
                            onChange={(event) =>
                              updatePeriodModality(period.id, modality.id, 'modality', event.target.value)
                            }
                            className={ADMIN_FIELD_CLASS}
                            placeholder="GENERAL"
                          />
                        </Field>
                        <Field label="Ventana de solicitud" htmlFor={`request-window-${modality.id}`}>
                          <Input
                            id={`request-window-${modality.id}`}
                            value={modality.requestWindow}
                            onChange={(event) =>
                              updatePeriodModality(period.id, modality.id, 'requestWindow', event.target.value)
                            }
                            className={ADMIN_FIELD_CLASS}
                            placeholder="13/04/2026 - 28/09/2026"
                          />
                        </Field>
                        <Field label="Ventana de respuesta" htmlFor={`response-window-${modality.id}`}>
                          <Input
                            id={`response-window-${modality.id}`}
                            value={modality.responseWindow}
                            onChange={(event) =>
                              updatePeriodModality(period.id, modality.id, 'responseWindow', event.target.value)
                            }
                            className={ADMIN_FIELD_CLASS}
                            placeholder="15 días"
                          />
                        </Field>
                        <Field label="Habilitado desde" htmlFor={`enabled-from-${modality.id}`}>
                          <Input
                            type="date"
                            id={`enabled-from-${modality.id}`}
                            value={modality.enabledFrom}
                            onChange={(event) =>
                              updatePeriodModality(period.id, modality.id, 'enabledFrom', event.target.value)
                            }
                            className={ADMIN_FIELD_CLASS}
                          />
                        </Field>
                        <Field label="Habilitado hasta" htmlFor={`enabled-to-${modality.id}`}>
                          <Input
                            type="date"
                            id={`enabled-to-${modality.id}`}
                            value={modality.enabledTo}
                            onChange={(event) =>
                              updatePeriodModality(period.id, modality.id, 'enabledTo', event.target.value)
                            }
                            className={ADMIN_FIELD_CLASS}
                          />
                        </Field>
                      </div>
                      <RowActions
                        onMoveUp={() => movePeriodModality(period.id, modalityIndex, -1)}
                        onMoveDown={() => movePeriodModality(period.id, modalityIndex, 1)}
                        onRemove={() => removePeriodModality(period.id, modality.id)}
                        disableUp={modalityIndex === 0}
                        disableDown={modalityIndex === period.modalities.length - 1}
                      />
                    </div>
                  ))}

                  <Button type="button" variant="outline" className="w-full" onClick={() => addPeriodModality(period.id)}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar modalidad al periodo
                  </Button>

                  <RowActions
                    onMoveUp={() => movePeriod(periodIndex, -1)}
                    onMoveDown={() => movePeriod(periodIndex, 1)}
                    onRemove={() => removePeriod(period.id)}
                    disableUp={periodIndex === 0}
                    disableDown={periodIndex === periods.length - 1}
                  />
                </div>
              ))}

              <Button type="button" variant="outline" className="w-full" onClick={addPeriod}>
                <Plus className="mr-2 h-4 w-4" /> Agregar periodo
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="documentation" className={TAB_PANEL_CLASS}>
            <div className={CARD_CLASS}>
              <p className="text-sm text-[color:var(--svc-color-text-secondary)]">
                Configura documentación por modalidad con bloques independientes (por ejemplo ECTS / Rediseño),
                documentos y guías.
              </p>

              {docTabs.map((tab, tabIndex) => (
                <div key={tab.id} className="space-y-3 rounded border border-[color:var(--svc-color-border-soft)] p-3">
                  <Field label={`Modalidad ${tabIndex + 1}`} htmlFor={`tab-name-${tab.id}`}>
                    <Input
                      id={`tab-name-${tab.id}`}
                      value={tab.tabName}
                      onChange={(event) => updateTabName(tab.id, event.target.value)}
                      className={ADMIN_FIELD_CLASS}
                      placeholder="Distancia"
                    />
                  </Field>

                  {tab.blocks.map((block, blockIndex) => (
                    <div key={block.id} className="space-y-3 rounded border border-[color:var(--svc-color-border-soft)] p-3">
                      <Field
                        label={`Tipo de estudiante en modalidad ${blockIndex + 1} (ej: Estudiantes ECTS)`}
                        htmlFor={`block-title-${block.id}`}
                      >
                        <Input
                          id={`block-title-${block.id}`}
                          value={block.title}
                          onChange={(event) => updateBlockTitle(tab.id, block.id, event.target.value)}
                          className={ADMIN_FIELD_CLASS}
                          placeholder="Estudiantes ECTS"
                        />
                      </Field>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[color:var(--svc-color-text-secondary)]">Documentos</p>
                        {block.items.map((item, itemIndex) => (
                          <div key={item.id} className="space-y-2 rounded border border-[color:var(--svc-color-border-soft)] p-3">
                            <Field label="Nombre del documento" htmlFor={`item-text-${item.id}`}>
                              <Input
                                id={`item-text-${item.id}`}
                                value={item.text}
                                onChange={(event) => updateDocItem(tab.id, block.id, item.id, 'text', event.target.value)}
                                className={ADMIN_FIELD_CLASS}
                              />
                            </Field>
                            <Field label="URL (opcional)" htmlFor={`item-url-${item.id}`}>
                              <Input
                                id={`item-url-${item.id}`}
                                value={item.pdfUrl}
                                onChange={(event) =>
                                  updateDocItem(tab.id, block.id, item.id, 'pdfUrl', event.target.value)
                                }
                                className={ADMIN_FIELD_CLASS}
                                placeholder="https://"
                              />
                            </Field>
                            <RowActions
                              onMoveUp={() => moveDocItem(tab.id, block.id, itemIndex, -1)}
                              onMoveDown={() => moveDocItem(tab.id, block.id, itemIndex, 1)}
                              onRemove={() => removeDocItem(tab.id, block.id, item.id)}
                              disableUp={itemIndex === 0}
                              disableDown={itemIndex === block.items.length - 1}
                            />
                          </div>
                        ))}
                        <Button type="button" variant="outline" className="w-full" onClick={() => addDocItem(tab.id, block.id)}>
                          <Plus className="mr-2 h-4 w-4" /> Agregar documento
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[color:var(--svc-color-text-secondary)]">Guías</p>
                        {block.guides.map((guide, guideIndex) => (
                          <div key={guide.id} className="space-y-2 rounded border border-[color:var(--svc-color-border-soft)] p-3">
                            <Field label="Etiqueta" htmlFor={`guide-label-${guide.id}`}>
                              <Input
                                id={`guide-label-${guide.id}`}
                                value={guide.label}
                                onChange={(event) => updateGuide(tab.id, block.id, guide.id, 'label', event.target.value)}
                                className={ADMIN_FIELD_CLASS}
                              />
                            </Field>
                            <Field label="URL" htmlFor={`guide-url-${guide.id}`}>
                              <Input
                                id={`guide-url-${guide.id}`}
                                value={guide.url}
                                onChange={(event) => updateGuide(tab.id, block.id, guide.id, 'url', event.target.value)}
                                className={ADMIN_FIELD_CLASS}
                                placeholder="https://"
                              />
                            </Field>
                            <RowActions
                              onMoveUp={() => moveGuide(tab.id, block.id, guideIndex, -1)}
                              onMoveDown={() => moveGuide(tab.id, block.id, guideIndex, 1)}
                              onRemove={() => removeGuide(tab.id, block.id, guide.id)}
                              disableUp={guideIndex === 0}
                              disableDown={guideIndex === block.guides.length - 1}
                            />
                          </div>
                        ))}
                        <Button type="button" variant="outline" className="w-full" onClick={() => addGuide(tab.id, block.id)}>
                          <Plus className="mr-2 h-4 w-4" /> Agregar guía
                        </Button>
                      </div>

                      <RowActions
                        onMoveUp={() => moveBlock(tab.id, blockIndex, -1)}
                        onMoveDown={() => moveBlock(tab.id, blockIndex, 1)}
                        onRemove={() => removeBlock(tab.id, block.id)}
                        disableUp={blockIndex === 0}
                        disableDown={blockIndex === tab.blocks.length - 1}
                      />
                    </div>
                  ))}

                  <Button type="button" variant="outline" className="w-full" onClick={() => addBlock(tab.id)}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar bloque en modalidad
                  </Button>

                  <RowActions
                    onMoveUp={() => moveTab(tabIndex, -1)}
                    onMoveDown={() => moveTab(tabIndex, 1)}
                    onRemove={() => removeTab(tab.id)}
                    disableUp={tabIndex === 0}
                    disableDown={tabIndex === docTabs.length - 1}
                  />
                </div>
              ))}

              <Button type="button" variant="outline" className="w-full" onClick={addTab}>
                <Plus className="mr-2 h-4 w-4" /> Agregar modalidad
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manuals" className={TAB_PANEL_CLASS}>
            <div className={CARD_CLASS}>
              <p className="text-sm text-[color:var(--svc-color-text-secondary)]">
                Configura uno o varios manuales/documentos generales del servicio.
              </p>
              {manuals.map((manual, index) => (
                <div key={manual.id} className="space-y-2 rounded border border-[color:var(--svc-color-border-soft)] p-3">
                  <Field label={`Etiqueta ${index + 1}`} htmlFor={`manual-label-${manual.id}`}>
                    <Input
                      id={`manual-label-${manual.id}`}
                      value={manual.label}
                      onChange={(event) => updateManual(manual.id, 'label', event.target.value)}
                      className={ADMIN_FIELD_CLASS}
                    />
                  </Field>
                  <Field label="URL" htmlFor={`manual-url-${manual.id}`}>
                    <Input
                      id={`manual-url-${manual.id}`}
                      value={manual.url}
                      onChange={(event) => updateManual(manual.id, 'url', event.target.value)}
                      className={ADMIN_FIELD_CLASS}
                      placeholder="https://"
                    />
                  </Field>
                  <RowActions
                    onMoveUp={() => moveManual(index, -1)}
                    onMoveDown={() => moveManual(index, 1)}
                    onRemove={() => removeManual(manual.id)}
                    disableUp={index === 0}
                    disableDown={index === manuals.length - 1}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" className="w-full" onClick={addManual}>
                <Plus className="mr-2 h-4 w-4" /> Agregar manual
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div
        className={cn(
          isSheet
            ? 'shrink-0 border-t border-[color:var(--svc-color-border-soft)] bg-[color:var(--svc-color-surface-elevated)] px-4 py-4'
            : undefined,
        )}
      >
        <div className={cn('flex gap-2', isSheet ? 'flex-col-reverse sm:flex-row sm:justify-end' : undefined)}>
          {onDone ? (
            <Button
              type="button"
              variant="outline"
              className={cn(
                'rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-subtle)] bg-[color:var(--svc-color-surface-subtle)] text-[color:var(--svc-color-text-secondary)] hover:bg-[color:var(--svc-color-surface-elevated)]',
                isSheet && 'sm:min-w-32',
              )}
              onClick={onDone}
            >
              Cancelar
            </Button>
          ) : null}
          <Button
            type="submit"
            className={cn(
              'rounded-[var(--svc-radius-sm)] border-[var(--svc-border-hairline)] border-[color:var(--svc-color-border-strong)] bg-[color:var(--svc-color-surface-elevated)] text-[color:var(--svc-color-text-primary)] hover:bg-[color:var(--svc-color-surface-subtle)]',
              isSheet ? 'w-full sm:w-auto sm:min-w-40' : 'sm:w-fit',
            )}
          >
            {editing ? 'Guardar servicio' : 'Crear servicio'}
          </Button>
        </div>

        {formError ? <p className="mt-3 text-sm font-medium text-red-600">{formError}</p> : null}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor} className={FIELD_LABEL_CLASS}>
        {label}
      </Label>
      {children}
    </div>
  );
}

function RowActions({
  onMoveUp,
  onMoveDown,
  onRemove,
  disableUp,
  disableDown,
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onMoveUp} disabled={disableUp}>
        <ArrowUp className="mr-1 h-4 w-4" /> Subir
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onMoveDown} disabled={disableDown}>
        <ArrowDown className="mr-1 h-4 w-4" /> Bajar
      </Button>
      <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
        <Trash2 className="mr-1 h-4 w-4" /> Eliminar
      </Button>
    </div>
  );
}

function ServiceMetaFields({
  editing,
  modalityOptions,
  levelOptions,
  modalityValue,
  levelValue,
  onModalityChange,
  onLevelChange,
  onAddModality,
  onAddLevel,
}: {
  editing?: AdminServiceEdit | null;
  modalityOptions: string[];
  levelOptions: string[];
  modalityValue: string;
  levelValue: string;
  onModalityChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onAddModality: () => void;
  onAddLevel: () => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Tiempo de respuesta" htmlFor="responseTime">
        <Input
          id="responseTime"
          name="responseTime"
          defaultValue={editing?.responseTime ?? ''}
          className={ADMIN_FIELD_CLASS}
        />
      </Field>
      <Field label="Costo" htmlFor="cost">
        <Input id="cost" name="cost" defaultValue={editing?.cost ?? ''} className={ADMIN_FIELD_CLASS} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Modalidad" htmlFor="modality">
          <div className="flex gap-2">
            <Input
              id="modality"
              name="modality"
              value={modalityValue}
              onChange={(event) => onModalityChange(event.target.value)}
              list="modality-options"
              className={ADMIN_FIELD_CLASS}
            />
            <Button type="button" variant="outline" onClick={onAddModality}>
              <Plus className="mr-1 h-4 w-4" />
              Agregar
            </Button>
          </div>
          <datalist id="modality-options">
            {modalityOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Nivel" htmlFor="level">
          <div className="flex gap-2">
            <Input
              id="level"
              name="level"
              value={levelValue}
              onChange={(event) => onLevelChange(event.target.value)}
              list="level-options"
              className={ADMIN_FIELD_CLASS}
            />
            <Button type="button" variant="outline" onClick={onAddLevel}>
              <Plus className="mr-1 h-4 w-4" />
              Agregar
            </Button>
          </div>
          <datalist id="level-options">
            {levelOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Nota" htmlFor="note">
          <Textarea id="note" name="note" rows={2} defaultValue={editing?.note ?? ''} className={ADMIN_FIELD_CLASS} />
        </Field>
      </div>
    </div>
  );
}
