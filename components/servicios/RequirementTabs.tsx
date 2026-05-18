'use client';

import type { GroupedRequirementTab } from '@/lib/academic-services/domain/service-detail';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
  tabs: GroupedRequirementTab[];
};

export function RequirementTabs({ tabs }: Props) {
  if (tabs.length === 0) return null;

  const normalizedTabs = normalizeTabs(tabs);
  const defaultTab = normalizedTabs[0]?.value ?? 'tab-0';

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList
        variant="line"
        className="mb-4 flex h-auto w-full justify-start gap-0 overflow-x-auto border-b border-border bg-transparent p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {normalizedTabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-auto min-w-max rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground after:hidden data-active:border-primary data-active:text-primary"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {normalizedTabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="space-y-4"
        >
          {tab.blocks.map((block, index) => (
            <RequirementBlock
              key={`${tab.value}-${block.title ?? index}`}
              block={block}
            />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function RequirementBlock({
  block,
}: {
  block: GroupedRequirementTab['blocks'][number];
}) {
  const items = block.items.map((item) => ({
    ...item,
    text: normalizeRequirementText(item.text),
  }));
  const title = block.title?.trim() || null;

  return (
    <div className="space-y-3">
      {title ? <h4 className="text-sm font-medium text-primary">{title}</h4> : null}
      <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        {items.map((item) => (
          <div key={`${item.text}-${item.sortOrder}`} className="leading-relaxed">
            {item.pdfUrl ? (
              <a
                href={item.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-foreground"
              >
                • {item.text}
              </a>
            ) : (
              <span>• {item.text}</span>
            )}
          </div>
        ))}
      </div>
      {block.guides.length > 0 ? (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Guías de esta modalidad
          </p>
          <ul className="space-y-2 text-xs sm:text-sm">
            {block.guides.map((guide) => (
              <li key={`${guide.url}-${guide.sortOrder}`}>
                <a
                  href={guide.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  {guide.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function normalizeTabs(tabs: GroupedRequirementTab[]) {
  const grouped = new Map<
    string,
    { label: string; value: string; blocks: GroupedRequirementTab['blocks'] }
  >();

  for (const tab of tabs) {
    const label = normalizeTabLabel(tab.tabName);
    const current = grouped.get(label);

    if (current) {
      current.blocks.push(...tab.blocks);
      continue;
    }

    grouped.set(label, {
      label,
      value: buildTabValue(label, grouped.size),
      blocks: [...tab.blocks],
    });
  }

  return [...grouped.values()];
}

function normalizeTabLabel(raw: string) {
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  return cleaned || 'GENERAL';
}

function buildTabValue(label: string, index: number) {
  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug ? `${slug}-${index}` : `tab-${index}`;
}

function normalizeRequirementText(text: string) {
  return text.replace(/^[\u2022\-]\s*/, '').replace(/\s+/g, ' ').trim();
}
