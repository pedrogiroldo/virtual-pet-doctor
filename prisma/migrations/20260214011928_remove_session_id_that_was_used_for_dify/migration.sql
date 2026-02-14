/*
  Warnings:

  - You are about to drop the column `sessionId` on the `AgentChatSession` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AgentChatSession_sessionId_key";

-- DropIndex
DROP INDEX "AgentChatSession_userId_sessionId_idx";

-- AlterTable
ALTER TABLE "AgentChatSession" DROP COLUMN "sessionId";

-- CreateIndex
CREATE INDEX "AgentChatSession_userId_idx" ON "AgentChatSession"("userId");
