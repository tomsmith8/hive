/*
  Warnings:

  - A unique constraint covering the columns `[repository_url,workspace_id]` on the table `repositories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "repositories_repository_url_workspace_id_key" ON "repositories"("repository_url", "workspace_id");
