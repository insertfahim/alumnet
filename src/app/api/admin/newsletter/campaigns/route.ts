import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth";

export const GET = requireAdmin(async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const status = searchParams.get("status") || "all";

        const skip = (page - 1) * limit;
        const where: any = {};

        if (status !== "all") {
            where.status = status;
        }

        const [campaigns, totalCampaigns] = await Promise.all([
            prisma.campaign.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    subject: true,
                    bodyHtml: true,
                    bodyText: true,
                    category: true,
                    status: true,
                    scheduledAt: true,
                    sentAt: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            sends: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.campaign.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCampaigns / limit);

        return NextResponse.json({
            campaigns,
            pagination: {
                currentPage: page,
                totalPages,
                totalCampaigns,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Get campaigns error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});

export const POST = requireAdmin(async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { title, subject, content, category, scheduledFor } = body;

        if (!title || !subject || !content) {
            return NextResponse.json(
                { error: "Title, subject, and content are required" },
                { status: 400 }
            );
        }

        const campaign = await prisma.campaign.create({
            data: {
                title,
                subject,
                bodyHtml: content,
                bodyText: "",
                category: category || "general",
                status: scheduledFor ? "SCHEDULED" : "DRAFT",
                scheduledAt: scheduledFor ? new Date(scheduledFor) : null,
            },
        });

        return NextResponse.json({
            message: "Campaign created successfully",
            campaign,
        });
    } catch (error) {
        console.error("Create campaign error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});

export const PATCH = requireAdmin(async (req: NextRequest) => {
    try {
        const body = await req.json();
        const {
            campaignId,
            title,
            subject,
            content,
            category,
            scheduledFor,
            status,
        } = body;

        if (!campaignId) {
            return NextResponse.json(
                { error: "Campaign ID is required" },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (subject !== undefined) updateData.subject = subject;
        if (content !== undefined) updateData.bodyHtml = content;
        if (category !== undefined) updateData.category = category;
        if (scheduledFor !== undefined)
            updateData.scheduledAt = scheduledFor
                ? new Date(scheduledFor)
                : null;
        if (status !== undefined) updateData.status = status;

        const campaign = await prisma.campaign.update({
            where: { id: campaignId },
            data: updateData,
        });

        return NextResponse.json({
            message: "Campaign updated successfully",
            campaign,
        });
    } catch (error) {
        console.error("Update campaign error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});

export const DELETE = requireAdmin(async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { campaignId } = body;

        if (!campaignId) {
            return NextResponse.json(
                { error: "Campaign ID is required" },
                { status: 400 }
            );
        }

        // Check if campaign has been sent
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: { status: true },
        });

        if (campaign?.status === "SENT") {
            return NextResponse.json(
                { error: "Cannot delete sent campaigns" },
                { status: 400 }
            );
        }

        await prisma.campaign.delete({
            where: { id: campaignId },
        });

        return NextResponse.json({
            message: "Campaign deleted successfully",
        });
    } catch (error) {
        console.error("Delete campaign error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});
