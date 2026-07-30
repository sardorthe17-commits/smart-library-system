import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, Transporter } from 'nodemailer';
import { getSecretAdminEmail } from "../../core/configs/admin.config";
import { mailSecretKeyConfig } from "../../core/configs/mailer.config";

@Injectable()
export class MailerService {
    private readonly transport: Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transport = createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: getSecretAdminEmail(),
                pass: mailSecretKeyConfig(),
            }
        });
    }

    async sendMailForActivate(to: string, activationToken: string): Promise<void> {
        const activationLink = `http://localhost:5000/users/activate?token=${activationToken}`;
        const adminEmail = getSecretAdminEmail();

        const mailOptions = {
            from: `"Smart Library" <${adminEmail}>`, 
            to: to,                                        
            subject: 'Welcome to Smart Library',               
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333;">Welcome to Smart Library! 🎉</h2>
                    <p style="font-size: 16px; color: #555;">Thank you for registering an account with our digital library system.</p>
                    <p style="font-size: 16px; color: #555;"><strong>Please activate your account</strong> by clicking the button below:</p>
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="${activationLink}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 5px; font-weight: bold;">Activate Account</a>
                    </div>
                    <p style="font-size: 12px; color: #999;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #0066cc;">${activationLink}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
                    <p style="font-size: 11px; color: #aaa; text-align: center;">Smart Library System &copy; 2026</p>
                </div>
            `,
        };

        try {
            await this.transport.sendMail(mailOptions);
            console.log(`📧 Aktivatsiya xati muvaffaqiyatli yuborildi: ${to}`);
        } catch (error: any) {
            console.error('❌ Email yuborishda xatolik yuz berdi:', error);
            throw new InternalServerErrorException('Aktivatsiya xatini yuborishda xatolik yuz berdi: ' + error.message);
        }
    }
}