import { NextRequest, NextResponse } from "next/server";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

// Enable caching for this route
export const revalidate = 60; // Cache for 60 seconds

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

        // Get all dashboard data in parallel
        const [
            totalConnections,
            upcomingEvents,
            jobApplications,
            unreadMessages,
            recentConnections,
            recentEvents,
            recentJobs,
        ] = await Promise.all([
            // Stats queries
            prisma.connection.count({
                where: {
                    OR: [{ fromUserId: userId }, { toUserId: userId }],
                    status: "ACCEPTED",
                },
            }),
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
            prisma.jobApplication.count({
                where: { applicantId: userId },
            }),
            // Simplified unread messages count
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
            // Activity queries
            prisma.connection.findMany({
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
            }),
            prisma.eventAttendance.findMany({
                where: {
                    userId,
                    event: {
                        startDate: {
                            gte: new Date(),
                        },
                    },
                },
                include: {
                    event: {
                        select: {
                            id: true,
                            title: true,
                            startDate: true,
                            location: true,
                        },
                    },
                },
                orderBy: {
                    registeredAt: "desc",
                },
                take: 3,
            }),
            prisma.jobApplication.findMany({
                where: { applicantId: userId },
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            company: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 3,
            }),
        ]);

        // Process activities
        const activities: Activity[] = [];

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

        // Add event activities
        recentEvents.forEach((attendance) => {
            activities.push({
                id: `event-${attendance.id}`,
                type: "event",
                title: `Attending ${attendance.event.title}`,
                description: `Event at ${attendance.event.location}`,
                timestamp: attendance.registeredAt.toISOString(),
            });
        });

        // Add job activities
        recentJobs.forEach((application) => {
            activities.push({
                id: `job-${application.id}`,
                type: "job",
                title: `Applied to ${application.job.title}`,
                description: `Application at ${application.job.company}`,
                timestamp: application.createdAt.toISOString(),
            });
        });

        // Sort activities by timestamp
        activities.sort(
            (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
        );

        const responseData = {
            stats: {
                totalConnections,
                upcomingEvents,
                jobApplications,
                unreadMessages,
            },
            activities: activities.slice(0, 10), // Limit to 10 most recent
        };

        return NextResponse.json(responseData, {
            headers: {
                "Cache-Control":
                    "public, s-maxage=60, stale-while-revalidate=300",
            },
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}

export const GET = requireAuth(handler);
