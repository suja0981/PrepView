import { User } from "./user.model";

class UserRepository {
  async findById(id: string) {
    return User.findById(id);
  }

  async updateProfile(id: string, data: { name?: string; avatar?: string }) {
    return User.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
  }

  async changePassword(id: string, hashedPassword: string) {
    return User.findByIdAndUpdate(id, { password: hashedPassword, updatedAt: new Date() }, { new: true });
  }

  async deleteAccount(id: string) {
    return User.findByIdAndDelete(id);
  }
}

export const userRepository = new UserRepository();
