/*
  Warnings:

  - You are about to drop the column `pool_api_key` on the `swarms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "swarms" DROP COLUMN "pool_api_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "pool_api_key" TEXT;
