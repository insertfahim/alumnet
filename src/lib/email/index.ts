import nodemailer from "nodemailer";
import { env } from "@/lib/env";

// Create transporter
const transporter = nodemailer.createTransporter({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        const info = await transporter.sendMail({
            from: `"BRACU Alumni Portal" <${env.SMTP_FROM}>`,
            to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        console.log("Email sent:", info.messageId);
        return true;
    } catch (error) {
        console.error("Email send error:", error);
        return false;
    }
}

// Email templates
export const emailTemplates = {
    passwordReset: (resetLink: string, firstName: string) => ({
        subject: "Reset Your BRACU Alumni Portal Password",
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              background: #6366f1; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BRAC University Alumni Portal</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${firstName},</p>
              <p>We received a request to reset your password for your BRACU Alumni Portal account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>Best regards,<br>The BRACU Alumni Portal Team</p>
            </div>
            <div class="footer">
              <p>© 2024 BRAC University Alumni Portal. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
        text: `
      Hello ${firstName},

      We received a request to reset your password for your BRACU Alumni Portal account.

      Click the link below to reset your password:
      ${resetLink}

      If you didn't request this password reset, please ignore this email.

      This link will expire in 1 hour for security reasons.

      Best regards,
      The BRACU Alumni Portal Team
    `,
    }),

    welcomeEmail: (firstName: string, verificationLink?: string) => ({
        subject: "Welcome to BRACU Alumni Portal!",
        html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to BRACU Alumni Portal</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              background: #6366f1; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to BRACU Alumni Portal!</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName}!</h2>
              <p>Welcome to the BRAC University Alumni Portal! We're excited to have you join our global community of over 22,000 BRACU graduates.</p>
              
              <h3>What you can do:</h3>
              <ul>
                <li>Connect with fellow BRACU alumni worldwide</li>
                <li>Explore job opportunities posted by alumni</li>
                <li>Attend alumni events and reunions</li>
                <li>Participate in mentorship programs</li>
                <li>Stay updated with university news</li>
              </ul>

              ${
                  verificationLink
                      ? `
                <p>To get started, please verify your email address:</p>
                <a href="${verificationLink}" class="button">Verify Email</a>
              `
                      : `
                <p>Your account is ready to use! Start exploring the portal.</p>
                <a href="${env.APP_URL}/directory" class="button">Explore Alumni Directory</a>
              `
              }

              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Best regards,<br>The BRACU Alumni Portal Team</p>
            </div>
            <div class="footer">
              <p>© 2024 BRAC University Alumni Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    }),
};
