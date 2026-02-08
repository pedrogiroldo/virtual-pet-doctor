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
  // async createUser(createUserDto: CreateUserDto) {
  //   try {
  //     const user = await this.prismaService.user.create({
  //       data: createUserDto,
  //     });
  //     return user;
  //   } catch (error) {
  //     console.error(error);
  //     throw new InternalServerErrorException('Failed to create user');
  //   }
  // }

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
            Authorization: `Bearer ${this.wahaApiKey}`,
          },
          method: 'GET',
        },
      );
      const userPushName = (await userPushNameData.json()) as {
        status: number;
        data: {
          name: string;
        };
      };

      if (userPushName.status !== 200) {
        throw new InternalServerErrorException('Failed to get user push name');
      }

      const userName = userPushName.data.name;

      const newUser = await this.prismaService.user.create({
        data: {
          chatId: chatId,
          name: userName,
        },
      });

      return newUser;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to find or create user');
    }
  }
}
