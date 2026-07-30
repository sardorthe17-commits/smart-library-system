import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes } from "mongoose";
import { UserRoles } from "../../../common/decorators/role.decorators";

@Schema({collection:'users', timestamps:true, versionKey:false})
export class Users{
    @Prop({type:SchemaTypes.String,required:true})
    fullName:string

    @Prop({type:SchemaTypes.String})
    image_url?:string
    
    @Prop({type:SchemaTypes.String})
    telegramId?:string


    @Prop({type:SchemaTypes.String,required:true})
    email:string

    @Prop({type:SchemaTypes.String,required:true})
    password:string

    @Prop({type:SchemaTypes.String, enum:UserRoles, default:UserRoles.user})
    role:string

    @Prop({type:SchemaTypes.Boolean})
    isActive:boolean
}

export const UsersSchema = SchemaFactory.createForClass(Users)