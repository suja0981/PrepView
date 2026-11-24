export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  plan?: "free" | "premium";
  planExpiresAt?: string | null;
  isEmailVerified?: boolean;
  googleId?: string | null;
  avatar?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: User;
}
