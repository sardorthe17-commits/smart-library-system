import { Injectable } from "@nestjs/common";
import { Command, Start, Update } from "nestjs-telegraf";
import { Context } from 'telegraf';
import { BooksService } from "../../module/books/books.service";
import { BorrowedService } from "../../module/borrows/borrows.service";

@Update()
@Injectable()
export class BotService {
    constructor(
        private readonly booksService: BooksService,
        private readonly borrowService: BorrowedService,
    ) {}

    @Start()
    async start(ctx: Context) {
        const welcomeMessage = 
            `📚 *Smart Library Botiga xush kelibsiz!*\n\n` +
            `Bu yerda siz kutubxonamizdagi kitoblarni ko'rishingiz va ijaraga olgan kitoblaringiz ro'yxatini tekshirishingiz mumkin.\n\n` +
            `📌 *Mavjud buyruqlar:* \n` +
            `🔹 /books — Barcha kitoblar ro'yxati\n` +
            `🔹 /register — ro'yxatan o\'tish \n` +
            `🔹 /mybooks — Mening ijaralarim`;
        
        await ctx.replyWithMarkdownV2(this.escapeMarkdown(welcomeMessage));
    }

    @Command('books')
    async getBooks(ctx: Context):Promise<void> {
        try {
            const books = await this.booksService.getAll();

            if (!books || books.length === 0) {
                await ctx.reply("Hozircha kutubxonada kitoblar mavjud emas.");
                return;
            }

            let responseMessage = `📖 *Kutubxonadagi kitoblar ro'yxati:*\n\n`;
            
            books.forEach((book, index) => {
                responseMessage += 
                    `${index + 1}\\. *${book.title}*\n` +
                    `✍️ Muallif: ${book.author}\n` +
                    `🔢 ISBN: ${book.isbn}\n` +
                    `📦 Nusxalar: ${book.availableCopies} ta\n\n`;
            });

            await ctx.replyWithMarkdownV2(this.escapeMarkdown(responseMessage));
        } catch (error:any) {
            await ctx.reply("Kitoblarni yuklashda xatolik yuz berdi: " + error.message);
        }
    }

    @Command('mybooks')
    async getMyBooks(ctx: Context):Promise<void> {
        try {
            const telegramId = ctx.from?.id;

            const activeBorrows = await this.borrowService.findActiveBorrowsByTelegramId(String(telegramId));

            if (!activeBorrows || activeBorrows.length === 0) {
                await ctx.reply("Sizda hozircha faol ijaraga olingan kitoblar mavjud emas.");
                return;
            }

            let responseMessage = `📥 *Siz ijaraga olgan kitoblar:*\n\n`;
            
            activeBorrows.forEach((borrow: any, index: number) => {
                responseMessage += 
                    `${index + 1}\\. *${borrow.bookId.title}*\n` +
                    `📅 Olingan sana: ${new Date(borrow.borrowedAt).toLocaleDateString()}\n\n`;
            });

            await ctx.replyWithMarkdownV2(this.escapeMarkdown(responseMessage));
        } catch (error) {
            await ctx.reply("Ijaradagi kitoblaringizni tekshirish uchun tizim akkauntingiz bot bilan bog'langan bo'lishi kerak.");
        }
    }

    @Command('register')
    async register(ctx: any): Promise<void> {
        await ctx.scene.enter('REGISTER_WIZARD');
    }

    private escapeMarkdown(text: string): string {
        return text.replace(/[_*\[\]()~`>#+-=|{}.!]/g, '\\$&');
    }


}