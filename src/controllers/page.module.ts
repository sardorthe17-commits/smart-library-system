import { Module } from "@nestjs/common";
import { RegAndLogContoller } from "./registers-and-login/reg-and-log.controller";
import { HomePageController } from "./home/home.controller";
import { BooksService } from "../module/books/books.service";
import { BooksModule } from "../module/books/books.module";
import { AdminController } from "./admin/admin-panel";
import { UsersModule } from "../module/users/users.module";
import { BorrowedModule } from "../module/borrows/borrows.module";

@Module({
    imports:[
        BooksModule,UsersModule,BorrowedModule
    ],
    controllers:[RegAndLogContoller,HomePageController,AdminController],
})
export class RegAndLogModule{}