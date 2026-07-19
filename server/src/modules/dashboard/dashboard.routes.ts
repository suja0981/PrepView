import { Router } from "express";
import { getDashboardStats } from "./dashboard.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";

const dashboardRouter = Router();

dashboardRouter.get("/", authenticate, getDashboardStats);

export { dashboardRouter };
