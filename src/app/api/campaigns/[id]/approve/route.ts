import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const approvalSchema = z.object({
    action: z.enum(["approve", "reject"]),
    rejectionReason: z.string().optional(),
});

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

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user || user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { action, rejectionReason } = approvalSchema.parse(body);

        const campaignId = params.id;

        // Find the campaign
        const campaign = await prisma.fundraisingCampaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        if (campaign.status !== "PENDING") {
            return NextResponse.json(
                { error: "Campaign is not pending approval" },
                { status: 400 }
            );
        }

        // Update campaign status
        const updatedCampaign = await prisma.fundraisingCampaign.update({
            where: { id: campaignId },
            data: {
                status: action === "approve" ? "APPROVED" : "REJECTED",
                approvedBy: user.id,
                approvedAt: new Date(),
                rejectionReason: action === "reject" ? rejectionReason : null,
            },
            include: {
                organizer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: `Campaign ${action}d successfully`,
            campaign: updatedCampaign,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error updating campaign status:", error);
        return NextResponse.json(
            { error: "Failed to update campaign status" },
            { status: 500 }
        );
    }
}
