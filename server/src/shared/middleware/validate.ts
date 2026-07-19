import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        error: result.error,
      });
    }

    req.body = result.data;
    next();
  };
}
