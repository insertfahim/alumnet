import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest) {
    try {
        const userId = req.user!.id;

        // Get dashboard stats
        const [
            totalConnections,
            upcomingEvents,
            jobApplications,
            unreadMessages,
        ] = await Promise.all([
            // Count connections (mutual connections)
            prisma.connection.count({
                where: {
                    OR: [{ fromUserId: userId }, { toUserId: userId }],
                    status: "ACCEPTED",
                },
            }),
            // Count upcoming events user is attending
            prisma.eventAttendance.count({
                where: {
                    userId,
                    event: {
                        startDate: {
                            gte: new Date(),
                        },
                    },
                },
            }),
            // Count job applications
            prisma.jobApplication.count({
                where: { applicantId: userId },
            }),
            // Count unread messages (simplified - count messages not sent by user in threads)
            prisma.threadMessage.count({
                where: {
                    thread: {
                        participants: {
                            some: { id: userId },
                        },
                    },
                    senderId: {
                        not: userId,
                    },
                    NOT: {
                        readBy: {
                            has: userId,
                        },
                    },
                },
            }),
        ]);

        return NextResponse.json({
            totalConnections,
            upcomingEvents,
            jobApplications,
            unreadMessages,
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export const GET = requireAuth(handler);
