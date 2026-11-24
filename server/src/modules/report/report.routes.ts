import { Router } from "express";
import { getSharedReport } from "./report.controller";

const reportRouter = Router();

// Public route: view shared report by unique token (no authentication required)
reportRouter.get("/share/:shareToken", getSharedReport);

export { reportRouter };
