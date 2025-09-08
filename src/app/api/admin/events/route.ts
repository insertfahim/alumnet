import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all";

        const skip = (page - 1) * limit;

        const where: any = {};

        // Search filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
            ];
        }

        // Status filter
        if (status === "upcoming") {
            where.startDate = { gte: new Date() };
        } else if (status === "past") {
            where.endDate = { lt: new Date() };
        } else if (status === "ongoing") {
            where.AND = [
                { startDate: { lte: new Date() } },
                { endDate: { gte: new Date() } },
            ];
        }

        const events = await prisma.event.findMany({
            where,
            select: {
                id: true,
                title: true,
                description: true,
                location: true,
                virtual: true,
                startDate: true,
                endDate: true,
                maxAttendees: true,
                price: true,
                createdAt: true,
                organizer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        attendees: true,
                    },
                },
            },
            orderBy: { startDate: "desc" },
            skip,
            take: limit,
        });

        const total = await prisma.event.count({ where });

        return NextResponse.json({
            events: events.map((event) => ({
                ...event,
                organizerName: `${event.organizer.firstName} ${event.organizer.lastName}`,
                attendeesCount: event._count.attendees,
                status:
                    new Date() < event.startDate
                        ? "upcoming"
                        : new Date() > event.endDate
                        ? "past"
                        : "ongoing",
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: "Event ID is required" },
                { status: 400 }
            );
        }

        // Delete attendances first
        await prisma.eventAttendance.deleteMany({
            where: { eventId: id },
        });

        // Then delete the event
        const event = await prisma.event.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, event });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json(
            { error: "Failed to delete event" },
            { status: 500 }
        );
    }
}
