-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('draft', 'published', 'needs_review');

-- CreateEnum
CREATE TYPE "ServiceResult" AS ENUM ('GUIA', 'TURNO');

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "sourceRowIndex" INTEGER,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "programs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modalityLevel" TEXT,
    "responseTime" TEXT,
    "cost" TEXT,
    "note" TEXT,
    "calendarText" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'draft',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "result" "ServiceResult" NOT NULL DEFAULT 'TURNO',
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequirement" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "ServiceRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequirementTab" (
    "id" SERIAL NOT NULL,
    "tabName" TEXT NOT NULL,
    "title" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "ServiceRequirementTab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequirementItem" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tabId" INTEGER NOT NULL,

    CONSTRAINT "ServiceRequirementItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequirementTabGuide" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tabId" INTEGER NOT NULL,

    CONSTRAINT "ServiceRequirementTabGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePeriod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "ServicePeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePeriodModality" (
    "id" SERIAL NOT NULL,
    "modality" TEXT NOT NULL,
    "requestWindow" TEXT,
    "responseWindow" TEXT,
    "enabledFrom" DATE,
    "enabledTo" DATE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "periodId" INTEGER NOT NULL,

    CONSTRAINT "ServicePeriodModality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceManual" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "ServiceManual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Service_sourceKey_key" ON "Service"("sourceKey");

-- CreateIndex
CREATE INDEX "Service_categoryId_sortOrder_idx" ON "Service"("categoryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Service_categoryId_slug_key" ON "Service"("categoryId", "slug");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequirement" ADD CONSTRAINT "ServiceRequirement_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequirementTab" ADD CONSTRAINT "ServiceRequirementTab_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequirementItem" ADD CONSTRAINT "ServiceRequirementItem_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "ServiceRequirementTab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequirementTabGuide" ADD CONSTRAINT "ServiceRequirementTabGuide_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "ServiceRequirementTab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePeriod" ADD CONSTRAINT "ServicePeriod_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePeriodModality" ADD CONSTRAINT "ServicePeriodModality_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "ServicePeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceManual" ADD CONSTRAINT "ServiceManual_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
