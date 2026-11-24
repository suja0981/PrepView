import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/env";

let transporter: Transporter | null = null;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${env.SERVER_URL}/api/v1/auth/verify-email/${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your PrepView account</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0e14; color: #f3f4f6; margin: 0; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #161922; border: 1px solid #272a37; border-radius: 12px; padding: 32px; }
          .logo { font-size: 20px; font-weight: bold; color: #6366f1; margin-bottom: 24px; }
          h1 { font-size: 22px; font-weight: 600; margin-bottom: 16px; color: #ffffff; }
          p { font-size: 14px; line-height: 1.6; color: #9ca3af; margin-bottom: 24px; }
          .btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; margin-bottom: 24px; }
          .footer { font-size: 12px; color: #6b7280; border-top: 1px solid #272a37; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">PrepView</div>
          <h1>Verify your email address</h1>
          <p>Thank you for joining PrepView! Please click the button below to verify your email address and activate all features.</p>
          <a href="${verifyUrl}" class="btn">Verify Email Address</a>
          <p>Or copy and paste this link in your browser:<br><span style="color: #818cf8; word-break: break-all;">${verifyUrl}</span></p>
          <div class="footer">
            If you did not create an account on PrepView, you can safely ignore this email.
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: email,
        subject: "Verify your email address - PrepView",
        html,
      });
      return;
    } catch (err) {
      console.warn("Failed to send verification email via SMTP:", err);
    }
  }

  // Graceful fallback for local development or when SMTP is not configured
  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] To: ${email}`);
  console.log(`[EMAIL DISPATCH] Subject: Verify your email address - PrepView`);
  console.log(`[EMAIL DISPATCH] Verification Link: ${verifyUrl}`);
  console.log(`======================================================\n`);
}
