import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const graduationYear = searchParams.get("graduationYear");
        const major = searchParams.get("major");
        const location = searchParams.get("location");
        const company = searchParams.get("company");

        let where: any = {
            role: "ALUMNI",
        };

        // Add search filter
        if (search) {
            where.OR = [
                {
                    firstName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    lastName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    major: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    currentCompany: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    currentPosition: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        // Add individual filters
        if (graduationYear) {
            where.graduationYear = parseInt(graduationYear);
        }

        if (major) {
            where.major = {
                contains: major,
                mode: "insensitive",
            };
        }

        if (location) {
            where.location = {
                contains: location,
                mode: "insensitive",
            };
        }

        if (company) {
            where.currentCompany = {
                contains: company,
                mode: "insensitive",
            };
        }

        const alumni = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                graduationYear: true,
                degree: true,
                major: true,
                currentCompany: true,
                currentPosition: true,
                location: true,
                bio: true,
                isVerified: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(alumni);
    } catch (error) {
        console.error("Error fetching alumni:", error);
        return NextResponse.json(
            { error: "Failed to fetch alumni" },
            { status: 500 }
        );
    }
}
