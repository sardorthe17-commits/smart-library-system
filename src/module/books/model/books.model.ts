import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // createdAt va updatedAt avtomat qo'shilishi uchun
export class Books extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  isbn: string;

  @Prop({ type: Number, required: true }) 
  publishedYear: number;                  

  @Prop({ type: Number, required: true })
  availableCopies: number;

  @Prop({ default: 'default-cover.png' })
  coverImage: string;
}

export const BooksSchema = SchemaFactory.createForClass(Books);