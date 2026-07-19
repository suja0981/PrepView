import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useCurrentUser } from "@/hooks/useAuth";

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useCurrentUser();

  return (
    <AuthContext.Provider
      value={{
        user: data?.data ?? null,
        isAuthenticated: !!data?.data,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }

  return context;
}