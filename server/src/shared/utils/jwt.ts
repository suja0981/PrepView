import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import {StringValue} from "ms";

type JwtPayload = {
  userId: string;
  email: string;
};

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN  as StringValue,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}