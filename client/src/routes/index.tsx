import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";

import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Dashboard from "@/pages/dashboard/Dashboard";
import PracticePage from "@/pages/interview/PracticePage";
import CreateTextInterview from "@/pages/interview/CreateTextInterview";
import CreateVoiceInterview from "@/pages/interview/CreateVoiceInterview";
import Interview from "@/pages/interview/Interview";
import Report from "@/pages/Report";
import ResumeAnalyzer from "@/pages/ResumeAnalyzer";
import NotFound from "@/pages/NotFound";
import Pricing from "@/pages/Pricing";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

export const router = createBrowserRouter([
  // Fully public
  { path: "/", element: <Landing /> },

  // Public auth routes
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
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
          { path: "/dashboard", element: <Dashboard /> },

          // Practice hub + create flows
          { path: "/interview/create", element: <PracticePage /> },
          { path: "/interview/text/create", element: <CreateTextInterview /> },
          { path: "/interview/voice/create", element: <CreateVoiceInterview /> },

          // Session & report
          { path: "/interview/:id", element: <Interview /> },
          { path: "/interview/:id/report", element: <Report /> },

          // Tools
          { path: "/resume", element: <ResumeAnalyzer /> },

          // Payments
          { path: "/pricing", element: <Pricing /> },
          { path: "/payment/success", element: <PaymentSuccess /> },
          { path: "/payment/cancel", element: <PaymentCancel /> },
        ],
      },
    ],
  },

  // 404
  { path: "*", element: <NotFound /> },
]);