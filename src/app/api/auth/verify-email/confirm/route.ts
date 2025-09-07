import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifyEmailSchema = z.object({
    token: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = verifyEmailSchema.parse(body);

        // Find and validate token
        const verificationToken =
            await prisma.emailVerificationToken.findUnique({
                where: { token },
            });

        if (
            !verificationToken ||
            verificationToken.used ||
            verificationToken.expiresAt < new Date()
        ) {
            return NextResponse.json(
                { error: "Invalid or expired verification token" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: verificationToken.email },
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

        // Update user email verification and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: new Date(),
                    updatedAt: new Date(),
                },
            }),
            prisma.emailVerificationToken.update({
                where: { token },
                data: { used: true },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Email verification confirm error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Also handle GET requests for URL-based verification
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json(
            { error: "Token is required" },
            { status: 400 }
        );
    }

    return POST(
        new NextRequest(request.url, {
            method: "POST",
            body: JSON.stringify({ token }),
            headers: {
                "Content-Type": "application/json",
            },
        })
    );
}
