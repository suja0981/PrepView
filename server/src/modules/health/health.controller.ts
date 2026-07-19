import type { Request, Response } from "express";

import { env } from "../../config/env";

export function getHealth(_request: Request, response: Response): void {
  response.status(200).json({
    success: true,
    data: {
      service: "prepview-server",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
}
