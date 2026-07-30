import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateBorrowDto {
    
    @IsNotEmpty({ message: "Kitob ID si bo'sh bo'lishi mumkin emas!" })
    @IsString({ message: "Kitob ID si string formatida bo'lishi kerak!" })
    @IsMongoId({ message: "Noto'g'ri kitob ID formati (MongoId bo'lishi shart)!" })
    bookId: string;
}