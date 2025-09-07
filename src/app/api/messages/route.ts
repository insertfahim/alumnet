import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createThreadSchema = z.object({
    participantId: z.string(),
});

const sendMessageSchema = z.object({
    content: z.string().min(1).max(1000),
});

// GET /api/messages - Get user's message threads
async function getThreads(req: AuthenticatedRequest) {
    try {
        const threads = await prisma.messageThread.findMany({
            where: {
                participants: {
                    some: {
                        id: req.user!.id,
                    },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        createdAt: true,
                        readBy: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        // Format threads for frontend
        const formattedThreads = threads.map((thread: any) => {
            const otherParticipant = thread.participants.find(
                (p: any) => p.id !== req.user!.id
            );
            const lastMessage = thread.messages[0];

            return {
                id: thread.id,
                participant: otherParticipant,
                lastMessage: lastMessage || null,
                unreadCount: thread.messages.filter(
                    (msg: any) =>
                        msg.senderId !== req.user!.id &&
                        !msg.readBy.includes(req.user!.id)
                ).length,
                updatedAt: thread.updatedAt,
            };
        });

        return NextResponse.json({ threads: formattedThreads });
    } catch (error) {
        console.error("Get threads error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/messages - Create new thread or send message
async function createOrSendMessage(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const url = new URL(req.url);
        const threadId = url.searchParams.get("threadId");

        if (threadId) {
            // Send message to existing thread
            const { content } = sendMessageSchema.parse(body);

            // Verify user is participant in thread
            const thread = await prisma.messageThread.findFirst({
                where: {
                    id: threadId,
                    participants: {
                        some: { id: req.user!.id },
                    },
                },
            });

            if (!thread) {
                return NextResponse.json(
                    { error: "Thread not found or access denied" },
                    { status: 404 }
                );
            }

            // Create message
            const message = await prisma.threadMessage.create({
                data: {
                    threadId,
                    senderId: req.user!.id,
                    content,
                    readBy: [req.user!.id], // Sender automatically reads their own message
                },
            });

            // Update thread timestamp
            await prisma.messageThread.update({
                where: { id: threadId },
                data: { updatedAt: new Date() },
            });

            return NextResponse.json({ message });
        } else {
            // Create new thread
            const { participantId } = createThreadSchema.parse(body);

            // Check if thread already exists
            const existingThread = await prisma.messageThread.findFirst({
                where: {
                    participants: {
                        every: {
                            id: { in: [req.user!.id, participantId] },
                        },
                    },
                },
                include: {
                    participants: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                        },
                    },
                },
            });

            if (existingThread) {
                return NextResponse.json({ thread: existingThread });
            }

            // Create new thread
            const thread = await prisma.messageThread.create({
                data: {
                    participants: {
                        connect: [{ id: req.user!.id }, { id: participantId }],
                    },
                },
                include: {
                    participants: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                        },
                    },
                },
            });

            return NextResponse.json({ thread });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Create/send message error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export const GET = requireAuth(getThreads);
export const POST = requireAuth(createOrSendMessage);
