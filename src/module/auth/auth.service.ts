import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Users } from "../users/model/users.model";
import { Model } from "mongoose";
import { RegisterDto } from "./dto/register.dto";
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { getAccessTime, getAccessToken, getRefreshTime, getRefreshToken } from "../../core/configs/token-config";
import { UserRoles } from "../../common/decorators/role.decorators";
import type { Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { getSecretAdminEmail, getSecretAdminPass } from "../../core/configs/admin.config";
import { MailerService } from "../../common/mail/mailer.service";
import { RedisService } from "../../common/redis/redis.service";

@Injectable()
export class AuthSrvice {
    constructor(
        @InjectModel(Users.name) private readonly model: Model<Users>,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly redisService: RedisService,
    ) {}

    async register(dto: RegisterDto, res: Response) {
        const isExepit = await this.model.findOne({ role: UserRoles.admin });
        if (!isExepit) await this.adminSeed();

        if (!dto || !dto.email) {
            return res.redirect('/sign-up?message=Ma\'lumotlar to\'liq emas!');
        }

        const email = await this.model.findOne({ email: dto.email });
        console.log('EMAIL: ', email);
        if (email) return res.redirect('/sign-up?message=User regiserdan o\'tgan!');

        const heshPass = await this.heshPass(dto.password);

        const newUser = await this.model.create({
            fullName: dto.fullName,
            email: dto.email,
            password: heshPass,
            isActive: false,
            role: UserRoles.user,
        });

        const accessToken = await this.accessGenarate({ id: newUser._id, role: newUser.role });
        res.cookie('accessToken', accessToken, {
            signed: true,
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
        });

        const refreshToken = await this.refreshGenarate({ id: newUser._id, role: newUser.role });
        res.cookie('refreshToken', refreshToken, {
            signed: true,
            httpOnly: true,
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        const activationToken = Math.random().toString(36).substring(2, 15);

        await this.redisService.set(`activate:${activationToken}`, newUser!._id.toString(), 15 * 60);

        await this.mailerService.sendMailForActivate(newUser!.email, activationToken);

        return res.redirect('/');
    }

    async login(dto: LoginDto, res: Response) {
        const isExepit = await this.model.findOne({ role: UserRoles.admin });
        if (!isExepit) await this.adminSeed();

        const user = await this.model.findOne({ email: dto.email });
        if (!user) return res.redirect('/sign-in?message=Email royxatdan o\'tmagan!');

        const isSame = await this.compare(dto.password, user.password);
        if (!isSame) return res.redirect('/sign-in?message=Parol notog\'ri!');

        const accessToken = await this.accessGenarate({ id: user._id, role: user.role });
        res.cookie('accessToken', accessToken, {
            signed: true,
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
        });

        const refreshToken = await this.refreshGenarate({ id: user._id, role: user.role });
        res.cookie('refreshToken', refreshToken, {
            signed: true,
            httpOnly: true,
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        return res.redirect('/');
    }

    private async adminSeed() {
        const pass = getSecretAdminPass();
        const email = getSecretAdminEmail();

        if (!pass) {
            throw new Error("Kritik xato: SECRET_ADMIN_PASS topilmadi! .env faylini tekshiring.");
        }

        const heshPass = await this.heshPass(pass);
        await this.model.create({
            fullName: 'ADMIN',
            email: email,
            password: heshPass,
            isActive: true,
            role: UserRoles.admin,
        });
    }

    async logout(res: Response) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.redirect('/sign-in');
    }

    private async heshPass(pass: string) {
        return await bcrypt.hash(pass, 10);
    }

    private async compare(orgPass: string, pass: string) {
        return await bcrypt.compare(orgPass, pass);
    }

    private async accessGenarate(payload: any): Promise<string> {
        const token = await this.jwtService.signAsync(payload, {
            secret: getAccessToken(),
            expiresIn: getAccessTime(),
        });
        return token;
    }

    private async refreshGenarate(payload: any): Promise<string> {
        const token = await this.jwtService.signAsync(payload, {
            secret: getRefreshToken(),
            expiresIn: getRefreshTime() as any,
        });
        return token;
    }
}