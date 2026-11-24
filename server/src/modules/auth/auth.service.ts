import crypto from "crypto";
import { authRepository } from "./auth.repository";
import { hashPassword, comparePassword } from "../../shared/utils/password";
import { generateToken } from "../../shared/utils/jwt";
import type { LoginInput, RegisterInput } from "./auth.validation";
import { AppError } from "../../shared/errors/app-error";
import { sendVerificationEmail } from "../../shared/utils/mail";

class AuthService {
  async register(data: RegisterInput) {
    const register = await authRepository.findByEmail(data.email);
    if (register) {
      throw new AppError("Email already exists.", 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await authRepository.create({
      ...data,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email asynchronously
    sendVerificationEmail(user.email, verificationToken).catch((err) => {
      console.error("Failed to send verification email:", err);
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

    if (!user.password) {
      // OAuth-only account — no local password set
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
      user.razorpaySubscriptionId = null;
      user.planExpiresAt = null;
      await user.save();
    }

    return user;
  }

  async findOrCreateOAuthUser(profile: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    // Check by googleId first
    let user = await authRepository.findByGoogleId(profile.googleId);
    if (user) return user;

    // Check by email (link accounts)
    const existingUser = await authRepository.findByEmail(profile.email);
    if (existingUser) {
      await authRepository.linkGoogleAccount(existingUser.id, profile.googleId, profile.avatar);
      return existingUser;
    }

    // New user
    return authRepository.createOAuthUser(profile);
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new AppError("Verification token is required.", 400);
    }

    const user = await authRepository.findByVerificationToken(token);
    if (!user) {
      throw new AppError("Verification link is invalid or has expired.", 400);
    }

    await authRepository.markEmailVerified(user.id);
    return user;
  }

  async resendVerificationEmail(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    if (user.isEmailVerified) {
      throw new AppError("Email is already verified.", 400);
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await authRepository.setVerificationToken(userId, verificationToken, verificationExpires);

    await sendVerificationEmail(user.email, verificationToken);

    return { success: true, message: "Verification email sent successfully." };
  }
}

export const authService = new AuthService();
