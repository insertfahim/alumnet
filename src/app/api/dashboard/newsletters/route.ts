import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest) {
    if (req.method === "GET") {
        return await handleGetNewsletters(req);
    }

    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handleGetNewsletters(req: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const category = searchParams.get("category") || "all";

        const skip = (page - 1) * limit;
        const userId = req.user?.id;

        if (!userId) {
            return NextResponse.json(
                { error: "User not authenticated" },
                { status: 401 }
            );
        }

        // Get newsletters sent to this user
        const sends = await prisma.send.findMany({
            where: {
                userId,
                status: "SENT",
                ...(category !== "all" && {
                    campaign: {
                        category: category,
                    },
                }),
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        subject: true,
                        bodyHtml: true,
                        bodyText: true,
                        category: true,
                        sentAt: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                sentAt: "desc",
            },
            skip,
            take: limit,
        });

        // Get total count for pagination
        const totalCount = await prisma.send.count({
            where: {
                userId,
                status: "SENT",
                ...(category !== "all" && {
                    campaign: {
                        category: category,
                    },
                }),
            },
        });

        const newsletters = sends.map((send) => ({
            id: send.campaign.id,
            title: send.campaign.title,
            subject: send.campaign.subject,
            content: send.campaign.bodyHtml || send.campaign.bodyText,
            category: send.campaign.category,
            sentAt: send.sentAt.toISOString(),
            receivedAt: send.sentAt.toISOString(),
            isRead: false, // You could track this with an additional field if needed
        }));

        return NextResponse.json({
            newsletters,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching newsletters:", error);
        return NextResponse.json(
            { error: "Failed to fetch newsletters" },
            { status: 500 }
        );
    }
}

export const GET = requireAuth(handler);
