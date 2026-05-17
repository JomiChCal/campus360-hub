import type { GroupedRequirementTab, RequirementTabBlock } from './service-detail';

export type FlatRequirementTab = {
  tabName: string;
  title: string | null;
  sortOrder: number;
  items: Array<{ text: string; pdfUrl: string | null; sortOrder: number }>;
};

export function groupRequirementTabsByName(
  tabs: FlatRequirementTab[],
): GroupedRequirementTab[] {
  const byTabName = new Map<string, RequirementTabBlock[]>();

  const sorted = [...tabs].sort((a, b) => a.sortOrder - b.sortOrder);

  for (const tab of sorted) {
    const blocks = byTabName.get(tab.tabName) ?? [];
    blocks.push({
      title: tab.title,
      items: [...tab.items].sort((a, b) => a.sortOrder - b.sortOrder),
    });
    byTabName.set(tab.tabName, blocks);
  }

  return [...byTabName.entries()].map(([tabName, blocks]) => ({
    tabName,
    blocks,
  }));
}
