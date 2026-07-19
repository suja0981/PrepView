import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}