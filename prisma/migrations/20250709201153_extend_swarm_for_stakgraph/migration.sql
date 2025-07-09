-- AlterTable
ALTER TABLE "swarms" ADD COLUMN     "environment_variables" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "pool_name" TEXT,
ADD COLUMN     "repository_description" TEXT,
ADD COLUMN     "repository_name" TEXT,
ADD COLUMN     "repository_url" TEXT,
ADD COLUMN     "swarm_api_key" TEXT;
