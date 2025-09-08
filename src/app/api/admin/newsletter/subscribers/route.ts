import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth";

export const GET = requireAdmin(async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";

        const skip = (page - 1) * limit;
        const where: any = {};

        if (search) {
            where.user = {
                OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ],
            };
        }

        const [subscribers, totalSubscribers] = await Promise.all([
            prisma.newsletterPref.findMany({
                where: {
                    subscribed: true,
                    ...where,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                            graduationYear: true,
                            major: true,
                            createdAt: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.newsletterPref.count({
                where: {
                    subscribed: true,
                    ...where,
                },
            }),
        ]);

        // Get subscription stats
        const stats = await Promise.all([
            prisma.newsletterPref.count({ where: { subscribed: true } }),
            prisma.newsletterPref.count({ where: { subscribed: false } }),
            prisma.newsletterPref.groupBy({
                by: ["categories"],
                _count: { id: true },
                where: { subscribed: true },
            }),
        ]);

        const [subscribedCount, unsubscribedCount, categoryStats] = stats;

        const totalPages = Math.ceil(totalSubscribers / limit);

        return NextResponse.json({
            subscribers,
            pagination: {
                currentPage: page,
                totalPages,
                totalSubscribers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            stats: {
                subscribed: subscribedCount,
                unsubscribed: unsubscribedCount,
                categoryBreakdown: categoryStats,
            },
        });
    } catch (error) {
        console.error("Get subscribers error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});
