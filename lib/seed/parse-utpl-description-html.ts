import {
  decodeHtmlEntities,
  extractAnchorLinks,
  extractListItems,
  sanitizeUtplHtml,
  stripHtmlToText,
} from '@/lib/seed/normalize-utpl-html';

export type ParsedRequirementTab = {
  tabName: string;
  title: string | null;
  items: Array<{ text: string; pdfUrl: string | null }>;
};

export type ParsedPeriod = {
  name: string;
  modalities: Array<{
    modality: string;
    requestWindow: string | null;
    responseWindow: string | null;
    enabledFrom?: string | null;
    enabledTo?: string | null;
  }>;
};

export type ParsedDescription = {
  description: string | null;
  programs: string[];
  modalityLevel: string | null;
  responseTime: string | null;
  cost: string | null;
  note: string | null;
  calendarText: string | null;
  requirements: string[];
  requirementTabs: ParsedRequirementTab[];
  periods: ParsedPeriod[];
  manuals: Array<{ label: string; url: string }>;
  descriptionHtml: string;
};

function sectionLabel(text: string): string {
  const firstLine = text.split('\n')[0]?.trim() ?? '';
  return firstLine.replace(/:$/, '').toLowerCase();
}

function valueAfterLabel(
  text: string,
  labels: string[],
  options?: { firstLineOnly?: boolean },
): string | null {
  const lower = text.toLowerCase();
  for (const label of labels) {
    const idx = lower.indexOf(label.toLowerCase());
    if (idx >= 0) {
      let rest = text.slice(idx + label.length).replace(/^[:\s]+/, '').trim();
      if (options?.firstLineOnly) {
        rest = rest.split('\n')[0]?.trim() ?? '';
      }
      if (rest) return rest;
    }
  }
  return text.trim() || null;
}

const EMBEDDED_FIELD_MARKERS = [
  /\nModalidad y nivel de estudio:/i,
  /\nCalendario\b/i,
  /\nPeriodo\b/i,
  /\nTiempo de respuesta:/i,
  /\nCosto:/i,
  /\nRequisitos?:/i,
  /\nNota:/i,
  /\nManual:/i,
] as const;

function truncateAtEmbeddedFields(text: string): string {
  let end = text.length;
  for (const marker of EMBEDDED_FIELD_MARKERS) {
    const match = marker.exec(text);
    if (match && match.index < end) end = match.index;
  }
  return text.slice(0, end).trim();
}

type InlineFields = Pick<
  ParsedDescription,
  'modalityLevel' | 'responseTime' | 'cost' | 'note' | 'requirements' | 'periods'
>;

function parseInlineFieldsFromPlain(plain: string): InlineFields {
  const result: InlineFields = {
    modalityLevel: null,
    responseTime: null,
    cost: null,
    note: null,
    requirements: [],
    periods: [],
  };

  const modalityMatch = plain.match(/Modalidad y nivel de estudio:\s*([^\n]+)/i);
  if (modalityMatch) result.modalityLevel = modalityMatch[1].trim();

  const responseMatch = plain.match(/Tiempo de respuesta:\s*([^\n]+)/i);
  if (responseMatch) result.responseTime = responseMatch[1].trim();

  const costMatch = plain.match(/Costo:\s*([^\n]+)/i);
  if (costMatch) result.cost = costMatch[1].trim();

  const noteMatch = plain.match(/Nota:\s*([^\n]+)/i);
  if (noteMatch) result.note = noteMatch[1].trim();

  const calendarMatch = plain.match(/Calendario(?:\s+para el periodo)?\s*([^\n]+)/i);
  const solicitudMatch = plain.match(/SOLICITUD:\s*([^\n]+)/i);
  const periodoMatch = plain.match(/Periodo\s+([^\n]+)/i);

  if (calendarMatch || solicitudMatch || periodoMatch) {
    result.periods.push({
      name:
        calendarMatch?.[1]?.trim() ??
        periodoMatch?.[1]?.trim() ??
        'Periodo',
      modalities: [
        {
          modality: 'General',
          requestWindow: solicitudMatch?.[1]?.trim() ?? null,
          responseWindow: null,
        },
      ],
    });
  }

  return result;
}

function applyInlineFields(
  current: InlineFields,
  source: InlineFields,
): InlineFields {
  return {
    modalityLevel: current.modalityLevel ?? source.modalityLevel,
    responseTime: current.responseTime ?? source.responseTime,
    cost: current.cost ?? source.cost,
    note: current.note ?? source.note,
    requirements:
      current.requirements.length > 0 ? current.requirements : source.requirements,
    periods: current.periods.length > 0 ? current.periods : source.periods,
  };
}

function parsePeriodSection(html: string, plain: string): ParsedPeriod[] {
  const periods: ParsedPeriod[] = [];

  const periodChunks = plain.split(/(?=PERIODO|Periodo|Calendario)/i).filter(Boolean);

  for (const chunk of periodChunks) {
    const lines = chunk
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    let periodName = lines[0]
      .replace(/^(periodo|calendario)\s*:?\s*/i, '')
      .trim();
    if (!periodName) periodName = lines[0];

    const modalities: ParsedPeriod['modalities'] = [];
    let currentModality = 'General';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const modalityMatch = line.match(/^modalidad\s*(.+)?$/i);
      if (modalityMatch) {
        currentModality = modalityMatch[1]?.trim() || line;
        continue;
      }

      const bimestreMatch = line.match(/^(primer|segundo|tercer)?\s*bimestre|recuperación/i);
      if (bimestreMatch) {
        currentModality = line;
        continue;
      }

      const gradoMatch = line.match(/^grado y tecnología:/i);
      if (gradoMatch) {
        currentModality = line.replace(/^grado y tecnología:\s*/i, '').trim() || line;
        continue;
      }

      const solicitudMatch = line.match(/^solicitud:\s*(.+)$/i);
      const respuestaMatch = line.match(/^respuesta:\s*(.+)$/i);

      if (solicitudMatch) {
        modalities.push({
          modality: currentModality,
          requestWindow: solicitudMatch[1].trim(),
          responseWindow: null,
        });
        continue;
      }

      if (respuestaMatch) {
        const last = modalities[modalities.length - 1];
        if (last && last.modality === currentModality) {
          last.responseWindow = respuestaMatch[1].trim();
        } else {
          modalities.push({
            modality: currentModality,
            requestWindow: null,
            responseWindow: respuestaMatch[1].trim(),
          });
        }
      }
    }

    if (modalities.length === 0) {
      const solicitudGlobal = plain.match(/SOLICITUD:\s*([^]+?)(?=Modalidad|Nota:|$)/i);
      if (solicitudGlobal) {
        modalities.push({
          modality: 'General',
          requestWindow: stripHtmlToText(solicitudGlobal[1]),
          responseWindow: null,
        });
      }
    }

    if (periodName || modalities.length > 0) {
      periods.push({ name: periodName, modalities });
    }
  }

  if (periods.length === 0 && /periodo|calendario/i.test(plain)) {
    periods.push({
      name: plain.split('\n')[0] ?? 'Periodo',
      modalities: extractListItems(html).map((item) => ({
        modality: item,
        requestWindow: null,
        responseWindow: null,
      })),
    });
  }

  return periods;
}

function parseRequirementTabs(html: string, plain: string): ParsedRequirementTab[] {
  const tabs: ParsedRequirementTab[] = [];
  const tabNames = [
    'DISTANCIA',
    'PRESENCIAL',
    'EN LÍNEA',
    'EN LINEA',
    'A DISTANCIA',
    'TECNOLOGÍAS',
    'TECNOLOGIAS',
  ];

  for (const tabName of tabNames) {
    const regex = new RegExp(`${tabName}[:\\s]+([\\s\\S]*?)(?=${tabNames.join('|')}|$)`, 'i');
    const match = plain.match(regex);
    if (!match) continue;

    const items = match[1]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text) => ({ text, pdfUrl: null as string | null }));

    if (items.length > 0) {
      tabs.push({ tabName, title: null, items });
    }
  }

  if (tabs.length === 0) return tabs;

  const pdfLinks = extractAnchorLinks(html);
  for (const tab of tabs) {
    for (const item of tab.items) {
      const link = pdfLinks.find((l) => l.label.includes(item.text.slice(0, 20)));
      if (link) item.pdfUrl = link.url;
    }
  }

  return tabs;
}

export function parseUtplDescriptionHtml(rawHtml: string): ParsedDescription {
  const descriptionHtml = sanitizeUtplHtml(rawHtml);
  const sections = descriptionHtml.split(/<hr\s*\/?>/i);

  let description: string | null = null;
  let modalityLevel: string | null = null;
  let responseTime: string | null = null;
  let cost: string | null = null;
  let note: string | null = null;
  const programs: string[] = [];
  const calendarSections: string[] = [];
  const requirements: string[] = [];
  const periods: ParsedPeriod[] = [];
  const manuals: Array<{ label: string; url: string }> = [];
  let requirementTabs: ParsedRequirementTab[] = [];

  for (const sectionHtml of sections) {
    const plain = stripHtmlToText(sectionHtml);
    if (!plain) continue;

    const label = sectionLabel(plain);

    if (label.startsWith('descripción') || label === 'descripcion') {
      const rawDescription = valueAfterLabel(plain, ['Descripción:', 'Descripcion:']);
      if (rawDescription) {
        description = truncateAtEmbeddedFields(rawDescription);
        const merged = applyInlineFields(
          { modalityLevel, responseTime, cost, note, requirements, periods },
          parseInlineFieldsFromPlain(rawDescription),
        );
        modalityLevel = merged.modalityLevel;
        responseTime = merged.responseTime;
        cost = merged.cost;
        note = merged.note;
        if (merged.periods.length > 0) periods.push(...merged.periods);
      }
      continue;
    }

    if (label.includes('modalidad y nivel')) {
      modalityLevel = valueAfterLabel(plain, ['Modalidad y nivel de estudio:']);
      continue;
    }

    if (label.startsWith('requisito')) {
      const items = extractListItems(sectionHtml);
      if (items.length > 0) {
        requirements.push(...items);
      } else {
        const text = valueAfterLabel(plain, ['Requisitos:', 'Requisito:']);
        if (text) requirements.push(text);
      }
      continue;
    }

    if (label.startsWith('programa')) {
      const items = extractListItems(sectionHtml);
      if (items.length > 0) {
        programs.push(...items);
      } else {
        const text = valueAfterLabel(plain, ['Programas:', 'Programa:']);
        if (text) {
          programs.push(
            ...text
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
          );
        }
      }
      continue;
    }

    if (label.startsWith('costo')) {
      cost = valueAfterLabel(plain, ['Costo:'], { firstLineOnly: true });
      continue;
    }

    if (label.includes('tiempo de respuesta')) {
      responseTime = valueAfterLabel(plain, ['Tiempo de respuesta:'], { firstLineOnly: true });
      const inline = parseInlineFieldsFromPlain(plain);
      if (!cost && inline.cost) cost = inline.cost;
      continue;
    }

    if (label.startsWith('nota')) {
      note = valueAfterLabel(plain, ['Nota:']);
      continue;
    }

    if (label.startsWith('manual')) {
      const links = extractAnchorLinks(sectionHtml);
      if (links.length > 0) {
        manuals.push(...links);
      } else {
        const text = valueAfterLabel(plain, ['Manual:']);
        if (text) manuals.push({ label: text, url: '#' });
      }
      continue;
    }

    if (/periodo|calendario/i.test(label) || /periodo|calendario/i.test(plain.slice(0, 40))) {
      periods.push(...parsePeriodSection(sectionHtml, plain));
      calendarSections.push(plain);
      continue;
    }

    const merged = applyInlineFields(
      { modalityLevel, responseTime, cost, note, requirements, periods },
      parseInlineFieldsFromPlain(plain),
    );
    modalityLevel = merged.modalityLevel;
    responseTime = merged.responseTime;
    cost = merged.cost;
    note = merged.note;
    if (periods.length === 0 && merged.periods.length > 0) {
      periods.push(...merged.periods);
    }
    if (/periodo|calendario/i.test(plain)) {
      calendarSections.push(plain);
    }
  }

  requirementTabs = parseRequirementTabs(descriptionHtml, stripHtmlToText(descriptionHtml));

  if (!description && descriptionHtml) {
    const firstPlain = stripHtmlToText(sections[0] ?? descriptionHtml);
    description = valueAfterLabel(firstPlain, ['Descripción:', 'Descripcion:']) ?? (firstPlain || null);
  }

  return {
    description: description ? decodeHtmlEntities(description) : null,
    programs: programs.map((program) => decodeHtmlEntities(program)),
    modalityLevel: modalityLevel ? decodeHtmlEntities(modalityLevel) : null,
    responseTime: responseTime ? decodeHtmlEntities(responseTime) : null,
    cost: cost ? decodeHtmlEntities(cost) : null,
    note: note ? decodeHtmlEntities(note) : null,
    calendarText:
      calendarSections.length > 0
        ? decodeHtmlEntities(calendarSections.join('\n\n').trim())
        : periods.length > 0
          ? decodeHtmlEntities(periods.map((period) => period.name).join('\n'))
          : null,
    requirements: requirements.map((r) => decodeHtmlEntities(r)),
    requirementTabs,
    periods,
    manuals,
    descriptionHtml,
  };
}
