import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '../lib/db';
import { mapUtplPortalApiToSeed } from '../lib/seed/map-utpl-portal-api';
import type { UtplPortalApiRow } from '../lib/seed/utpl-portal-api-types';

const RAW_PATH = path.join(process.cwd(), 'data/utpl-portal-raw.json');
const REPORT_PATH = path.join(process.cwd(), 'data/utpl-portal-import-report.json');

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

async function main() {
  if (process.env.ACADEMIC_SERVICES_DATA_PROVIDER !== 'neon') {
    throw new Error('db:seed:servicios requires ACADEMIC_SERVICES_DATA_PROVIDER=neon');
  }

  const raw = await readFile(RAW_PATH, 'utf8');
  const rows = JSON.parse(raw) as UtplPortalApiRow[];
  const { studentTypes, report } = mapUtplPortalApiToSeed(rows);

  await prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe(`
      TRUNCATE TABLE
        "ServiceManual",
        "ServicePeriodModality",
        "ServicePeriod",
        "ServiceRequirementItem",
        "ServiceRequirementTabGuide",
        "ServiceRequirementTab",
        "ServiceRequirement",
        "Service",
        "ServiceCategory",
        "StudentType"
      RESTART IDENTITY CASCADE
    `);

      for (const st of studentTypes) {
        const studentType = await tx.studentType.create({
          data: {
            code: st.code,
            name: st.name,
            description: st.description,
            sortOrder: st.sortOrder,
            isActive: true,
          },
        });

        for (const cat of st.categories) {
          const category = await tx.serviceCategory.create({
            data: {
              studentTypeId: studentType.id,
              name: cat.name,
              slug: slugify(cat.name),
              description: cat.description,
              sortOrder: cat.sortOrder,
              isActive: true,
            },
          });

          for (const svc of cat.services) {
            await tx.service.create({
              data: {
                sourceKey: svc.sourceKey,
                sourceRowIndex: svc.sourceRowIndex,
                categoryId: category.id,
                title: svc.title,
                slug: slugify(svc.title),
                description: svc.description,
                programs: svc.programs ?? [],
                modalityLevel: svc.modalityLevel,
                responseTime: svc.responseTime,
                cost: svc.cost,
                note: svc.note,
                calendarText: svc.calendarText,
                status: svc.status,
                sortOrder: svc.sortOrder,
                isActive: svc.isActive,
                requirements: { create: (svc.requirements ?? []).map((text, sortOrder) => ({ text, sortOrder })) },
                requirementTabs: {
                  create: (svc.requirementTabs ?? []).map((tab, tabSortOrder) => ({
                    tabName: tab.tabName,
                    title: tab.title,
                    sortOrder: tabSortOrder,
                    items: {
                      create: tab.items.map((item, itemSortOrder) => ({
                        text: item.text,
                        pdfUrl: item.pdfUrl ?? null,
                        sortOrder: itemSortOrder,
                      })),
                    },
                    guides: {
                      create: (tab.guides ?? []).map((guide, guideSortOrder) => ({
                        label: guide.label,
                        url: guide.url,
                        sortOrder: guideSortOrder,
                      })),
                    },
                  })),
                },
                periods: {
                  create: (svc.periods ?? []).map((period, periodSortOrder) => ({
                    name: period.name,
                    sortOrder: periodSortOrder,
                    modalities: {
                      create: period.modalities.map((modality, modalitySortOrder) => ({
                        modality: modality.modality,
                        requestWindow: modality.requestWindow ?? null,
                        responseWindow: modality.responseWindow ?? null,
                        enabledFrom: toDate(modality.enabledFrom),
                        enabledTo: toDate(modality.enabledTo),
                        sortOrder: modalitySortOrder,
                      })),
                    },
                  })),
                },
                manuals: {
                  create: (svc.manuals ?? []).map((manual, manualSortOrder) => ({
                    label: manual.label,
                    url: manual.url,
                    sortOrder: manualSortOrder,
                  })),
                },
              },
            });
          }
        }
      }
    },
    { timeout: 120_000 },
  );

  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const counts = {
    studentTypes: await prisma.studentType.count({ where: { isActive: true } }),
    categories: await prisma.serviceCategory.count({ where: { isActive: true } }),
    publishedServices: await prisma.service.count({
      where: { status: 'published', isActive: true },
    }),
    needsReviewServices: await prisma.service.count({
      where: { status: 'needs_review' },
    }),
  };

  console.log('Seed complete:', counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
