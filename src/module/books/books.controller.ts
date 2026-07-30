import { Controller, Post, Body, Res, UseInterceptors, UploadedFile, Query, Get, Param } from "@nestjs/common";
import { BooksService } from "./books.service";
import { CreateBooks } from "./dto/create-book.dto";
import { UpdateBooks } from "./dto/update-books.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import type { Response } from "express";

@Controller('books')
export class BooksController {
    constructor(private readonly service: BooksService) {}

    @Post('create')
    @UseInterceptors(
        FileInterceptor('coverImage', {
            storage: memoryStorage(),
        }),
    )
    async create(
        @Body() dto: CreateBooks, 
        @UploadedFile() file: Express.Multer.File, 
        @Res() res: Response
    ) {
        return await this.service.create(dto, file, res);
    }

    @Post('update/:id')
    @UseInterceptors(
        FileInterceptor('coverImage', {
            storage: memoryStorage(),
        }),
    )
    async update(
        @Body() dto: UpdateBooks,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response
    ) {
        return await this.service.update(dto, id, file, res);
    }

    @Get('delete/:id')
    async delete(@Param('id') id: string, @Res() res: Response) {
        return await this.service.delete(id, res);
    }
}