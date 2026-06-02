'use client';

import { X } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { ServiceDetail } from '@/lib/academic-services/domain/service-detail';

type Properties = {
  detail: ServiceDetail;
  title: string;
  onClose: () => void;
};

export default function ServiceDetailPortal({ detail, title, onClose }: Properties) {
  const tabGroups = useMemo(() => {
    const grouped = new Map<
      string,
      {
        id: string;
        label: string;
        blocks: ServiceDetail['requirementTabs'][number]['blocks'];
      }
    >();

    for (const [index, tab] of detail.requirementTabs.entries()) {
      const label = tab.tabName.replaceAll(/\s+/g, ' ').trim() || `Modalidad ${index + 1}`;
      const key = normalizeName(label);
      const existing = grouped.get(key);
      if (existing) {
        existing.blocks.push(...tab.blocks);
        continue;
      }
      grouped.set(key, {
        id: `${key}-${grouped.size}`,
        label,
        blocks: [...tab.blocks],
      });
    }

    return [...grouped.values()];
  }, [detail.requirementTabs]);

  const [activeDocsTab, setActiveDocsTab] = useState(tabGroups[0]?.id ?? '');
  const [activeGuidesTab, setActiveGuidesTab] = useState(tabGroups[0]?.id ?? '');

  const requirements = detail.requirements.map((item) => item.text).filter(Boolean);
  const hasAnyGuides = tabGroups.some((tab) => tab.blocks.some((block) => block.guides.length > 0));
  const hasAnyDocumentation = tabGroups.some((tab) =>
    tab.blocks.some((block) => block.items.length > 0)
  );

  return (
    <div className="rounded-[20px] border border-slate-200/60 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between border-b border-utpl-border p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-utpl-muted">
            Servicio académico
          </p>
          <h2 className="mt-1 text-xl font-black text-utpl-text">{title}</h2>
          {detail.categoryName ? (
            <p className="mt-0.5 text-sm text-utpl-muted">{detail.categoryName}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-utpl-muted transition-colors hover:bg-utpl-surface"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-6">
        {detail.description ? (
          <p className="text-sm leading-relaxed text-utpl-text">{detail.description}</p>
        ) : null}

        {requirements.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-utpl-muted">
              Requisitos
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-utpl-text">
              {requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {hasAnyDocumentation ? (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-utpl-muted">
              Documentación por modalidad
            </p>
            <TabBar
              tabs={tabGroups}
              activeTab={activeDocsTab}
              onTabChange={setActiveDocsTab}
            />
            <div className="mt-3 space-y-3">
              {tabGroups
                .filter((tab) => tab.id === activeDocsTab)
                .map((tab) =>
                  tab.blocks.map((block, bi) => (
                    <div key={`${tab.id}-${block.title ?? bi}`}>
                      {block.title ? (
                        <p className="text-sm font-semibold text-utpl-text">{block.title}</p>
                      ) : null}
                      {block.items.length > 0 ? (
                        <div className="mt-1 space-y-1">
                          {block.items.map((item) =>
                            item.pdfUrl ? (
                              <a
                                key={`${item.text}-${item.sortOrder}`}
                                href={item.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-sm text-utpl-blue underline hover:text-utpl-blue-hover"
                              >
                                {item.text}
                              </a>
                            ) : (
                              <p
                                key={`${item.text}-${item.sortOrder}`}
                                className="text-sm text-utpl-text"
                              >
                                {item.text}
                              </p>
                            )
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
            </div>
          </div>
        ) : null}

        {hasAnyGuides ? (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-utpl-muted">
              Guías por modalidad
            </p>
            <TabBar
              tabs={tabGroups}
              activeTab={activeGuidesTab}
              onTabChange={setActiveGuidesTab}
            />
            <div className="mt-3 space-y-2">
              {tabGroups
                .filter((tab) => tab.id === activeGuidesTab)
                .flatMap((tab) =>
                  tab.blocks.flatMap((block) =>
                    block.guides.map((guide) => (
                      <a
                        key={`${guide.url}-${guide.sortOrder}`}
                        href={guide.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg border border-utpl-border bg-utpl-surface p-3 text-sm font-medium text-utpl-blue transition-colors hover:bg-utpl-gold/10"
                      >
                        {guide.label}
                      </a>
                    ))
                  )
                )}
            </div>
          </div>
        ) : null}

        {detail.responseTime || detail.cost ? (
          <div className="flex gap-6 rounded-xl bg-utpl-surface p-4">
            {detail.cost?.trim() ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-utpl-muted">
                  Costo
                </p>
                <p className="text-sm font-semibold text-utpl-text">{detail.cost}</p>
              </div>
            ) : null}
            {detail.responseTime?.trim() ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-utpl-muted">
                  Tiempo de respuesta
                </p>
                <p className="text-sm font-semibold text-utpl-text">{detail.responseTime}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-utpl-surface p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-white text-utpl-blue shadow-sm'
              : 'text-utpl-muted hover:text-utpl-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036F]/g, '')
    .trim();
}
