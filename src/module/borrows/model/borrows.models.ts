import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ collection: 'borrowed', timestamps: true, versionKey: false })
export class Borrowed extends Document {
    
    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Books', required: true })
    bookId: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    borrowedAt: Date;

    @Prop({ type: Date, default: null })
    returnedAt: Date;
}

export const BorrowedSchema = SchemaFactory.createForClass(Borrowed);