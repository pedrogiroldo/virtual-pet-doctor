import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly wahaApiUrl: string;
  private readonly wahaApiKey: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.wahaApiUrl = this.configService.get<string>('WAHA_API_URL')!;
    this.wahaApiKey = this.configService.get<string>('WAHA_API_KEY')!;
  }
  async findOrCreateUser(chatId: string) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { chatId: chatId },
      });

      if (existingUser) {
        return existingUser;
      }
      const userPushNameData = await fetch(
        `${this.wahaApiUrl}/api/contacts?contactId=${chatId}&session=default`,
        {
          headers: {
            'X-Api-Key': this.wahaApiKey,
            Accept: 'application/json',
          },
          method: 'GET',
        },
      );
      const userPushName = (await userPushNameData.json()) as {
        pushname: string;
      };

      console.log(userPushName);
      if (userPushNameData.status !== 200) {
        throw new InternalServerErrorException('Failed to get user push name');
      }

      const pushName = userPushName.pushname;
      console.log(pushName);

      const newUser = await this.prismaService.user.create({
        data: {
          chatId: chatId,
          name: pushName,
        },
      });

      return newUser;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find or create user');
    }
  }
}
