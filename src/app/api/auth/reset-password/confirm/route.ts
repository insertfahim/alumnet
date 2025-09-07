import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = resetPasswordSchema.parse(body);

        // Find and validate token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (
            !resetToken ||
            resetToken.used ||
            resetToken.expiresAt < new Date()
        ) {
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: resetToken.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update user password and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    updatedAt: new Date(),
                },
            }),
            prisma.passwordResetToken.update({
                where: { token },
                data: { used: true },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Password reset confirm error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
