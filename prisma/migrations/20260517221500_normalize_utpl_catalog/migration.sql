DO $$
BEGIN
  CREATE TYPE "ServiceStatus" AS ENUM ('draft', 'published', 'needs_review');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "StudentType"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "ServiceCategory"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "ServiceCategory"
SET "slug" = lower(regexp_replace("name", '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL OR "slug" = '';

ALTER TABLE "ServiceCategory"
  ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceCategory_studentTypeId_slug_key"
  ON "ServiceCategory"("studentTypeId", "slug");

ALTER TABLE "Service"
  ADD COLUMN IF NOT EXISTS "sourceRowIndex" INTEGER,
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "calendarText" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "ServiceStatus" NOT NULL DEFAULT 'draft';

UPDATE "Service"
SET "slug" = lower(regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL OR "slug" = '';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Service' AND column_name = 'displayKind'
  ) THEN
    EXECUTE '
      UPDATE "Service"
      SET "status" = CASE
        WHEN "displayKind" = ''SERVICE'' AND "isActive" = true THEN ''published''::"ServiceStatus"
        WHEN "displayKind" = ''SERVICE'' AND "isActive" = false THEN ''draft''::"ServiceStatus"
        ELSE ''needs_review''::"ServiceStatus"
      END
    ';
  END IF;
END $$;

ALTER TABLE "Service"
  ALTER COLUMN "slug" SET NOT NULL;

ALTER TABLE "Service"
  DROP COLUMN IF EXISTS "descriptionHtml",
  DROP COLUMN IF EXISTS "displayKind";

CREATE UNIQUE INDEX IF NOT EXISTS "Service_categoryId_slug_key"
  ON "Service"("categoryId", "slug");

DROP TYPE IF EXISTS "ServiceDisplayKind";
