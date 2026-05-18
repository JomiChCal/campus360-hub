ALTER TABLE "ServicePeriodModality"
  ADD COLUMN IF NOT EXISTS "enabledFrom" DATE,
  ADD COLUMN IF NOT EXISTS "enabledTo" DATE;
