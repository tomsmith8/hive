/*
  Warnings:

  - The values [DOMAIN_SETUP,SWARM_CONFIG,DEPLOYMENT,COMPLETED] on the enum `SwarmWizardStep` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SwarmWizardStep_new" AS ENUM ('WELCOME', 'REPOSITORY_SELECT', 'PROJECT_NAME', 'GRAPH_INFRASTRUCTURE', 'INGEST_CODE', 'ADD_SERVICES', 'ENVIRONMENT_SETUP', 'REVIEW_POOL_ENVIRONMENT', 'STAKWORK_SETUP');
ALTER TABLE "swarms" ALTER COLUMN "wizardStep" DROP DEFAULT;
ALTER TABLE "swarms" ALTER COLUMN "wizardStep" TYPE "SwarmWizardStep_new" USING ("wizardStep"::text::"SwarmWizardStep_new");
ALTER TYPE "SwarmWizardStep" RENAME TO "SwarmWizardStep_old";
ALTER TYPE "SwarmWizardStep_new" RENAME TO "SwarmWizardStep";
DROP TYPE "SwarmWizardStep_old";
ALTER TABLE "swarms" ALTER COLUMN "wizardStep" SET DEFAULT 'WELCOME';
COMMIT;

-- AlterTable
ALTER TABLE "swarms" ALTER COLUMN "wizardStep" SET DEFAULT 'WELCOME';
