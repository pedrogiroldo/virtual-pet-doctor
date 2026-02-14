-- CreateEnum
CREATE TYPE "AgentChatMessageDirection" AS ENUM ('USER', 'AGENT');

-- CreateTable
CREATE TABLE "AgentChatMessage" (
    "id" TEXT NOT NULL,
    "agentChatSessionId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "role" "AgentChatMessageDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentChatMessage_agentChatSessionId_idx" ON "AgentChatMessage"("agentChatSessionId");

-- AddForeignKey
ALTER TABLE "AgentChatMessage" ADD CONSTRAINT "AgentChatMessage_agentChatSessionId_fkey" FOREIGN KEY ("agentChatSessionId") REFERENCES "AgentChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
