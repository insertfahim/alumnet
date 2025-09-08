import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateConnectionSchema = z.object({
    status: z.enum(["ACCEPTED", "DECLINED"]),
});

interface PageParams {
    params: {
        connectionId: string;
    };
}

// PUT /api/connections/[connectionId] - Update connection status
async function updateConnectionStatus(
    req: AuthenticatedRequest,
    { params }: PageParams
) {
    try {
        const { connectionId } = params;
        const body = await req.json();
        const { status } = updateConnectionSchema.parse(body);

        // Find connection and verify user is the recipient
        const connection = await prisma.connection.findFirst({
            where: {
                id: connectionId,
                toUserId: req.user!.id,
                status: "PENDING",
            },
        });

        if (!connection) {
            return NextResponse.json(
                { error: "Connection request not found or already processed" },
                { status: 404 }
            );
        }

        // Update connection status
        const updatedConnection = await prisma.connection.update({
            where: { id: connectionId },
            data: { status },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        currentCompany: true,
                        currentPosition: true,
                    },
                },
                toUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        currentCompany: true,
                        currentPosition: true,
                    },
                },
            },
        });

        return NextResponse.json({ connection: updatedConnection });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Update connection status error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export const PUT = requireAuth(updateConnectionStatus);
