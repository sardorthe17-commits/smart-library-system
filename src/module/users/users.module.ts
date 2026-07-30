import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Users, UsersSchema } from "./model/users.model";
import { UserService } from "./users.service";
import { UserController } from "./users.controller";
import { MailerService } from "../../common/mail/mailer.service";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "../../common/redis/redis.module";

@Module({
    imports:[
        MongooseModule.forFeature([{name:Users.name, schema:UsersSchema}]),
        JwtModule,
        RedisModule,
    ],
    controllers:[UserController],
    providers:[UserService,MailerService],
    exports:[UserService],
})
export class UsersModule{}