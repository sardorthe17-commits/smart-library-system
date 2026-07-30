import { Controller, Get, Param, Query, Render, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { Protected } from "../../common/guards/protected.guard";
import { BooksService } from "../../module/books/books.service";
import { BorrowedService } from "../../module/borrows/borrows.service";
import { UserService } from "../../module/users/users.service";

interface RequestWithUser extends Request {
    user: {
        id: string;
        fullName: string;
        role: string;
    }
}
@Controller()
export class HomePageController{

    constructor(
        private readonly booksService:BooksService,
        private readonly borrowedService:BorrowedService,
        private readonly userService:UserService,
    ){}

    @Get('/')
    @Protected()
    @Render('home/home-page')
    async getHomePage(
        @Query('search') search: string, 
        @Query('message') message: string,
        @Req() req: RequestWithUser
    ) {
        const books = await this.booksService.getAll(search);
        
        const stats = { 
            totalBooks: books.length, 
            availableCopies: 85,
            myBorrows: 2 
        }; 
        
        const user = req.user;

        return { 
            books, 
            stats, 
            user, 
            searchQuery: search,
            message 
        };
    }
    @Get('my-books')
    @Protected()
    @Render('home/my-books') 
    async getMyBooksPage(
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
    @Get('profile')
    @Protected()
    @Render('home/profile') 
    async getProfilePage(
        @Query('message') message: string,
        @Query('error') error: string,
        @Req() req: RequestWithUser
    ) {
        const user = await this.userService.getOne(req.user.id)

        console.log(user);
        

        return {
            user,
            message,
            error
        };
    }
    @Get('books/:id')
    @Render('home/book-info-page')
    async getBookInfo(@Param('id') id: string, @Res() res: Response) {
        try {
            const book = await this.booksService.getOne(id,res);
            
            if (!book) {
                return res.redirect('/?message=Kitob topilmadi!');
            }
            return { book };
        } catch (error) {
            return res.redirect('/?message=Xatolik yuz berdi!');
        }
    }
}