import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";
import { env } from "@/lib/env";
import { z } from "zod";
import crypto from "crypto";

const resetRequestSchema = z.object({
    email: z.string().email(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = resetRequestSchema.parse(body);

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
            },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                success: true,
                message:
                    "If an account with that email exists, a password reset link has been sent.",
            });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save reset token
        await prisma.passwordResetToken.create({
            data: {
                email: user.email,
                token,
                expiresAt,
            },
        });

        // Send reset email
        const resetLink = `${env.APP_URL}/auth/reset-password?token=${token}`;
        const emailTemplate = emailTemplates.passwordReset(
            resetLink,
            user.firstName
        );

        const emailSent = await sendEmail({
            to: user.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
        });

        if (!emailSent) {
            console.error("Failed to send password reset email");
        }

        return NextResponse.json({
            success: true,
            message:
                "If an account with that email exists, a password reset link has been sent.",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid email address", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Password reset request error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
