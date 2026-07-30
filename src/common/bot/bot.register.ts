import { Injectable } from '@nestjs/common';
import { Wizard, WizardStep, Context, Start } from 'nestjs-telegraf';
import type { WizardContext } from 'telegraf/scenes';
import { AuthSrvice } from '../../module/auth/auth.service';
import { RegisterDto } from '../../module/auth/dto/register.dto';
import bcrypt from 'bcrypt'
import type { Response } from 'express';
import { UserService } from '../../module/users/users.service';
import { getAccessTime, getAccessToken, getRefreshTime, getRefreshToken } from '../../core/configs/token-config';
import { JwtService } from '@nestjs/jwt';

@Wizard('REGISTER_WIZARD')
@Injectable()
export class RegisterScene {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService:JwtService
    ) { }

    @WizardStep(1)
    async step1(@Context() ctx: WizardContext) {
        await ctx.reply('📝 Ro\'yxatdan o\'tishni boshlaymiz! Iltimos, to\'liq ism-sharifingizni kiriting (kamida 4 ta belgi):');
        ctx.wizard.next();
    }

    @WizardStep(2)
    async step2(@Context() ctx: WizardContext) {
        const fullName = (ctx.message as any)?.text;

        if (!fullName || fullName.length < 4) {
            await ctx.reply('❌ Ism juda qisqa! Kamida 4 ta belgi bo\'lishi shart. Qaytadan kiriting:');
            return;
        }

        (ctx.wizard.state as any).fullName = fullName;

        await ctx.reply('📧 Endi elektron pochta (Email) manzilingizni kiriting:');
        ctx.wizard.next();
    }

    // 3. Parolni so'rash qadami
    @WizardStep(3)
    async step3(@Context() ctx: WizardContext) {
        const email = (ctx.message as any)?.text;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            await ctx.reply('❌ Email formati noto\'g\'ri! Iltimos, to\'g\'ri email kiriting (Masalan: misol@mail.com):');
            return;
        }
        const isExepit = await this.userService.emailHave(email);
        if (isExepit) {
            await ctx.reply('❌ Email ro\'yxatdan O\'tgan, boshq email kiriting!')
            return;
        }
        (ctx.wizard.state as any).email = email;

        await ctx.reply('🔒 Xavfsiz parol kiriting (kamida 8 ta belgi):');
        ctx.wizard.next();
    }

    @WizardStep(4)
    async step4(@Context() ctx: WizardContext) { 
        const password = (ctx.message as any)?.text;

        if (!password || password.length < 8) {
            await ctx.reply('❌ Parol juda oddiy! Kamida 8 ta belgi bo\'shi shart. Qaytadan kiriting:');
            return;
        }

        const state = ctx.wizard.state as RegisterDto;
        const telegramIdStr = ctx.from?.id.toString(); 

        const heshPass = await bcrypt.hash(password, 10);

        try {
            await ctx.reply('⏳ Ma\'lumotlar tekshirilmoqda, iltimos kuting...');

            const newUser = await this.userService.usersCreate({
                fullName: state.fullName,
                email: state.email,
                password: heshPass,
                telegramId: telegramIdStr ?? '', 
            });

            await this.accessGenarate({ id: newUser._id, role: newUser.role });
            await this.refreshGenarate({ id: newUser._id, role: newUser.role });

            console.log(`🤖 Bot orqali ro'yxatdan o'tildi. UserID: ${newUser._id}`);

            await ctx.reply(
                `🎉 Tabriklaymiz! Ro'yxatdan muvaffaqiyatli o'tdingiz.\n\n` +
                `📧 Elektron pochtangizga faollashtirish xati yuborildi. Akkauntingizni faollashtirishni unutmang!`
            );

            await ctx.scene.leave();
        } catch (error: any) {
            await ctx.reply(`❌ Ro'yxatdan o'tishda xatolik yuz berdi: ${error.message}\n\nQaytadan urinib ko'rish uchun /register komandasini bosing.`);
            await ctx.scene.leave();
        }
    }
    private async accessGenarate(payload:any): Promise<string>{
        const token = await this.jwtService.signAsync(payload,{
            secret:getAccessToken(),
            expiresIn:getAccessTime(),
        })
        return token
    }
    private async refreshGenarate(payload:any): Promise<string>{
        const token = await this.jwtService.signAsync(payload,{
            secret:getRefreshToken(),
            expiresIn:getRefreshTime() as any,
        })
        return token
    }
}