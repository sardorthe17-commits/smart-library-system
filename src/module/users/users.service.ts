import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Users } from "./model/users.model";
import { Model } from "mongoose";
import { getSecretAdminEmail } from "../../core/configs/admin.config";
import type { Request, Response } from "express";
import { RegisterDto } from "../auth/dto/register.dto";
import { UserRoles } from "../../common/decorators/role.decorators";
import { MailerService } from "../../common/mail/mailer.service";
import { getAccessToken } from "../../core/configs/token-config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from 'bcrypt';
import { RedisService } from "../../common/redis/redis.service";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(Users.name) private readonly model: Model<Users>,
        private readonly mailerService: MailerService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) { }

    async getAll(search?: string) {
        let query = {};

        if (search) {
            query = {
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        return this.model.find(query).select('-password').sort({ createdAt: -1 }).exec();
    }

    async getOne(id: string) {
        const user = await this.model.findById(id).select('-password').exec();
        if (!user) {
            throw new NotFoundException("Foydalanuvchi topilmadi!");
        }
        return user;
    }
    async emailHave(email: string) {
        return await this.model.findOne({ email: email })
    }
    async update(id: string, updateData: Partial<Users>) {
        const updatedUser = await this.model
            .findByIdAndUpdate(id, updateData, { new: true })
            .select('-password')
            .exec();

        if (!updatedUser) {
            throw new NotFoundException("Yangilash uchun foydalanuvchi topilmadi!");
        }
        return updatedUser;
    }

    async delete(id: string, res: Response) {
        const user = await this.model.findOne({ _id: id })

        if (user?.email == getSecretAdminEmail()) return res.redirect(`/admin/users?message=Super Admin\'ni O\'zgartirib bo'lmaydi!`);

        const result = await this.model.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException("O'chirish uchun foydalanuvchi topilmadi!");
        }
        return result;
    }

    async updateRole(id: string, role: string, res: Response) {
        const user = await this.model.findOne({ _id: id })

        if (user?.email == getSecretAdminEmail()) return res.redirect(`/admin/users?message=Super Admin\'ni O\'zgartirib bo'lmaydi!`);

        const updatedUser = await this.model
            .findByIdAndUpdate(id, { role }, { new: true })
            .exec();

        if (!updatedUser) {
            throw new NotFoundException("Rolini o'zgartirish uchun foydalanuvchi topilmadi!");
        }
        return updatedUser;
    }

    async usersCreate(dto: RegisterDto) {
        const heshPass = await bcrypt.hash(dto.password, 10);

        const newUser = await this.model.create({
            fullName: dto.fullName,
            email: dto.email,
            password: heshPass,
            telegramId: dto.telegramId,
            isActive: false,
            role: UserRoles.user
        });

        const activationToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

        await this.mailerService.sendMailForActivate(newUser.email, activationToken);

        return newUser;
    }

    async activate(token: string, res: Response) {
        const userId = await this.redisService.get(`activate:${token}`);
        
        if (!userId) {
            return res.redirect('/?message=Aktivatsiya havolasi eskirgan yoki notoogri!');
        }

        const user = await this.model.findById(userId);
        
        if (!user) {
            return res.redirect('/?message=Foydalanuvchi topilmadi!');
        }

        const newUser = await this.model.findByIdAndUpdate(user._id,{
            isActive:true
        })

        const activationToken = Math.random().toString(36).substring(2, 15);

        await this.redisService.set(`activate:${activationToken}`, newUser!._id.toString(), 15 * 60);

        await this.mailerService.sendMailForActivate(newUser!.email, activationToken);

        return res.redirect('/?message=Akkaunt muvaffaqiyatli faollashtirildi! 🎉');
    }
}