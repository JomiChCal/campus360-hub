import type { ScheduleConfig } from '@/lib/business-hours';
import { prisma } from '@/lib/db';

export type ScheduleConfigData = ScheduleConfig;

export async function getScheduleConfig(): Promise<ScheduleConfigData> {
  try {
    const config = await prisma.scheduleConfig.findUnique({
      where: { id: 1 },
    });
    if (!config) {
      return { mode: 'normal', testState: null };
    }
    return {
      mode: config.mode as ScheduleConfigData['mode'],
      testState: config.testState as ScheduleConfigData['testState'],
    };
  } catch (error) {
    console.warn('Error leyendo schedule config, usando default:', error instanceof Error ? error.message : error);
    return { mode: 'normal', testState: null };
  }
}

export async function updateScheduleConfig(
  mode: 'normal' | 'extended' | 'test',
  testState: string | null
): Promise<void> {
  await prisma.scheduleConfig.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      mode,
      testState,
    },
    update: {
      mode,
      testState,
    },
  });
}
