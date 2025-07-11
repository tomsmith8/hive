-- AlterTable
ALTER TABLE "swarms" ADD COLUMN     "services" JSONB NOT NULL DEFAULT '[]';
