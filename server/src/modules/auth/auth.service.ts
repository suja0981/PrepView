import { authRepository } from "./auth.repository";
import { hashPassword, comparePassword } from "../../shared/utils/password";
import { generateToken } from "../../shared/utils/jwt";
import type { LoginInput, RegisterInput } from "./auth.validation";
import { AppError } from "../../shared/errors/app-error";

class AuthService {
  async register(data: RegisterInput) {
    const register = await authRepository.findByEmail(data.email);
    if (register) {
      throw new AppError("Email already exists.", 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await authRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user,
      token,
    };
  }

  async login(data: LoginInput) {
    const user = await authRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password.", 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return { user, token };
  }

  async getCurrentUser(userId: string) {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    // Auto-downgrade if subscription period has expired
    if (
      user.plan === "premium" &&
      user.planExpiresAt &&
      new Date(user.planExpiresAt).getTime() < Date.now()
    ) {
      user.plan = "free";
      user.stripeSubscriptionId = null;
      user.planExpiresAt = null;
      await user.save();
    }

    return user;
  }
}

export const authService = new AuthService();
