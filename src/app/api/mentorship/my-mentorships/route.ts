import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

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

        // Fetch mentorships where user is either mentor or mentee
        const mentorships = await prisma.mentorshipPair.findMany({
            where: {
                OR: [
                    { mentorId: decoded.userId },
                    { menteeId: decoded.userId },
                ],
            },
            include: {
                mentorProfile: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                currentCompany: true,
                                currentPosition: true,
                            },
                        },
                    },
                },
                mentor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        currentCompany: true,
                        currentPosition: true,
                    },
                },
                mentee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
                sessions: {
                    orderBy: {
                        scheduledAt: "desc",
                    },
                    take: 5,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(mentorships);
    } catch (error) {
        console.error("Error fetching mentorships:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
