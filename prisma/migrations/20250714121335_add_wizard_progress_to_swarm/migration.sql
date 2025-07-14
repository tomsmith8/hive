-- AlterTable
ALTER TABLE "swarms" ADD COLUMN     "wizardStatus" TEXT NOT NULL DEFAULT 'idle',
ADD COLUMN     "wizardStep" INTEGER NOT NULL DEFAULT 1;
