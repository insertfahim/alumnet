import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";
import { env } from "@/lib/env";
import { z } from "zod";
import crypto from "crypto";

const sendVerificationSchema = z.object({
    email: z.string().email(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = sendVerificationSchema.parse(body);

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                emailVerified: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { error: "Email is already verified" },
                { status: 400 }
            );
        }

        // Generate verification token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Delete any existing tokens for this email
        await prisma.emailVerificationToken.deleteMany({
            where: { email: user.email },
        });

        // Save verification token
        await prisma.emailVerificationToken.create({
            data: {
                email: user.email,
                token,
                expiresAt,
            },
        });

        // Send verification email
        const verificationLink = `${env.APP_URL}/auth/verify-email?token=${token}`;
        const emailTemplate = emailTemplates.emailVerification(
            verificationLink,
            user.firstName
        );

        const emailSent = await sendEmail({
            to: user.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
        });

        if (!emailSent) {
            console.error("Failed to send email verification email");
            return NextResponse.json(
                { error: "Failed to send verification email" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Verification email sent successfully",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid email address", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Email verification send error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
