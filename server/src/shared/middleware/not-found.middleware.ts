import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error";

export function notFoundMiddleware(request: Request, _response: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${request.method} ${request.originalUrl}`, 404));
}
