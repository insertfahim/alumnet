import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers
            .get("authorization")
            ?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { message: "No token provided" },
                { status: 401 }
            );
        }

        // Verify token
        let userId: string;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: string;
            };
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 401 }
            );
        }

        const eventId = params.id;

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { id: true },
        });

        if (!event) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 }
            );
        }

        // Get user's attendance status
        const attendance = await prisma.eventAttendance.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
        });

        return NextResponse.json({
            attendance: attendance || null,
        });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers
            .get("authorization")
            ?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { message: "No token provided" },
                { status: 401 }
            );
        }

        // Verify token
        let userId: string;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: string;
            };
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 401 }
            );
        }

        const eventId = params.id;

        // Check if event exists and get event details
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                id: true,
                startDate: true,
                maxAttendees: true,
                endDate: true,
            },
        });

        if (!event) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 }
            );
        }

        // Check if event has already ended
        if (event.endDate < new Date()) {
            return NextResponse.json(
                { message: "Cannot RSVP to a past event" },
                { status: 400 }
            );
        }

        // Parse request body
        const { status } = await request.json();

        if (!status || !["GOING", "MAYBE", "NOT_GOING"].includes(status)) {
            return NextResponse.json(
                {
                    message:
                        "Invalid status. Must be GOING, MAYBE, or NOT_GOING",
                },
                { status: 400 }
            );
        }

        // Check current attendance count if maxAttendees is set
        if (event.maxAttendees && status === "GOING") {
            const currentAttendees = await prisma.eventAttendance.count({
                where: {
                    eventId,
                    status: "GOING",
                },
            });

            if (currentAttendees >= event.maxAttendees) {
                return NextResponse.json(
                    { message: "Event is at maximum capacity" },
                    { status: 400 }
                );
            }
        }

        // Check if user already has an attendance record
        const existingAttendance = await prisma.eventAttendance.findUnique({
            where: {
                eventId_userId: {
                    eventId,
                    userId,
                },
            },
        });

        let attendance;

        if (existingAttendance) {
            // Update existing attendance
            attendance = await prisma.eventAttendance.update({
                where: {
                    eventId_userId: {
                        eventId,
                        userId,
                    },
                },
                data: {
                    status,
                },
            });
        } else {
            // Create new attendance
            attendance = await prisma.eventAttendance.create({
                data: {
                    eventId,
                    userId,
                    status,
                },
            });
        }

        return NextResponse.json({
            message: "RSVP updated successfully",
            attendance,
        });
    } catch (error) {
        console.error("Error updating attendance:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers
            .get("authorization")
            ?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { message: "No token provided" },
                { status: 401 }
            );
        }

        // Verify token
        let userId: string;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
                userId: string;
            };
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 401 }
            );
        }

        const eventId = params.id;

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { id: true },
        });

        if (!event) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 }
            );
        }

        // Delete attendance record
        await prisma.eventAttendance.deleteMany({
            where: {
                eventId,
                userId,
            },
        });

        return NextResponse.json({
            message: "RSVP cancelled successfully",
        });
    } catch (error) {
        console.error("Error cancelling attendance:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
