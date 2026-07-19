import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { AppError } from "../errors/app-error";

export function errorHandlerMiddleware(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: error.flatten(),
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  logger.error({ error }, "Unhandled application error");

  response.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      details:
        env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.stack
            : error
          : undefined,
    },
  });
}
