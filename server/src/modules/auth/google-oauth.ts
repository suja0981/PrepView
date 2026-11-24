import https from "https";
import { env } from "../../config/env";

export function buildGoogleAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: `${env.SERVER_URL ?? "http://localhost:4000"}/api/v1/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    ...(state ? { state } : {}),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{ access_token: string }> {
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID ?? "",
    client_secret: env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: `${env.SERVER_URL ?? "http://localhost:4000"}/api/v1/auth/google/callback`,
    grant_type: "authorization_code",
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "oauth2.googleapis.com",
        path: "/token",
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error("Token parse error"));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body.toString());
    req.end();
  });
}

export async function getGoogleUserInfo(accessToken: string): Promise<{
  sub: string;
  email: string;
  name: string;
  picture?: string;
}> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "www.googleapis.com",
        path: "/oauth2/v3/userinfo",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error("UserInfo parse error"));
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}
