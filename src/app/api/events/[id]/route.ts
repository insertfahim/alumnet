import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

interface UpdateEventData {
    title?: string;
    description?: string;
    location?: string;
    virtual?: boolean;
    type?: string;
    startDate?: string;
    endDate?: string;
    maxAttendees?: number;
    price?: number;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const eventId = params.id;

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizer: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        graduationYear: true,
                        degree: true,
                        major: true,
                        role: true,
                        isVerified: true,
                    },
                },
                attendees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                graduationYear: true,
                                degree: true,
                                major: true,
                            },
                        },
                    },
                    orderBy: {
                        registeredAt: "asc",
                    },
                },
            },
        });

        if (!event) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ event });
    } catch (error) {
        console.error("Error fetching event:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
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

        // Check if event exists and user is the organizer
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { organizerId: true, startDate: true },
        });

        if (!event) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 }
            );
        }

        if (event.organizerId !== userId) {
            return NextResponse.json(
                { message: "Only the organizer can update this event" },
                { status: 403 }
            );
        }

        // Parse request body
        const updateData: UpdateEventData = await request.json();

        // Validate dates if provided
        if (updateData.startDate || updateData.endDate) {
            const currentStart = updateData.startDate
                ? new Date(updateData.startDate)
                : event.startDate;
            const currentEnd = updateData.endDate
                ? new Date(updateData.endDate)
                : event.startDate; // This should be the current end date, but we don't have it

            // Get the current end date
            const fullEvent = await prisma.event.findUnique({
                where: { id: eventId },
                select: { endDate: true },
            });

            const endDate = updateData.endDate
                ? new Date(updateData.endDate)
                : fullEvent!.endDate;

            if (isNaN(currentStart.getTime()) || isNaN(endDate.getTime())) {
                return NextResponse.json(
                    { message: "Invalid date format" },
                    { status: 400 }
                );
            }

            if (endDate <= currentStart) {
                return NextResponse.json(
                    { message: "End date must be after start date" },
                    { status: 400 }
                );
            }
        }

        // Validate maxAttendees
        if (updateData.maxAttendees && updateData.maxAttendees <= 0) {
            return NextResponse.json(
                { message: "Max attendees must be greater than 0" },
                { status: 400 }
            );
        }

        // Validate price
        if (updateData.price && updateData.price < 0) {
            return NextResponse.json(
                { message: "Price cannot be negative" },
                { status: 400 }
            );
        }

        // Prepare update data
        const data: any = {};
        if (updateData.title) data.title = updateData.title.trim();
        if (updateData.description)
            data.description = updateData.description.trim();
        if (updateData.location) data.location = updateData.location.trim();
        if (updateData.virtual !== undefined) data.virtual = updateData.virtual;
        if (updateData.type !== undefined) data.type = updateData.type;
        if (updateData.startDate)
            data.startDate = new Date(updateData.startDate);
        if (updateData.endDate) data.endDate = new Date(updateData.endDate);
        if (updateData.maxAttendees !== undefined)
            data.maxAttendees = updateData.maxAttendees;
        if (updateData.price !== undefined) data.price = updateData.price;

        // Update event
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data,
            include: {
                organizer: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        graduationYear: true,
                        degree: true,
                        major: true,
                        role: true,
                        isVerified: true,
                    },
                },
                attendees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                graduationYear: true,
                                degree: true,
                                major: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            message: "Event updated successfully",
            event: updatedEvent,
        });
    } catch (error) {
        console.error("Error updating event:", error);
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

        // Check if event exists and user is the organizer
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { organizerId: true },
        });

        if (!event) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 }
            );
        }

        if (event.organizerId !== userId) {
            return NextResponse.json(
                { message: "Only the organizer can delete this event" },
                { status: 403 }
            );
        }

        // Delete event (cascade will handle attendees)
        await prisma.event.delete({
            where: { id: eventId },
        });

        return NextResponse.json({
            message: "Event deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
