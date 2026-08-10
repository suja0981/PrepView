import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { corsOptions } from "./config/cors";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { apiRouter } from "./modules";
import { errorHandlerMiddleware } from "./shared/middleware/error-handler.middleware";
import { notFoundMiddleware } from "./shared/middleware/not-found.middleware";
import { authRouter } from "./modules/auth";
import { interviewRouter } from "./modules/interview";
import { dashboardRouter } from "./modules/dashboard";
import { resumeRouter } from "./modules/resume/resume.routes";
import { paymentRouter } from "./modules/payment/payment.routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    pinoHttp({
      logger,
    }),
  );
  app.use(helmet());
  app.use(cors(corsOptions));

  // Razorpay Webhook MUST receive raw Buffer BEFORE express.json() parses the request
  app.use(
    "/api/v1/payments/webhook",
    express.raw({ type: "application/json" }),
  );

  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/", (_request, response) => {
    response.status(200).json({
      success: true,
      data: {
        service: "prepview-server",
        docs: `${env.API_PREFIX}/health`,
      },
    });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/interviews", interviewRouter);
  app.use("/api/v1/dashboard", dashboardRouter);
  app.use("/api/v1/resume", resumeRouter);
  app.use("/api/v1/payments", paymentRouter);

  app.use(env.API_PREFIX, apiRouter);
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}
