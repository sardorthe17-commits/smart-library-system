import { Body, Controller, Get, Param, Post, Query, Render, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { Protected } from "../../common/guards/protected.guard";
import { UserService } from "../../module/users/users.service";
import { BooksService } from "../../module/books/books.service";
import { RolesGuard, type RequestWithUser } from "../../common/guards/role.guard";
import { BorrowedService } from "../../module/borrows/borrows.service";


@Controller('admin')
export class AdminController {

    constructor(
        private readonly userService: UserService,
        private readonly booksService: BooksService,
        private readonly borrowedService: BorrowedService,
    ){}

    @Get('dashboard')
    @UseGuards(RolesGuard)
    @Protected()
    @Render('admin/admin-panel')
    async getAdminDashboard(
        @Query('search') search: string,
        @Query('message') message: string,
        @Req() req: RequestWithUser,
        @Res() res: Response
    ) {
        const books = await this.booksService.getAll(search);
        const allUsers = await this.userService.getAll();
        const borrowed = await this.borrowedService.getAllBorrowsForAdmin();

        const stats = {
            totalBooks: books.length,
            borrowedBooks: borrowed.length, 
            totalUsers: allUsers.length
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

    @Get('users')
    @UseGuards(RolesGuard)
    @Protected()
    @Render('admin/users-list')
    async getUsersPage(
        @Query('search') search: string,
        @Query('message') message: string,
        @Req() req: RequestWithUser
    ) {
        const users = await this.userService.getAll(search);
        const user = req.user;

        return {
            users,
            user,
            searchQuery: search,
            message
        };
    }

    @Post('users/update-role/:id')
    @UseGuards(RolesGuard)
    @Protected()
    async updateUserRole(
        @Param('id') id: string,
        @Body('role') role: string,
        @Res() res: Response,
        @Req() req: Request,
    ) {
        await this.userService.updateRole(id, role,res);
        return res.redirect("/admin/users?message=Foydalanuvchi roli muvaffaqiyatli o'zgartirildi!");
    }

    @Get('users/delete/:id')
    @UseGuards(RolesGuard)
    @Protected()
    async deleteUser(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        await this.userService.delete(id,res);
        return res.redirect("/admin/users?message=Foydalanuvchi tizimdan o'chirildi!");
    }

    @Get('books/edit/:id')
    @UseGuards(RolesGuard)
    @Protected()
    @Render('admin/edit-books')
    async getEditBookPage(
        @Param('id') id: string,
        @Query('message') message: string,
        @Req() req: RequestWithUser,
        @Res() res: Response
    ) {
        // Tanlangan kitobni ID bo'yicha bazadan olamiz
        const book = await this.booksService.getOne(id,res); 
        const user = req.user;

        return {
            book,
            user,
            message
        };
    }
    @Get('borrows')
    @UseGuards(RolesGuard)
    @Protected() 
    @Render('admin/borrowed-books')
    async getAllBorrowsPage(
        @Query('message') message: string,
        @Req() req: RequestWithUser
    ) {
        const allBorrows = await this.borrowedService.getAllBorrowsForAdmin();
        const user = req.user;

        return {
            allBorrows,
            user,
            message
        };
    }
}