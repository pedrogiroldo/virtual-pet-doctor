import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgentChatSessionService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserActiveChatSession(userId: string) {
    try {
      const activeChatSession =
        await this.prismaService.agentChatSession.findFirst({
          where: {
            userId,
            lastMessageTimestamp: {
              gt: new Date(Date.now() - 1000 * 60 * 5),
            },
          },
        });
      return activeChatSession;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to get user active chat session',
      );
    }
  }
  async createUserChatSession(userId: string, sessionId: string) {
    try {
      const chatSession = await this.prismaService.agentChatSession.create({
        data: {
          userId,
          sessionId,
        },
      });
      return chatSession;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create chat session');
    }
  }

  async updateChatSessionTimestamp(sessionId: string) {
    try {
      const chatSession = await this.prismaService.agentChatSession.update({
        where: { sessionId },
        data: { lastMessageTimestamp: new Date() },
      });
      return chatSession;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to update chat session timestamp',
      );
    }
  }

  async createUserChatSessionWithTimestamp(userId: string, sessionId: string) {
    try {
      const chatSession = await this.prismaService.agentChatSession.create({
        data: {
          userId,
          sessionId,
          lastMessageTimestamp: new Date(),
        },
      });
      return chatSession;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to create chat session with timestamp',
      );
    }
  }
}
