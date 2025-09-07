import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

interface Activity {
    id: string;
    type: "connection" | "event" | "job" | "message";
    title: string;
    description: string;
    timestamp: string;
}

async function handler(req: AuthenticatedRequest) {
    try {
        const userId = req.user!.id;

        // Get recent activities (last 10)
        const activities: Activity[] = [];

        // Get recent connections
        const recentConnections = await prisma.connection.findMany({
            where: {
                OR: [{ fromUserId: userId }, { toUserId: userId }],
                status: "ACCEPTED",
            },
            include: {
                fromUser: {
                    select: { id: true, firstName: true, lastName: true },
                },
                toUser: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 3,
        });

        // Add connection activities
        recentConnections.forEach((connection) => {
            const otherUser =
                connection.fromUserId === userId
                    ? connection.toUser
                    : connection.fromUser;
            activities.push({
                id: `connection-${connection.id}`,
                type: "connection",
                title: `Connected with ${otherUser.firstName} ${otherUser.lastName}`,
                description: "New connection in your network",
                timestamp: connection.createdAt.toISOString(),
            });
        });

        // Get recent event attendances
        const recentEventAttendances = await prisma.eventAttendance.findMany({
            where: { userId },
            include: {
                event: {
                    select: { id: true, title: true, startDate: true },
                },
            },
            orderBy: { registeredAt: "desc" },
            take: 3,
        });

        // Add event activities
        recentEventAttendances.forEach((attendance) => {
            activities.push({
                id: `event-${attendance.id}`,
                type: "event",
                title: `Registered for ${attendance.event.title}`,
                description: `Event on ${new Date(
                    attendance.event.startDate
                ).toLocaleDateString()}`,
                timestamp: attendance.registeredAt.toISOString(),
            });
        });

        // Get recent job applications
        const recentJobApplications = await prisma.jobApplication.findMany({
            where: { applicantId: userId },
            include: {
                job: {
                    select: { id: true, title: true, company: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 3,
        });

        // Add job activities
        recentJobApplications.forEach((application) => {
            activities.push({
                id: `job-${application.id}`,
                type: "job",
                title: `Applied for ${application.job.title}`,
                description: `at ${application.job.company}`,
                timestamp: application.createdAt.toISOString(),
            });
        });

        // Get recent messages (simplified)
        const recentMessages = await prisma.threadMessage.findMany({
            where: {
                thread: {
                    participants: {
                        some: { id: userId },
                    },
                },
                senderId: {
                    not: userId,
                },
            },
            orderBy: { createdAt: "desc" },
            take: 3,
        });

        // Add message activities (simplified without sender info for now)
        recentMessages.forEach((message) => {
            activities.push({
                id: `message-${message.id}`,
                type: "message",
                title: "New message received",
                description: "You have a new message in your inbox",
                timestamp: message.createdAt.toISOString(),
            });
        });

        // Sort all activities by timestamp and take the most recent 10
        activities.sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
        );
        const recentActivities = activities.slice(0, 10);

        return NextResponse.json({
            activities: recentActivities,
        });
    } catch (error) {
        console.error("Dashboard activities error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export const GET = requireAuth(handler);
