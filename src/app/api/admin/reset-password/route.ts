import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";
import crypto from "crypto";

const adminResetSchema = z.object({
    userId: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        // TODO: Add admin authentication check here
        // For now, we'll assume this is protected by middleware

        const body = await request.json();
        const { userId } = adminResetSchema.parse(body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Generate a temporary password
        const tempPassword = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await hashPassword(tempPassword);

        // Update user password
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                updatedAt: new Date(),
            },
        });

        // Log the temporary password (in production, this should be emailed or sent securely)
        console.log("🔐 ADMIN PASSWORD RESET");
        console.log("=======================");
        console.log(`User: ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`Temporary Password: ${tempPassword}`);
        console.log(`Generated: ${new Date().toISOString()}`);
        console.log("=======================");
        console.log(
            "Please share this temporary password with the user securely"
        );
        console.log("The user should change this password after logging in");
        console.log("");

        return NextResponse.json({
            success: true,
            message: "Temporary password generated and logged to console",
            user: {
                id: user.id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Admin password reset error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
