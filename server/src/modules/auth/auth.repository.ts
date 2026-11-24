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

async findByGoogleId(googleId: string) {
    return User.findOne({ googleId });
}

async createOAuthUser(data: { name: string; email: string; googleId: string; avatar?: string }) {
    return User.create({ ...data, isEmailVerified: true });
}

async linkGoogleAccount(userId: string, googleId: string, avatar?: string) {
    return User.findByIdAndUpdate(userId, { googleId, avatar }, { new: true });
}
}

export const authRepository = new AuthRepository();