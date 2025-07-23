/*
  Warnings:

  - You are about to drop the column `engest_ref_id` on the `swarms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "swarms" DROP COLUMN "engest_ref_id",
ADD COLUMN     "ingest_ref_id" TEXT;
