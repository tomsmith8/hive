-- AlterTable
ALTER TABLE "users" ADD COLUMN     "github_token_created_at" TIMESTAMP(3),
ADD COLUMN     "github_token_expires_at" TIMESTAMP(3);
