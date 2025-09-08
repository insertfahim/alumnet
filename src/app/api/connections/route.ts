import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sendConnectionSchema = z.object({
    toUserId: z.string(),
    message: z.string().optional(),
});

const updateConnectionSchema = z.object({
    status: z.enum(["ACCEPTED", "DECLINED"]),
});

// GET /api/connections - Get user's connections
async function getConnections(req: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || "ACCEPTED";
        const type = searchParams.get("type") || "all"; // 'sent', 'received', 'all'

        let whereCondition: any = {};

        if (type === "sent") {
            whereCondition.fromUserId = req.user!.id;
        } else if (type === "received") {
            whereCondition.toUserId = req.user!.id;
        } else {
            whereCondition.OR = [
                { fromUserId: req.user!.id },
                { toUserId: req.user!.id },
            ];
        }

        if (status !== "all") {
            whereCondition.status = status;
        }

        const connections = await prisma.connection.findMany({
            where: whereCondition,
            include: {
                fromUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        currentCompany: true,
                        currentPosition: true,
                        graduationYear: true,
                        major: true,
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
                        graduationYear: true,
                        major: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Format connections for frontend
        const formattedConnections = connections.map((connection) => {
            const isFromUser = connection.fromUserId === req.user!.id;
            const otherUser = isFromUser
                ? connection.toUser
                : connection.fromUser;

            return {
                id: connection.id,
                status: connection.status,
                message: connection.message,
                createdAt: connection.createdAt,
                isOutgoing: isFromUser,
                user: otherUser,
            };
        });

        return NextResponse.json({ connections: formattedConnections });
    } catch (error) {
        console.error("Get connections error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/connections - Send connection request
async function sendConnectionRequest(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const { toUserId, message } = sendConnectionSchema.parse(body);

        // Check if users exist
        const [fromUser, toUser] = await Promise.all([
            prisma.user.findUnique({ where: { id: req.user!.id } }),
            prisma.user.findUnique({ where: { id: toUserId } }),
        ]);

        if (!fromUser || !toUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if connection already exists
        const existingConnection = await prisma.connection.findFirst({
            where: {
                OR: [
                    { fromUserId: req.user!.id, toUserId },
                    { fromUserId: toUserId, toUserId: req.user!.id },
                ],
            },
        });

        if (existingConnection) {
            return NextResponse.json(
                { error: "Connection already exists" },
                { status: 400 }
            );
        }

        // Create connection request
        const connection = await prisma.connection.create({
            data: {
                fromUserId: req.user!.id,
                toUserId,
                message,
            },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
                toUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
            },
        });

        return NextResponse.json({ connection });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Send connection request error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/connections/[connectionId] - Update connection status
async function updateConnectionStatus(
    req: AuthenticatedRequest,
    { params }: { params: { connectionId: string } }
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

export const GET = requireAuth(getConnections);
export const POST = requireAuth(sendConnectionRequest);
