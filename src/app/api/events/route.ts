import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

interface CreateEventData {
    title: string;
    description: string;
    location: string;
    virtual: boolean;
    type?: string;
    startDate: string;
    endDate: string;
    maxAttendees?: number;
    price?: number;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const type = searchParams.get("type"); // event type filter
        const date = searchParams.get("date"); // specific date filter
        const startDate = searchParams.get("startDate"); // date range start
        const endDate = searchParams.get("endDate"); // date range end
        const location = searchParams.get("location");
        const organizer = searchParams.get("organizer");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const upcoming = searchParams.get("upcoming"); // "true" to show only upcoming events
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        // Build the where clause
        const where: any = {};

        // Text search
        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    location: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        // Filter by type
        if (type && type !== "") {
            if (type === "virtual" || type === "in-person") {
                where.virtual = type === "virtual";
            } else {
                // Handle other event types if needed
                where.type = type;
            }
        }

        // Filter by date
        if (date && date !== "") {
            const now = new Date();
            let filterDate: Date;
            let endFilterDate: Date;

            switch (date) {
                case "today":
                    filterDate = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                    );
                    endFilterDate = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate() + 1
                    );
                    break;
                case "tomorrow":
                    filterDate = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate() + 1
                    );
                    endFilterDate = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate() + 2
                    );
                    break;
                case "this_week":
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    filterDate = startOfWeek;
                    endFilterDate = new Date(startOfWeek);
                    endFilterDate.setDate(startOfWeek.getDate() + 7);
                    break;
                case "this_month":
                    filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endFilterDate = new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        1
                    );
                    break;
                case "next_month":
                    filterDate = new Date(
                        now.getFullYear(),
                        now.getMonth() + 1,
                        1
                    );
                    endFilterDate = new Date(
                        now.getFullYear(),
                        now.getMonth() + 2,
                        1
                    );
                    break;
                default:
                    // Handle specific date
                    filterDate = new Date(date);
                    endFilterDate = new Date(filterDate);
                    endFilterDate.setDate(endFilterDate.getDate() + 1);
            }

            where.startDate = {
                gte: filterDate,
                lt: endFilterDate,
            };
        }

        // Filter by date range
        if (startDate || endDate) {
            const dateFilter: any = {};
            if (startDate) {
                dateFilter.gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.lte = new Date(endDate);
            }
            where.startDate = dateFilter;
        }

        // Filter by location
        if (location) {
            where.location = {
                contains: location,
                mode: "insensitive",
            };
        }

        // Filter by organizer
        if (organizer) {
            where.organizer = {
                OR: [
                    {
                        firstName: {
                            contains: organizer,
                            mode: "insensitive",
                        },
                    },
                    {
                        lastName: {
                            contains: organizer,
                            mode: "insensitive",
                        },
                    },
                ],
            };
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            const priceFilter: any = {};
            if (minPrice) {
                priceFilter.gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                priceFilter.lte = parseFloat(maxPrice);
            }
            where.price = priceFilter;
        }

        // Filter for upcoming events only
        if (upcoming === "true") {
            where.startDate = {
                gte: new Date(),
            };
        }

        const skip = (page - 1) * limit;

        const [events, totalCount] = await Promise.all([
            prisma.event.findMany({
                where,
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
                orderBy: {
                    startDate: "asc",
                },
                skip,
                take: limit,
            }),
            prisma.event.count({ where }),
        ]);

        return NextResponse.json({
            events,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        // Get user to check if verified
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isVerified: true, role: true },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Only verified users can create events
        if (!user.isVerified && user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Only verified users can create events" },
                { status: 403 }
            );
        }

        // Parse request body
        const eventData: CreateEventData = await request.json();

        // Validate required fields
        const { title, description, location, virtual, startDate, endDate } =
            eventData;

        if (!title || !description || !location || !startDate || !endDate) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { message: "Invalid date format" },
                { status: 400 }
            );
        }

        if (end <= start) {
            return NextResponse.json(
                { message: "End date must be after start date" },
                { status: 400 }
            );
        }

        if (start <= new Date()) {
            return NextResponse.json(
                { message: "Start date must be in the future" },
                { status: 400 }
            );
        }

        // Validate maxAttendees
        if (eventData.maxAttendees && eventData.maxAttendees <= 0) {
            return NextResponse.json(
                { message: "Max attendees must be greater than 0" },
                { status: 400 }
            );
        }

        // Validate price
        if (eventData.price && eventData.price < 0) {
            return NextResponse.json(
                { message: "Price cannot be negative" },
                { status: 400 }
            );
        }

        // Create event
        const event = await prisma.event.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                location: location.trim(),
                virtual,
                ...(eventData.type && { type: eventData.type }),
                startDate: start,
                endDate: end,
                maxAttendees: eventData.maxAttendees || null,
                price: eventData.price || null,
                organizerId: userId,
            },
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

        return NextResponse.json(
            {
                message: "Event created successfully",
                event,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
