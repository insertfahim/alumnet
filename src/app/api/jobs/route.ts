import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
