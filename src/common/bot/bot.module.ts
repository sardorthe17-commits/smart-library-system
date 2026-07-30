import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { BooksModule } from '../../module/books/books.module';
import { BorrowedModule } from '../../module/borrows/borrows.module';
import { UsersModule } from '../../module/users/users.module';
import { RegisterScene } from './bot.register';
import { AuthModule } from '../../module/auth/auth.module';

@Module({
  imports: [
    BooksModule, 
    BorrowedModule,
    UsersModule,
    AuthModule,
  ],
  providers: [BotService,RegisterScene],
})
export class TelegramModule {}