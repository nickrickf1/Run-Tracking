-- AlterTable Run
ALTER TABLE "Run" ADD COLUMN "audioUrl" TEXT;
ALTER TABLE "Run" ADD COLUMN "gpxData" JSONB;

-- AlterTable WeeklyGoal
ALTER TABLE "WeeklyGoal" ADD COLUMN "targetRuns" INTEGER;
ALTER TABLE "WeeklyGoal" ADD COLUMN "targetPaceSec" INTEGER;
ALTER TABLE "WeeklyGoal" ADD COLUMN "targetMonthlyKm" DECIMAL(65,30);
