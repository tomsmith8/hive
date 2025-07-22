-- AlterTable
ALTER TABLE "swarms" ALTER COLUMN "services" DROP NOT NULL,
ALTER COLUMN "services" DROP DEFAULT;
