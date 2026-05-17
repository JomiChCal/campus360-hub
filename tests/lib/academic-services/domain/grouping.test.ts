import { describe, expect, it } from 'vitest';

import { groupRequirementTabsByName } from '@/lib/academic-services/domain/grouping';

describe('groupRequirementTabsByName', () => {
  it('groups multiple blocks under the same tab name', () => {
    const grouped = groupRequirementTabsByName([
      {
        tabName: 'DISTANCIA',
        title: 'Bloque A',
        sortOrder: 0,
        items: [{ text: 'A', pdfUrl: null, sortOrder: 0 }],
      },
      {
        tabName: 'DISTANCIA',
        title: 'Bloque B',
        sortOrder: 1,
        items: [{ text: 'B', pdfUrl: null, sortOrder: 0 }],
      },
    ]);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].tabName).toBe('DISTANCIA');
    expect(grouped[0].blocks).toHaveLength(2);
  });
});
