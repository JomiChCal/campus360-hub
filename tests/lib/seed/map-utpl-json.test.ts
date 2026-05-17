import { describe, expect, it } from 'vitest';

import { mapUtplJsonToSeedPayload } from '@/lib/seed/map-utpl-json';
import type { UtplServicesJson } from '@/lib/seed/types';

const sample: UtplServicesJson = {
  studentTypes: [
    {
      code: 'CONTINUO',
      name: 'Continuo',
      categories: [
        {
          name: 'CAT-A',
          services: [
            {
              title: 'Servicio demo',
              isActive: true,
              requirements: ['Req 1'],
              requirementTabs: [
                {
                  tabName: 'DISTANCIA',
                  title: 'Bloque A',
                  items: [{ text: 'Item 1', pdfUrl: 'https://x.pdf' }],
                },
              ],
              periods: [
                {
                  name: 'Periodo 2026',
                  modalities: [
                    {
                      modality: 'General',
                      requestWindow: 'desde abril',
                      responseWindow: null,
                    },
                  ],
                },
              ],
              manuals: [{ label: 'Manual', url: 'https://manual' }],
            },
          ],
        },
      ],
    },
  ],
};

describe('mapUtplJsonToSeedPayload', () => {
  it('maps nested hierarchy with tabs grouped as separate rows', () => {
    const payload = mapUtplJsonToSeedPayload(sample);
    expect(payload).toHaveLength(1);
    expect(payload[0].code).toBe('CONTINUO');
    expect(payload[0].categories[0].services[0].title).toBe('Servicio demo');
    expect(payload[0].categories[0].services[0].requirementTabs[0].tabName).toBe('DISTANCIA');
    expect(payload[0].categories[0].services[0].requirements[0].text).toBe('Req 1');
  });
});
