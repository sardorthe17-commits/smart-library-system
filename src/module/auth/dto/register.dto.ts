import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto{
    
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    fullName:string

    @IsOptional()
    @IsString()
    telegramId:string
    
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @MinLength(4)
    email:string
    
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password:string

}