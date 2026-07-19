import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/layouts/AuthLayout";
import MainLayout from "@/layouts/MainLayout";

import Landing from "@/pages/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Dashboard from "@/pages/dashboard/Dashboard";
import PracticePage from "@/pages/interview/PracticePage";
import CreateTextInterview from "@/pages/interview/CreateTextInterview";
import Interview from "@/pages/interview/Interview";
import Report from "@/pages/Report";
import ResumeAnalyzer from "@/pages/ResumeAnalyzer";
import NotFound from "@/pages/NotFound";

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

          // Session & report
          { path: "/interview/:id", element: <Interview /> },
          { path: "/interview/:id/report", element: <Report /> },

          // Tools
          { path: "/resume", element: <ResumeAnalyzer /> },
        ],
      },
    ],
  },

  // 404
  { path: "*", element: <NotFound /> },
]);