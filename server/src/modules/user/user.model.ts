import{InferSchemaType, Schema, model} from "mongoose";

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        select:false, 
    },
    role:{
        type:String,
        enum:["ADMIN","USER"],
        default:"USER",
    },
    isEmailVerified:{
        type:Boolean,
        default:false,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    updatedAt:{
        type:Date,
        default:Date.now,
    },
});

export type User= InferSchemaType<typeof userSchema>;
export const User = model("User",userSchema);
