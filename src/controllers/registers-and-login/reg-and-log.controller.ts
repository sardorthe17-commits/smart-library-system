import { Controller, Get, Query, Render, Res } from "@nestjs/common";
import type { Response } from "express";

@Controller()
export class RegAndLogContoller{
    constructor(){}
    
    @Get('sign-up')
    async registerPage(@Res() res: Response, @Query('message') message:string) {
        return res.render('regist-and-login/register',{
            message
        });
    }

    @Get('sign-in')
    async loginPage(@Res() res: Response, @Query('message') message:string) {
        return res.render('regist-and-login/login',{
            message
        });
    }
    
}