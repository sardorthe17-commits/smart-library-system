import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator"

export class UpdateBooks{

    @IsOptional()
    @IsString()
    title?:string
    
    @IsOptional()
    @IsString()
    author?:string
    
    @IsOptional()
    @IsString()
    isbn?:string
    
    @IsOptional()
    @IsString()
    publishedYear?:string
    
    @IsOptional()
    @Type(()=>Number)
    @IsNumber()
    @Min(0)
    availableCopies?:number
    
    @IsOptional()
    @IsString()
    coverImage?:string
}