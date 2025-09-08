import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const updateCampaignSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(1000).optional(),
    goalAmountCents: z.number().min(1).optional(),
    currency: z.string().optional(),
    endDate: z.string().optional(),
    coverImage: z.string().optional(),
    isActive: z.boolean().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const campaign = await prisma.fundraisingCampaign.findUnique({
            where: { id: params.id },
            include: {
                organizer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
                donations: {
                    where: { status: "COMPLETED" },
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        // Calculate current amount and stats
        const currentAmountCents = campaign.donations.reduce(
            (sum, donation) => sum + donation.amountCents,
            0
        );

        const totalDonations = campaign.donations.length;
        const progress =
            campaign.goalAmountCents > 0
                ? (currentAmountCents / campaign.goalAmountCents) * 100
                : 0;

        // Group donations by month for chart data
        const monthlyData = campaign.donations.reduce((acc, donation) => {
            const month = new Date(donation.createdAt).toLocaleDateString(
                "en-US",
                {
                    year: "numeric",
                    month: "short",
                }
            );
            acc[month] = (acc[month] || 0) + donation.amountCents;
            return acc;
        }, {} as Record<string, number>);

        const monthlyProgress = Object.entries(monthlyData).map(
            ([month, amount]) => ({
                month,
                amount: amount / 100, // Convert to dollars
            })
        );

        return NextResponse.json({
            ...campaign,
            currentAmountCents,
            totalDonations,
            progress: Math.min(progress, 100),
            monthlyProgress,
        });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return NextResponse.json(
            { error: "Failed to fetch campaign" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = updateCampaignSchema.parse(body);

        // Check if user owns the campaign or is admin
        const campaign = await prisma.fundraisingCampaign.findUnique({
            where: { id: params.id },
            select: { organizerId: true },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 401 }
            );
        }

        if (campaign.organizerId !== decoded.userId && user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const endDate = validatedData.endDate
            ? new Date(validatedData.endDate)
            : undefined;

        const updatedCampaign = await prisma.fundraisingCampaign.update({
            where: { id: params.id },
            data: {
                ...validatedData,
                endDate,
            },
            include: {
                organizer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedCampaign);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error updating campaign:", error);
        return NextResponse.json(
            { error: "Failed to update campaign" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        // Check if user owns the campaign or is admin
        const campaign = await prisma.fundraisingCampaign.findUnique({
            where: { id: params.id },
            select: { organizerId: true },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 401 }
            );
        }

        if (campaign.organizerId !== decoded.userId && user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        await prisma.fundraisingCampaign.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Campaign deleted successfully" });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return NextResponse.json(
            { error: "Failed to delete campaign" },
            { status: 500 }
        );
    }
}
