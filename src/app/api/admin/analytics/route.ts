import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = parseInt(searchParams.get("period") || "30");

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        // Get user growth data
        const userGrowth = (await prisma.$queryRaw`
            SELECT
                DATE(created_at) as date,
                COUNT(*) as count
            FROM users
            WHERE created_at >= ${startDate}
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)
        `) as Array<{ date: string; count: number }>;

        // Get basic metrics
        const [
            totalUsers,
            verifiedUsers,
            activeUsersResult,
            totalPosts,
            totalJobs,
            totalEvents,
            totalMentorships,
            totalDonations,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isVerified: true } }),
            prisma.user.count({
                where: {
                    updatedAt: { gte: startDate },
                },
            }),
            prisma.post.count(),
            prisma.job.count(),
            prisma.event.count(),
            prisma.mentorshipPair.count(),
            prisma.donation.aggregate({
                _sum: { amountCents: true },
                where: { status: "COMPLETED" },
            }),
        ]);

        // Calculate rates
        const verificationRate =
            totalUsers > 0
                ? ((verifiedUsers / totalUsers) * 100).toFixed(1)
                : "0";
        const engagementRate =
            totalUsers > 0
                ? ((activeUsersResult / totalUsers) * 100).toFixed(1)
                : "0";

        // Get users by role
        const usersByRole = await prisma.user.groupBy({
            by: ["role"],
            _count: { role: true },
        });

        // Get users by graduation year
        const usersByGradYear = (await prisma.$queryRaw`
            SELECT
                graduation_year as year,
                COUNT(*) as count
            FROM users
            GROUP BY graduation_year
            ORDER BY graduation_year DESC
            LIMIT 10
        `) as Array<{ year: number; count: number }>;

        // Get top majors
        const topMajors = await prisma.user.groupBy({
            by: ["major"],
            _count: { major: true },
            orderBy: { _count: { major: "desc" } },
            take: 10,
        });

        // Get geographic data
        const geographicData = await prisma.user.groupBy({
            by: ["location"],
            _count: { location: true },
            where: { location: { not: null } },
            orderBy: { _count: { location: "desc" } },
            take: 10,
        });

        // Get recent activity
        const [newUsers, recentPosts] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prisma.post.findMany({
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    author: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
        ]);

        const analyticsData = {
            userGrowth: userGrowth.map((item) => ({
                date: item.date,
                count: Number(item.count),
            })),
            metrics: {
                totalUsers,
                verifiedUsers,
                activeUsers: activeUsersResult,
                verificationRate: `${verificationRate}%`,
                engagementRate: `${engagementRate}%`,
            },
            usersByRole: usersByRole.map((item) => ({
                role: item.role,
                count: item._count.role,
            })),
            usersByGradYear: usersByGradYear.map((item) => ({
                year: item.year,
                count: Number(item.count),
            })),
            platformUsage: {
                posts: totalPosts,
                jobs: totalJobs,
                events: totalEvents,
                mentorships: totalMentorships,
            },
            topMajors: topMajors.map((item) => ({
                major: item.major,
                count: item._count.major,
            })),
            geographicData: geographicData.map((item) => ({
                location: item.location || "Unknown",
                count: item._count.location,
            })),
            donations: {
                totalAmount: (totalDonations._sum.amountCents || 0) / 100,
                totalCount: await prisma.donation.count({
                    where: { status: "COMPLETED" },
                }),
            },
            recentActivity: {
                newUsers,
                recentPosts,
            },
        };

        return NextResponse.json(analyticsData);
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export const GET = requireAdmin(handler);
