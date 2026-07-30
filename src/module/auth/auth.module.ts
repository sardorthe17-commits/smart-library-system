import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Users, UsersSchema } from "../users/model/users.model";
import { AuthSrvice } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { MailerService } from "../../common/mail/mailer.service";
import { RedisModule } from "../../common/redis/redis.module";

@Module({
    imports:[
        MongooseModule.forFeature([{name:Users.name, schema:UsersSchema}]),
        JwtModule,
        RedisModule,
    ],
    controllers:[AuthController],
    providers:[AuthSrvice,MailerService],
    exports:[AuthSrvice]
})
export class AuthModule{}