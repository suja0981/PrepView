import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../auth.service";
import { authRepository } from "../auth.repository";
import { AppError } from "../../../shared/errors/app-error";

// Mock dependencies cleanly
vi.mock("../auth.repository", () => ({
  authRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByVerificationToken: vi.fn(),
    setVerificationToken: vi.fn(),
    markEmailVerified: vi.fn(),
  },
}));

vi.mock("../../../shared/utils/mail", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../shared/utils/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_secret_123"),
  comparePassword: vi.fn(),
}));

vi.mock("../../../shared/utils/jwt", () => ({
  generateToken: vi.fn().mockReturnValue("mocked_jwt_token_456"),
}));

import { comparePassword } from "../../../shared/utils/password";

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should throw AppError 409 if email already exists", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue({ id: "user_1", email: "test@example.com" } as any);

      await expect(
        authService.register({ name: "Alex", email: "test@example.com", password: "Password123" }),
      ).rejects.toThrowError(new AppError("Email already exists.", 409));
    });

    it("should hash password, create user, and return user with token", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(authRepository.create).mockResolvedValue({
        id: "user_100",
        name: "Alex",
        email: "alex@example.com",
        password: "hashed_secret_123",
      } as any);

      const result = await authService.register({
        name: "Alex",
        email: "alex@example.com",
        password: "Password123",
      });

      expect(authRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Alex",
          email: "alex@example.com",
          password: "hashed_secret_123",
          emailVerificationToken: expect.any(String),
          emailVerificationExpires: expect.any(Date),
        }),
      );
      expect(result.token).toBe("mocked_jwt_token_456");
      expect(result.user.id).toBe("user_100");
    });
  });

  describe("verifyEmail", () => {
    it("should throw AppError 400 if token is invalid or expired", async () => {
      vi.mocked(authRepository.findByVerificationToken).mockResolvedValue(null);

      await expect(authService.verifyEmail("invalid_token")).rejects.toThrowError(
        new AppError("Verification link is invalid or has expired.", 400),
      );
    });

    it("should mark email verified when valid token is provided", async () => {
      vi.mocked(authRepository.findByVerificationToken).mockResolvedValue({
        id: "user_1",
        email: "alex@example.com",
      } as any);

      const result = await authService.verifyEmail("valid_token");
      expect(authRepository.markEmailVerified).toHaveBeenCalledWith("user_1");
      expect(result.id).toBe("user_1");
    });
  });

  describe("resendVerificationEmail", () => {
    it("should throw AppError 404 if user not found", async () => {
      vi.mocked(authRepository.findById).mockResolvedValue(null);

      await expect(authService.resendVerificationEmail("nonexistent_id")).rejects.toThrowError(
        new AppError("User not found.", 404),
      );
    });

    it("should throw AppError 400 if email is already verified", async () => {
      vi.mocked(authRepository.findById).mockResolvedValue({
        id: "user_1",
        email: "alex@example.com",
        isEmailVerified: true,
      } as any);

      await expect(authService.resendVerificationEmail("user_1")).rejects.toThrowError(
        new AppError("Email is already verified.", 400),
      );
    });

    it("should generate a new token and dispatch email if unverified", async () => {
      vi.mocked(authRepository.findById).mockResolvedValue({
        id: "user_1",
        email: "alex@example.com",
        isEmailVerified: false,
      } as any);

      const result = await authService.resendVerificationEmail("user_1");
      expect(authRepository.setVerificationToken).toHaveBeenCalledWith(
        "user_1",
        expect.any(String),
        expect.any(Date),
      );
      expect(result.success).toBe(true);
    });
  });

  describe("login", () => {
    it("should throw AppError 401 if user does not exist", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue(null);

      await expect(
        authService.login({ email: "nonexistent@example.com", password: "Password123" }),
      ).rejects.toThrowError(new AppError("Invalid email or password.", 401));
    });

    it("should throw AppError 401 if password check fails", async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue({
        id: "user_1",
        email: "user@example.com",
        password: "hashed_password",
      } as any);
      vi.mocked(comparePassword).mockResolvedValue(false);

      await expect(
        authService.login({ email: "user@example.com", password: "wrong_password" }),
      ).rejects.toThrowError(new AppError("Invalid email or password.", 401));
    });

    it("should return user and token on valid credentials", async () => {
      const mockUser = {
        id: "user_1",
        email: "user@example.com",
        password: "hashed_password",
      };
      vi.mocked(authRepository.findByEmail).mockResolvedValue(mockUser as any);
      vi.mocked(comparePassword).mockResolvedValue(true);

      const result = await authService.login({ email: "user@example.com", password: "correct_password" });

      expect(result.token).toBe("mocked_jwt_token_456");
      expect(result.user.email).toBe("user@example.com");
    });
  });
});
