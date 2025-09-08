import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Mock auth functions for development
const getServerSession = async (
    options: any
): Promise<{ user?: { id: string } } | null> => {
    // Mock session - return null for unauthenticated users
    return null;
};

const authOptions = {};

const createDonationSchema = z.object({
    amountCents: z.number().min(100), // Minimum $1.00
    currency: z.string().default("USD"),
    recurring: z.boolean().default(false),
    frequency: z.enum(["monthly", "quarterly", "yearly"]).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    message: z.string().max(500).optional(),
    isAnonymous: z.boolean().default(false),
    campaignId: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        let where: any = {};

        // If user is authenticated, they can see their own donations
        // If not authenticated, they can only see public donations (not anonymous)
        if (session && "user" in session && session.user) {
            where.userId = session.user.id;
        } else {
            where.isAnonymous = false;
        }

        // Filter by campaign if specified
        const campaignId = searchParams.get("campaignId");
        if (campaignId) {
            where.campaignId = campaignId;
        }

        const [donations, total] = await Promise.all([
            prisma.donation.findMany({
                where,
                include: {
                    campaign: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    receipts: {
                        select: {
                            id: true,
                            receiptNum: true,
                            issuedAt: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.donation.count({ where }),
        ]);

        return NextResponse.json({
            donations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching donations:", error);
        return NextResponse.json(
            { error: "Failed to fetch donations" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const body = await request.json();
        const validatedData = createDonationSchema.parse(body);

        // If user is authenticated, use their info
        let donationData: any = {
            ...validatedData,
            status: "PENDING",
        };

        let authenticatedUser = null;

        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            if (decoded) {
                authenticatedUser = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                });
                if (authenticatedUser) {
                    donationData.userId = authenticatedUser.id;
                }
            }
        }

        if (authenticatedUser) {
            // If authenticated user wants to be anonymous, don't include their name/email
            if (validatedData.isAnonymous) {
                donationData.firstName = null;
                donationData.lastName = null;
                donationData.email = null;
            } else {
                // Use user's data if not provided
                if (
                    !validatedData.firstName ||
                    !validatedData.lastName ||
                    !validatedData.email
                ) {
                    const user = await prisma.user.findUnique({
                        where: { id: authenticatedUser.id },
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    });

                    if (user) {
                        donationData.firstName =
                            validatedData.firstName || user.firstName;
                        donationData.lastName =
                            validatedData.lastName || user.lastName;
                        donationData.email = validatedData.email || user.email;
                    }
                }
            }
        } else {
            // Guest donation - require name and email
            if (
                !validatedData.firstName ||
                !validatedData.lastName ||
                !validatedData.email
            ) {
                return NextResponse.json(
                    {
                        error: "Name and email are required for guest donations",
                    },
                    { status: 400 }
                );
            }
        }

        const donation = await prisma.donation.create({
            data: donationData,
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        organizer: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        // Update campaign current amount if donation is for a campaign
        if (donation.campaignId && donation.status === "COMPLETED") {
            await prisma.fundraisingCampaign.update({
                where: { id: donation.campaignId },
                data: {
                    currentAmountCents: {
                        increment: donation.amountCents,
                    },
                },
            });
        }

        return NextResponse.json(donation, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error creating donation:", error);
        return NextResponse.json(
            { error: "Failed to create donation" },
            { status: 500 }
        );
    }
}
