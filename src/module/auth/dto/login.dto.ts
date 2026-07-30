import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto{
    
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