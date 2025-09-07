import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest) {
    try {
        // Get unverified users
        const unverifiedUsers = await prisma.user.findMany({
            where: {
                isVerified: false,
                role: "ALUMNI",
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                graduationYear: true,
                major: true,
                createdAt: true,
                verification: {
                    select: {
                        documentKey: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Get stats
        const [
            totalUsers,
            verifiedUsers,
            pendingVerifications,
            totalDonations,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isVerified: true } }),
            prisma.user.count({ where: { isVerified: false, role: "ALUMNI" } }),
            prisma.donation.aggregate({
                _sum: { amountCents: true },
                where: { status: "COMPLETED" },
            }),
        ]);

        const stats = {
            totalUsers,
            verifiedUsers,
            pendingVerifications,
            totalDonations: (totalDonations._sum.amountCents || 0) / 100, // Convert cents to dollars
        };

        return NextResponse.json({
            unverifiedUsers,
            stats,
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export const GET = requireAdmin(handler);
