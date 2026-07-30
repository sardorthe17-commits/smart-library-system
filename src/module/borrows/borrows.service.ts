import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Borrowed } from "./model/borrows.models";
import { Model } from "mongoose";
import { RequestWithUser } from "../../common/guards/role.guard";
import { CreateBorrowDto } from "./dto/create.borrows";
import type { Response } from "express";
import { Books } from "../books/model/books.model";
import { Users } from "../users/model/users.model";

@Injectable()
export class BorrowedService {
    constructor(
        @InjectModel(Borrowed.name) private readonly model: Model<Borrowed>,
        @InjectModel(Books.name) private readonly bookModel: Model<Books>,
        @InjectModel(Users.name) private readonly userModel: Model<Users>,
    ) { }

    async getAll(userId: string) {
        return await this.model.find({ userId: userId }).populate(`userId`).populate('bookId')
    }

    async getAllBorrowsForAdmin() {
        return await this.model.find().populate('userId').populate('bookId');
    }
    async create(userId: string, bookId: string,res:Response) {
        const user = await this.userModel.findById(userId);
        if (!user || user.isActive === false) {
            return res.redirect('/?message=Kitob olish uchun akauntni Aktivatsiya qiling!');
        }

        const book = await this.bookModel.findById(bookId);
        if (!book) {
            return res.redirect('/?message=Kitob topilmadi!');
        }
        if (book.availableCopies < 1) {
            return res.redirect('/?message=Ushbu kitobning barcha nusxalari ijaraga berib bo\'lingan!');
        }

        const isAlreadyBorrowed = await this.model.findOne({
            userId: userId,
            bookId: bookId,
        });

        if (isAlreadyBorrowed) {
            return res.redirect('/?message=Sizda allaqachon bu kitob bor va hali qaytarilmagan!');
        }

        const borrowRecord = await this.model.create({
            userId: userId,
            bookId: bookId,
            borrowedAt: new Date(),
        });

        book.availableCopies -= 1;
        await book.save();

        return borrowRecord;
    }

    async delete(id: string, res: Response) {
        const result = await this.model.findByIdAndDelete(id);

        if (!result) {
            return res.redirect('/?message=Bunaqa ro\'yxat yoq!');
        }

        await this.bookModel.findByIdAndUpdate(result.bookId, {
            $inc: { availableCopies: 1 }
        });

        return res.redirect('/my-books?message=Kitob muvaffaqiyatli qaytarildi!');
    }
    async findActiveBorrowsByTelegramId(telegramId: string): Promise<Borrowed[]> {
        if (!telegramId) {
            throw new NotFoundException("Telegram ID ko'rsatilmadi!");
        }

        const user = await this.userModel.findOne({ telegramId }).exec();

        if (!user) {
            throw new NotFoundException(
                "Tizimda ushbu Telegram akkauntga bog'langan foydalanuvchi topilmadi. Avval saytdan profilingizni botga ulang!"
            );
        }

        const activeBorrows = await this.model.find({
            userId: user._id,
            returnedAt: { $exists: false },
        })
            .populate('bookId')
            .exec();

        return activeBorrows;
    }
}