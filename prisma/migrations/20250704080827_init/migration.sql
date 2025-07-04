-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "owner_pubkey" TEXT NOT NULL,
    "owner_alias" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "name" TEXT,
    "description" TEXT,
    "avatar" TEXT,
    "jwt_token" TEXT,
    "jwt_expires_at" TIMESTAMP(3),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "owner_route_hint" TEXT,
    "github_token" TEXT,
    "github_username" TEXT,
    "github_user_id" TEXT,
    "github_organizations" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_challenges" (
    "id" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "pub_key" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_owner_pubkey_key" ON "users"("owner_pubkey");

-- CreateIndex
CREATE UNIQUE INDEX "auth_challenges_challenge_key" ON "auth_challenges"("challenge");
