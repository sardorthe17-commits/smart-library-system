import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TelegrafModule } from 'nestjs-telegraf';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './module/users/users.module';
import { AuthGuard } from './common/guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RegAndLogModule } from './controllers/page.module';
import { AuthModule } from './module/auth/auth.module';
import { BooksModule } from './module/books/books.module';
import { BorrowedModule } from './module/borrows/borrows.module';
import { RedisModule } from './common/redis/redis.module';
import { TelegramModule } from './common/bot/bot.module';

import LocalSession from 'telegraf-session-local';
const localSession = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_SECRET_KEY') || '',
        middlewares: [localSession.middleware()],
        launchOptions: {
          webhook: {
            domain: configService.get<string>('RENDER_EXTERNAL_URL') || '',
            path: '/telegram-webhook',
          },
        },
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({
      global: true,
    }),
    UsersModule,
    AuthModule,
    RegAndLogModule,
    BooksModule,
    BorrowedModule,
    RedisModule,
    TelegramModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}