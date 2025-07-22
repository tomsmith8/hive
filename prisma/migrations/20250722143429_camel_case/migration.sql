/*
  Warnings:

  - You are about to drop the column `sourceWebsocketId` on the `chat_messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "sourceWebsocketId",
ADD COLUMN     "source_websocket_id" TEXT;
