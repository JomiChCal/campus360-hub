import { describe, expect, it } from 'vitest';

import { serviceGeneralSchema } from '@/lib/validations/academic-service';

describe('serviceGeneralSchema', () => {
  it('requires title and categoryId', () => {
    const parsed = serviceGeneralSchema.safeParse({ title: '', categoryId: 0, isActive: true });
    expect(parsed.success).toBe(false);
  });
});
