import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Borrowed, BorrowedSchema } from "./model/borrows.models";
import { Books, BooksSchema } from "../books/model/books.model";
import { BorrowedController } from "./borrows.controller";
import { BorrowedService } from "./borrows.service";
import { Users, UsersSchema } from "../users/model/users.model";

@Module({
    imports:[
        MongooseModule.forFeature([{name:Borrowed.name, schema:BorrowedSchema}]),
        MongooseModule.forFeature([{name:Books.name, schema:BooksSchema}]),
        MongooseModule.forFeature([{name:Users.name, schema:UsersSchema}])
    ],
    controllers:[BorrowedController],
    providers:[BorrowedService],
    exports:[BorrowedService],
})
export class BorrowedModule{}