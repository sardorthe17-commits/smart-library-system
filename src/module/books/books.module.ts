import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Books, BooksSchema } from "./model/books.model";
import { BooksService } from "./books.service";
import { BooksController } from "./books.controller";
import { RedisService } from "../../common/redis/redis.service";
import { RedisModule } from "../../common/redis/redis.module";

@Module({
    imports:[
        MongooseModule.forFeature([{name:Books.name, schema:BooksSchema}]),
        RedisModule,
    ],
    controllers:[BooksController],
    providers:[BooksService],
    exports:[BooksService],
})
export class BooksModule{}