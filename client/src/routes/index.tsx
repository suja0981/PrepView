import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// Lazy loaded page components for optimal code-splitting
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const PracticePage = lazy(() => import("@/pages/interview/PracticePage"));
const CreateTextInterview = lazy(() => import("@/pages/interview/CreateTextInterview"));
const CreateVoiceInterview = lazy(() => import("@/pages/interview/CreateVoiceInterview"));
const Interview = lazy(() => import("@/pages/interview/Interview"));
const Report = lazy(() => import("@/pages/Report"));
const ResumeAnalyzer = lazy(() => import("@/pages/ResumeAnalyzer"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("@/pages/PaymentCancel"));
const Profile = lazy(() => import("@/pages/Profile"));
const SharedReport = lazy(() => import("@/pages/SharedReport"));
const InterviewHistory = lazy(() => import("@/pages/interview/InterviewHistory"));

function SuspenseFallback() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="font-mono text-xs text-muted-foreground">Loading PrepView...</span>
      </div>
    </div>
  );
}

function withSuspense(component: ReactNode) {
  return <Suspense fallback={<SuspenseFallback />}>{component}</Suspense>;
}

export const router = createBrowserRouter([
  // Fully public
  { path: "/", element: withSuspense(<Landing />) },
  { path: "/report/share/:shareToken", element: withSuspense(<SharedReport />) },

  // Public auth routes
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: withSuspense(<Login />) },
          { path: "/register", element: withSuspense(<Register />) },
        ],
      },
    ],
  },

  // Protected app routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: withSuspense(<Dashboard />) },

          // Practice hub + create flows
          { path: "/interview/create", element: withSuspense(<PracticePage />) },
          { path: "/interview/text/create", element: withSuspense(<CreateTextInterview />) },
          { path: "/interview/voice/create", element: withSuspense(<CreateVoiceInterview />) },

          // Session & report
          { path: "/interview/:id", element: withSuspense(<Interview />) },
          { path: "/interview/:id/report", element: withSuspense(<Report />) },

          // Tools
          { path: "/resume", element: withSuspense(<ResumeAnalyzer />) },

          // History
          { path: "/interviews", element: withSuspense(<InterviewHistory />) },

          // Payments
          { path: "/pricing", element: withSuspense(<Pricing />) },
          { path: "/payment/success", element: withSuspense(<PaymentSuccess />) },
          { path: "/payment/cancel", element: withSuspense(<PaymentCancel />) },

          // Profile
          { path: "/profile", element: withSuspense(<Profile />) },
        ],
      },
    ],
  },

  // 404
  { path: "*", element: withSuspense(<NotFound />) },
]);
