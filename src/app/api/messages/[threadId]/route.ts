import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sendMessageSchema = z.object({
    content: z.string().min(1).max(1000),
});

interface PageParams {
    params: {
        threadId: string;
    };
}

// GET /api/messages/[threadId] - Get messages for a specific thread
async function getThreadMessages(
    req: AuthenticatedRequest,
    { params }: PageParams
) {
    try {
        const { threadId } = params;
        const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
        const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
        const offset = (page - 1) * limit;

        // Verify user is participant in thread
        const thread = await prisma.messageThread.findFirst({
            where: {
                id: threadId,
                participants: {
                    some: { id: req.user!.id },
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

        if (!thread) {
            return NextResponse.json(
                { error: "Thread not found or access denied" },
                { status: 404 }
            );
        }

        // Get messages
        const messages = await prisma.threadMessage.findMany({
            where: { threadId },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        });

        // Mark messages as read by current user
        const unreadMessageIds = messages
            .filter(
                (msg: any) =>
                    msg.senderId !== req.user!.id &&
                    !msg.readBy.includes(req.user!.id)
            )
            .map((msg: any) => msg.id);

        if (unreadMessageIds.length > 0) {
            await Promise.all(
                unreadMessageIds.map((messageId: string) =>
                    prisma.threadMessage.update({
                        where: { id: messageId },
                        data: {
                            readBy: {
                                push: req.user!.id,
                            },
                        },
                    })
                )
            );
        }

        return NextResponse.json({
            thread,
            messages: messages.reverse(), // Return in chronological order
            pagination: {
                page,
                limit,
                hasMore: messages.length === limit,
            },
        });
    } catch (error) {
        console.error("Get thread messages error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/messages/[threadId] - Send message to thread
async function sendMessage(req: AuthenticatedRequest, { params }: PageParams) {
    try {
        const { threadId } = params;
        const body = await req.json();
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
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Send message error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export const GET = requireAuth(getThreadMessages);
export const POST = requireAuth(sendMessage);
