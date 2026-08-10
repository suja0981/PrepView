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
  },
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

      expect(authRepository.create).toHaveBeenCalledWith({
        name: "Alex",
        email: "alex@example.com",
        password: "hashed_secret_123",
      });
      expect(result.token).toBe("mocked_jwt_token_456");
      expect(result.user.id).toBe("user_100");
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
