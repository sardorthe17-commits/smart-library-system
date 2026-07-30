import { InjectModel } from "@nestjs/mongoose";
import { Books } from "./model/books.model";
import { Model } from "mongoose";
import type { Response } from "express";
import { CreateBooks } from "./dto/create-book.dto";
import { UpdateBooks } from "./dto/update-books.dto";
import { Injectable } from "@nestjs/common";
import { RedisService } from "../../common/redis/redis.service";
import { imagekit } from "../../core/configs/imagekit.config";

const DEFAULT_COVER = 'https://ik.imagekit.io/sardordeveloper/default-cover.png';

@Injectable()
export class BooksService {
    constructor(
        @InjectModel(Books.name) private readonly model: Model<Books>,
        private readonly redis: RedisService
    ) {}

    async getAll(search?: string) {
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } }
                ]
            };
        }
        return await this.model.find(query).sort({ createdAt: -1 });
    }

    async getOne(id: string, res: Response) {
        const ceshed = await this.redis.get(`books:${id}`)
        if (ceshed) return JSON.parse(ceshed)

        const book = await this.model.findById(id);
        if (!book) return res.redirect('/?message=Bunaqa Malumot Yoq!');

        await this.redis.set(`books:${id}`, JSON.stringify(book.toObject()))

        return book;
    }

    async delete(id: string, res: Response) {
        const book = await this.model.findByIdAndDelete(id);
        if (!book) return res.redirect('/?message=Bunaqa Malumot Yoq!');
        res.redirect('/admin/dashboard?message=Mufaqayatliy o\'chirildi');
    }

    private async uploadToImageKit(file: Express.Multer.File): Promise<string> {
        const uploaded = await imagekit.upload({
            file: file.buffer,
            fileName: `book-${Date.now()}-${file.originalname}`,
            folder: '/books',
        });
        return uploaded.url;
    }

    async create(dto: CreateBooks, file: Express.Multer.File, res: Response) {
        const books = await this.model.findOne({ title: dto.title });
        if (books) return res.redirect(`/?message=${encodeURIComponent(dto.title)} nomli kitob bor! Boshqa nom bering`);

        const coverImage = file ? await this.uploadToImageKit(file) : DEFAULT_COVER;

        await this.model.create({
            ...dto,
            coverImage
        });

        res.redirect('/admin/dashboard/?message=Yangi Kitob Qo\'shildi!');
    }

    async update(dto: UpdateBooks, id: string, file: Express.Multer.File, res: Response) {
        const currentBook = await this.model.findById(id);
        if (!currentBook) {
            return res.redirect('/?message=Kitob topilmadi!');
        }

        if (dto.title) {
            const duplicateBook = await this.model.findOne({
                title: dto.title,
                _id: { $ne: id }
            });
            if (duplicateBook) {
                return res.redirect(`/admin/dashboard/?message="${dto.title}" nomli kitob bazada allaqachon mavjud! Boshqa nom bering`);
            }
        }

        const coverImage = file ? await this.uploadToImageKit(file) : currentBook.coverImage;

        await this.model.findByIdAndUpdate(id, {
            title: dto.title ?? currentBook.title,
            author: dto.author ?? currentBook.author,
            isbn: dto.isbn ?? currentBook.isbn,
            publishedYear: dto.publishedYear ?? currentBook.publishedYear,
            availableCopies: dto.availableCopies ?? currentBook.availableCopies,
            coverImage: coverImage,
        });

        return res.redirect('/admin/dashboard?message=Kitob muvaffaqiyatli yangilandi!');
    }
}