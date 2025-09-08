import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const createCampaignSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    goalAmountCents: z.number().min(1),
    currency: z.string().default("USD"),
    endDate: z.string().optional(),
    coverImage: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "active";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const where =
            status === "active"
                ? { isActive: true }
                : status === "ended"
                ? { isActive: false, endDate: { lte: new Date() } }
                : {};

        const [campaigns, total] = await Promise.all([
            prisma.fundraisingCampaign.findMany({
                where,
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
                        select: {
                            amountCents: true,
                            isAnonymous: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.fundraisingCampaign.count({ where }),
        ]);

        // Calculate current amounts for each campaign
        const campaignsWithStats = campaigns.map((campaign) => {
            const currentAmountCents = campaign.donations.reduce(
                (sum, donation) => sum + donation.amountCents,
                0
            );

            const totalDonations = campaign.donations.length;
            const progress =
                campaign.goalAmountCents > 0
                    ? (currentAmountCents / campaign.goalAmountCents) * 100
                    : 0;

            return {
                ...campaign,
                currentAmountCents,
                totalDonations,
                progress: Math.min(progress, 100),
                donations: undefined, // Remove detailed donations from response
            };
        });

        return NextResponse.json({
            campaigns: campaignsWithStats,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return NextResponse.json(
            { error: "Failed to fetch campaigns" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = createCampaignSchema.parse(body);

        const endDate = validatedData.endDate
            ? new Date(validatedData.endDate)
            : null;

        const campaign = await prisma.fundraisingCampaign.create({
            data: {
                ...validatedData,
                endDate,
                organizerId: user.id,
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

        return NextResponse.json(campaign, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error creating campaign:", error);
        return NextResponse.json(
            { error: "Failed to create campaign" },
            { status: 500 }
        );
    }
}
