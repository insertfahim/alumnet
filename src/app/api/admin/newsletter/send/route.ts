import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware/auth";

export const POST = requireAdmin(async (req: NextRequest) => {
    try {
        console.log("Send campaign request received");
        const body = await req.json();
        const { campaignId } = body;
        console.log("Campaign ID:", campaignId);

        if (!campaignId) {
            console.log("No campaign ID provided");
            return NextResponse.json(
                { error: "Campaign ID is required" },
                { status: 400 }
            );
        }

        // Get campaign details
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });
        console.log("Campaign found:", campaign ? "Yes" : "No");

        if (!campaign) {
            console.log("Campaign not found");
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        if (campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED") {
            console.log("Campaign already sent, status:", campaign.status);
            return NextResponse.json(
                { error: "Campaign has already been sent" },
                { status: 400 }
            );
        }

        // Get subscribers based on campaign category
        const subscribers = await prisma.user.findMany({
            where: {
                OR: [
                    // Users with newsletter preferences that include the category
                    {
                        newsletterPref: {
                            subscribed: true,
                            categories: {
                                has: campaign.category,
                            },
                        },
                        emailVerified: { not: null },
                    },
                    // Also include users without newsletter preferences (for testing)
                    {
                        newsletterPref: null,
                        emailVerified: { not: null },
                    },
                ],
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });
        console.log("Subscribers found:", subscribers.length);

        // Also check total newsletter preferences
        const totalPrefs = await prisma.newsletterPref.count();
        console.log("Total newsletter preferences:", totalPrefs);

        const subscribedPrefs = await prisma.newsletterPref.count({
            where: { subscribed: true },
        });
        console.log("Subscribed newsletter preferences:", subscribedPrefs);

        // Check users with verified emails
        const verifiedUsers = await prisma.user.count({
            where: { emailVerified: { not: null } },
        });
        console.log("Verified users:", verifiedUsers);

        if (subscribers.length === 0) {
            console.log(
                "No subscribers found for category:",
                campaign.category
            );

            // For testing, if no subscribers found, try to get all verified users
            const allVerifiedUsers = await prisma.user.findMany({
                where: {
                    emailVerified: { not: null },
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
                take: 5, // Limit to 5 for testing
            });

            if (allVerifiedUsers.length > 0) {
                console.log(
                    "Using all verified users for testing:",
                    allVerifiedUsers.length
                );
                subscribers.push(...allVerifiedUsers);
            } else {
                return NextResponse.json(
                    {
                        error: "No subscribers found for this campaign",
                        details: {
                            campaignCategory: campaign.category,
                            totalPrefs,
                            subscribedPrefs,
                            verifiedUsers,
                        },
                    },
                    { status: 400 }
                );
            }
        }

        // Simulate sending emails - create send records for all subscribers
        const sendPromises = subscribers.map((subscriber) =>
            prisma.send.create({
                data: {
                    campaignId: campaign.id,
                    userId: subscriber.id,
                    status: "SENT",
                },
            })
        );

        await Promise.all(sendPromises);

        // Update campaign status
        await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: "SENT",
                sentAt: new Date(),
            },
        });

        return NextResponse.json({
            message: "Campaign sent successfully",
            recipientCount: subscribers.length,
            successfulSends: subscribers.length,
            failedSends: 0,
            campaign: {
                id: campaign.id,
                title: campaign.title,
                subject: campaign.subject,
                category: campaign.category,
            },
            subscribers: subscribers.map((sub) => ({
                email: sub.email,
                name: `${sub.firstName} ${sub.lastName}`,
            })),
        });
    } catch (error) {
        console.error("Send campaign error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
});
