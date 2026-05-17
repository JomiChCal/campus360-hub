'use client';

import type { GroupedRequirementTab } from '@/lib/academic-services/domain/service-detail';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
  tabs: GroupedRequirementTab[];
};

export function RequirementTabs({ tabs }: Props) {
  if (tabs.length === 0) return null;

  const defaultTab = tabs[0]?.tabName ?? 'tab-0';

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="mb-4 flex h-auto flex-wrap gap-2 bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.tabName}
            value={tab.tabName}
            className="rounded-full border border-utpl-border bg-white px-4 py-2 text-xs font-semibold uppercase data-[active]:border-utpl-gold data-[active]:bg-utpl-gold-light data-[active]:text-utpl-blue"
          >
            {tab.tabName}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.tabName}
          value={tab.tabName}
          className="space-y-4"
        >
          {tab.blocks.map((block, index) => (
            <RequirementBlock
              key={`${tab.tabName}-${block.title ?? index}`}
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
  return (
    <div className="rounded-lg border border-utpl-border bg-utpl-surface/60 p-4">
      {block.title ? <h4 className="mb-2 font-semibold text-utpl-blue">{block.title}</h4> : null}
      <ul className="list-disc space-y-2 pl-5 text-sm text-utpl-text">
        {block.items.map((item) => (
          <li key={`${item.text}-${item.sortOrder}`}>
            {item.pdfUrl ? (
              <a
                href={item.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="text-utpl-blue underline"
              >
                {item.text}
              </a>
            ) : (
              item.text
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
