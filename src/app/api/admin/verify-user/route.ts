import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifyUserSchema = z.object({
    userId: z.string(),
    isVerified: z.boolean(),
});

async function handler(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const { userId, isVerified } = verifyUserSchema.parse(body);

        // Update user verification status
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isVerified,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isVerified: true,
            },
        });

        // Create verification record if verified
        if (isVerified) {
            await prisma.verification.upsert({
                where: { userId },
                create: {
                    userId,
                    verifiedById: req.user!.id,
                    verifiedAt: new Date(),
                    documentKey: "", // Will be updated when document is uploaded
                },
                update: {
                    verifiedById: req.user!.id,
                    verifiedAt: new Date(),
                },
            });
        } else {
            // Remove verification if unverified
            await prisma.verification.deleteMany({
                where: { userId },
            });
        }

        return NextResponse.json({
            success: true,
            user,
            message: `User ${
                isVerified ? "verified" : "unverified"
            } successfully`,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Verification error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export const POST = requireAdmin(handler);
