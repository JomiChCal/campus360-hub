-- CreateEnum
CREATE TYPE "ServiceDisplayKind" AS ENUM ('SERVICE', 'SECTION_HEADER', 'SPACER');

-- AlterTable
ALTER TABLE "StudentType" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ServiceCategory" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN "descriptionHtml" TEXT,
ADD COLUMN "displayKind" "ServiceDisplayKind" NOT NULL DEFAULT 'SERVICE',
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "sourceKey" TEXT;

UPDATE "Service" SET "sourceKey" = 'legacy-' || "id"::text WHERE "sourceKey" IS NULL;

ALTER TABLE "Service" ALTER COLUMN "sourceKey" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Service_sourceKey_key" ON "Service"("sourceKey");

-- CreateIndex
CREATE INDEX "Service_categoryId_sortOrder_idx" ON "Service"("categoryId", "sortOrder");
