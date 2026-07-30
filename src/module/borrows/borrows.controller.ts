import { Body, Controller, Get, Param, Post, Render, Req, Res } from "@nestjs/common";
import type { Response } from "express";
import { Protected } from "../../common/guards/protected.guard";
import { BorrowedService } from "./borrows.service";
import { CreateBorrowDto } from "./dto/create.borrows";
import type { RequestWithUser } from "../../common/guards/role.guard";

@Controller('borrows')
export class BorrowedController {

    constructor(
        private readonly borrowedService: BorrowedService,
    ){}

    @Get('my-books')
    @Protected()
    @Render('user/my-books') 
    async getMyBooks(
        @Req() req: RequestWithUser
    ) {
        const userId = req.user.id;
        const myBorrows = await this.borrowedService.getAll(userId);
        const user = req.user;

        return {
            myBorrows,
            user
        };
    }

    @Post('create/:bookId')
    @Protected()
    async createBorrow(
        @Req() req: RequestWithUser,
        @Param('bookId') bookId: string,
        @Res() res: Response
    ) {
        try {
            console.log(bookId);
            
            await this.borrowedService.create(req.user.id, bookId,res);
            
            return res.redirect('/my-books?message=Kitob muvaffaqiyatli ijaraga olindi! 🎉');
        } catch (error:any) {
            return res.redirect(`/?message=${error.message}`);
        }
    }

    @Get('delete/:id')
    @Protected()
    async deleteBorrow(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        return await this.borrowedService.delete(id, res);
    }
}