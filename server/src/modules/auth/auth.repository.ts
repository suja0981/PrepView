import { User } from "../user/user.model";

class AuthRepository {
  async findByEmail(email: string) {
    return User.findOne({ email }).select("+password");
  }

  async create(data: {
    name: string;
    email: string;
    password?: string;
    emailVerificationToken?: string | null;
    emailVerificationExpires?: Date | null;
  }) {
    return User.create(data);
  }

  async findById(id: string) {
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

  async findByVerificationToken(token: string) {
    return User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });
  }

  async setVerificationToken(userId: string, token: string, expires: Date) {
    return User.findByIdAndUpdate(
      userId,
      {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
      { new: true }
    );
  }

  async markEmailVerified(userId: string) {
    return User.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      { new: true }
    );
  }
}

export const authRepository = new AuthRepository();
