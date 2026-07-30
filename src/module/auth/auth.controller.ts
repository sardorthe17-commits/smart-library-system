import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { AuthSrvice } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import type { Response } from "express";
import { LoginDto } from "./dto/login.dto";

@Controller()
export class AuthController{
    constructor(private readonly service:AuthSrvice){}

    @Post('sign-up')
    async register(@Body() dto:RegisterDto,@Res() res:Response){
        return await this.service.register(dto,res)
    }
    @Post('sign-in')
    async login(@Body() dto:LoginDto,@Res()res:Response){
        return await this.service.login(dto,res)
    }
    @Get('/auth/logout')
    async logout(@Res() res:Response){
        return await this.service.logout(res)
    }
}