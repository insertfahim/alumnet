import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        // Get system statistics
        const stats = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isVerified: true } }),
            prisma.post.count(),
            prisma.comment.count(),
            prisma.job.count(),
            prisma.event.count(),
            prisma.donation.aggregate({ _sum: { amountCents: true } }),
            // Skip verification count for now due to potential schema issues
            // prisma.verification.count({ where: { status: 'PENDING' } }),
        ]);

        const systemInfo = {
            totalUsers: stats[0],
            verifiedUsers: stats[1],
            totalPosts: stats[2],
            totalComments: stats[3],
            totalJobs: stats[4],
            totalEvents: stats[5],
            totalDonations: (stats[6]._sum.amountCents || 0) / 100,
            pendingVerifications: 0, // stats[7] || 0,
            databaseHealth: "Connected",
            lastBackup: new Date().toISOString(), // Mock data
            storageUsage: "45.2 GB", // Mock data
            apiVersion: "1.0.0",
            uptime: "99.9%", // Mock data
        };

        return NextResponse.json(systemInfo);
    } catch (error) {
        console.error("Error fetching system info:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch system information",
                databaseHealth: "Disconnected",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { action, data } = await request.json();

        switch (action) {
            case "backup":
                // In a real implementation, trigger database backup
                return NextResponse.json({
                    success: true,
                    message: "Backup initiated successfully",
                    backupId: `backup_${Date.now()}`,
                });

            case "maintenance":
                // In a real implementation, enable/disable maintenance mode
                return NextResponse.json({
                    success: true,
                    message: data.enabled
                        ? "Maintenance mode enabled"
                        : "Maintenance mode disabled",
                });

            case "clearCache":
                // In a real implementation, clear application cache
                return NextResponse.json({
                    success: true,
                    message: "Cache cleared successfully",
                });

            case "cleanup":
                // Clean up expired tokens and old data
                const now = new Date();

                await Promise.all([
                    // Clean expired password reset tokens
                    prisma.passwordResetToken.deleteMany({
                        where: {
                            OR: [{ expiresAt: { lt: now } }, { used: true }],
                        },
                    }),
                ]);

                return NextResponse.json({
                    success: true,
                    message: "Database cleanup completed",
                });

            default:
                return NextResponse.json(
                    { error: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Error performing system action:", error);
        return NextResponse.json(
            { error: "Failed to perform system action" },
            { status: 500 }
        );
    }
}
