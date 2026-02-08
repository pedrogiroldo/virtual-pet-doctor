/*
  Warnings:

  - You are about to drop the column `lastMessage` on the `AgentChatSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AgentChatSession" DROP COLUMN "lastMessage",
ADD COLUMN     "lastMessageTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
