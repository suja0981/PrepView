import { userRepository } from "./user.repository";
import { hashPassword, comparePassword } from "../../shared/utils/password";
import { AppError } from "../../shared/errors/app-error";
import { User } from "./user.model";

class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    const user = await userRepository.updateProfile(userId, data);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select("+password");
    if (!user) throw new AppError("User not found", 404);

    // OAuth users don't have a password
    if (!user.password) throw new AppError("Cannot change password for OAuth accounts", 400);

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new AppError("Current password is incorrect", 400);

    const hashed = await hashPassword(newPassword);
    await userRepository.changePassword(userId, hashed);
    return { success: true };
  }

  async deleteAccount(userId: string) {
    await userRepository.deleteAccount(userId);
    return { success: true };
  }
}

export const userService = new UserService();
