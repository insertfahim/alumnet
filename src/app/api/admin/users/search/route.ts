import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        // TODO: Add admin authentication check here
        // For now, we'll assume this is protected by middleware

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        // Search users by name or email
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        firstName: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        lastName: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
            take: 10, // Limit results
            orderBy: {
                firstName: "asc",
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("User search error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
