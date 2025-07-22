/*
  Warnings:

  - Made the column `services` on table `swarms` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "swarms" ALTER COLUMN "services" SET NOT NULL,
ALTER COLUMN "services" SET DEFAULT '[]';
