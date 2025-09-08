import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const reviewCampaignSchema = z.object({
    action: z.enum(["approve", "reject"]),
    rejectionReason: z.string().optional(),
});

export async function POST(
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
        const { action, rejectionReason } = reviewCampaignSchema.parse(body);

        // Find the campaign
        const campaign = (await prisma.fundraisingCampaign.findUnique({
            where: { id: params.id },
        })) as any;

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        // Check if campaign is in pending status
        if (campaign.status !== "PENDING") {
            return NextResponse.json(
                { error: "Campaign is not pending review" },
                { status: 400 }
            );
        }

        // Prepare update data based on action
        const updateData: any = {};

        if (action === "approve") {
            updateData.status = "APPROVED";
            updateData.approvedAt = new Date();
            updateData.approvedBy = user.id;
            updateData.rejectionReason = null;
        } else {
            updateData.status = "REJECTED";
            updateData.rejectionReason =
                rejectionReason || "No reason provided";
            updateData.approvedAt = null;
            updateData.approvedBy = null;
        }

        // Update the campaign
        const updatedCampaign = await prisma.fundraisingCampaign.update({
            where: { id: params.id },
            data: updateData,
            include: {
                organizer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePicture: true,
                    },
                },
            } as any,
        });

        return NextResponse.json({
            message: `Campaign ${action}ed successfully`,
            campaign: updatedCampaign,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error reviewing campaign:", error);
        return NextResponse.json(
            { error: "Failed to review campaign" },
            { status: 500 }
        );
    }
}
