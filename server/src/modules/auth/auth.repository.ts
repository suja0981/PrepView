import {User} from "../user/user.model";

class AuthRepository{
    async findByEmail(email:string){
        return User.findOne({email}).select("+password");
    }

async create(data:{
    name:string;
    email:string;
    password:string;
}){
    return User.create(data);
}

async findById(id:string){
    return User.findById(id);
}
}

export const authRepository = new AuthRepository();