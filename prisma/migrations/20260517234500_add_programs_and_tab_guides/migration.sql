ALTER TABLE "Service"
ADD COLUMN IF NOT EXISTS "programs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE TABLE IF NOT EXISTS "ServiceRequirementTabGuide" (
  "id" SERIAL NOT NULL,
  "label" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "tabId" INTEGER NOT NULL,
  CONSTRAINT "ServiceRequirementTabGuide_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "ServiceRequirementTabGuide"
  ADD CONSTRAINT "ServiceRequirementTabGuide_tabId_fkey"
  FOREIGN KEY ("tabId") REFERENCES "ServiceRequirementTab"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
