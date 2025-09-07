import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const token = request.headers
            .get("authorization")
            ?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { error: "No token provided" },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const skills = searchParams.get("skills")?.split(",").filter(Boolean);
        const expertise = searchParams
            .get("expertise")
            ?.split(",")
            .filter(Boolean);

        // Build where clause
        const where: any = {
            isActive: true,
            user: {
                id: {
                    not: decoded.userId, // Don't show current user as mentor
                },
            },
        };

        // Add search filter
        if (search) {
            where.user = {
                ...where.user,
                OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
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
                    { major: { contains: search, mode: "insensitive" } },
                ],
            };
        }

        // Add skills filter
        if (skills && skills.length > 0) {
            where.skills = {
                hasSome: skills,
            };
        }

        // Add expertise filter
        if (expertise && expertise.length > 0) {
            where.expertise = {
                hasSome: expertise,
            };
        }

        const mentors = await prisma.mentorProfile.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        currentCompany: true,
                        currentPosition: true,
                        graduationYear: true,
                        major: true,
                    },
                },
            },
            orderBy: {
                user: {
                    firstName: "asc",
                },
            },
        });

        return NextResponse.json(mentors);
    } catch (error) {
        console.error("Error fetching mentors:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
