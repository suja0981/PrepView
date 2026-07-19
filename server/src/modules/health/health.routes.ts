import { Router } from "express";

import { getHealth } from "./health.controller";

const healthRouter = Router();

healthRouter.get("/", getHealth);

export { healthRouter };
