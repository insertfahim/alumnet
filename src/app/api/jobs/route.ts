import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const type = searchParams.get("type");
        const location = searchParams.get("location");
        const remote = searchParams.get("remote");
        const company = searchParams.get("company");

        // Build the where clause
        const where: any = {
            expiresAt: {
                gte: new Date(), // Only active jobs
            },
        };

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
                    company: {
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
            ];
        }

        // Filter by type
        if (type) {
            where.type = type;
        }

        // Filter by location
        if (location) {
            where.location = {
                contains: location,
                mode: "insensitive",
            };
        }

        // Filter by remote option
        if (remote === "true") {
            where.remote = true;
        } else if (remote === "false") {
            where.remote = false;
        }

        // Filter by company
        if (company) {
            where.company = {
                contains: company,
                mode: "insensitive",
            };
        }

        const jobs = await prisma.job.findMany({
            where,
            include: {
                postedBy: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        graduationYear: true,
                        degree: true,
                        major: true,
                        role: true,
                        isVerified: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
                applications: {
                    select: {
                        id: true,
                        applicantId: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ jobs });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get the user from the JWT token
        const token = request.headers
            .get("authorization")
            ?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
        };

        // Get user to check if they're verified
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { isVerified: true, role: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (!user.isVerified) {
            return NextResponse.json(
                { error: "Only verified users can post jobs" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            title,
            company,
            location,
            type,
            remote,
            description,
            requirements,
            salary,
            durationDays = 30,
        } = body;

        // Validate required fields
        if (!title || !company || !location || !type || !description) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        // Create the job
        const job = await prisma.job.create({
            data: {
                title,
                company,
                location,
                type,
                remote: remote || false,
                description,
                requirements: requirements || [],
                salary,
                postedById: decoded.userId,
                expiresAt,
            },
            include: {
                postedBy: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        graduationYear: true,
                        degree: true,
                        major: true,
                        role: true,
                        isVerified: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
                applications: true,
            },
        });

        return NextResponse.json({
            message: "Job posted successfully",
            job,
        });
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
