import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBooks {

    @IsNotEmpty()
    @IsString()
    title: string;
    
    @IsNotEmpty()
    @IsString()
    author: string;
    
    @IsNotEmpty()
    @IsString()
    isbn: string;
    
    // Yilni raqam sifatida qabul qilamiz va form-datadan kelganda Numberga o'giramiz
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    publishedYear: number;
    
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    availableCopies: number;
    
    @IsOptional() 
    coverImage: any;
}