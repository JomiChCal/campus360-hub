-- CreateEnum
CREATE TYPE "ScheduleMode" AS ENUM ('normal', 'extended', 'test');

-- CreateTable
CREATE TABLE "ScheduleConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "mode" "ScheduleMode" NOT NULL DEFAULT 'normal',
    "testState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleConfig_pkey" PRIMARY KEY ("id")
);

-- Seed the default row
INSERT INTO "ScheduleConfig" ("id", "mode", "testState", "updatedAt")
VALUES (1, 'normal', NULL, CURRENT_TIMESTAMP);
