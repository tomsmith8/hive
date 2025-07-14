/*
  Warnings:

  - You are about to drop the column `wizardStatus` on the `swarms` table. All the data in the column will be lost.
  - You are about to drop the column `wizardStep` on the `swarms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "swarms" DROP COLUMN "wizardStatus",
DROP COLUMN "wizardStep",
ADD COLUMN     "swarm_secret_alias" TEXT;
