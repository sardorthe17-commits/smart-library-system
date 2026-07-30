import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {

    @IsOptional()
    @IsString({ message: "Ism-sharif string formatida bo'lishi kerak!" })
    @MinLength(3, { message: "Ism kamida 3 ta harfdan iborat bo'lsin!" })
    @MaxLength(50, { message: "Ism juda uzun! Maksimal 50 ta belgi." })
    fullName?: string;

    @IsOptional()
    image_url?: string;
    
}