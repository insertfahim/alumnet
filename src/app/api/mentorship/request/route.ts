import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { mentorId, message } = body;

        if (!mentorId || !message) {
            return NextResponse.json(
                { error: "Mentor ID and message are required" },
                { status: 400 }
            );
        }

        // Check if mentor exists and is active
        const mentorProfile = await prisma.mentorProfile.findFirst({
            where: {
                id: mentorId,
                isActive: true,
            },
        });

        if (!mentorProfile) {
            return NextResponse.json(
                { error: "Mentor not found or inactive" },
                { status: 404 }
            );
        }

        // Check if mentorship request already exists
        const existingRequest = await prisma.mentorshipPair.findFirst({
            where: {
                mentorId,
                menteeId: decoded.userId,
            },
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: "Mentorship request already exists" },
                { status: 400 }
            );
        }

        // Create mentorship request
        const mentorshipRequest = await prisma.mentorshipPair.create({
            data: {
                mentorId,
                menteeId: decoded.userId,
                message,
                status: "PENDING",
            },
            include: {
                mentorProfile: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                mentee: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return NextResponse.json(mentorshipRequest);
    } catch (error) {
        console.error("Error creating mentorship request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
