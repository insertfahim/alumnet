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
        const { skills, expertise, bio, experience, availability, hourlyRate } =
            body;

        // Validate required fields
        if (
            !skills ||
            !expertise ||
            skills.length === 0 ||
            expertise.length === 0
        ) {
            return NextResponse.json(
                { error: "Skills and expertise are required" },
                { status: 400 }
            );
        }

        // Check if user already has a mentor profile
        const existingProfile = await prisma.mentorProfile.findUnique({
            where: { userId: decoded.userId },
        });

        if (existingProfile) {
            // Update existing profile
            const updatedProfile = await prisma.mentorProfile.update({
                where: { userId: decoded.userId },
                data: {
                    skills,
                    expertise,
                    bio,
                    experience,
                    availability,
                    hourlyRate,
                    isActive: true,
                    updatedAt: new Date(),
                },
            });
            return NextResponse.json(updatedProfile);
        } else {
            // Create new profile
            const newProfile = await prisma.mentorProfile.create({
                data: {
                    userId: decoded.userId,
                    skills,
                    expertise,
                    bio,
                    experience,
                    availability,
                    hourlyRate,
                },
            });
            return NextResponse.json(newProfile);
        }
    } catch (error) {
        console.error("Error creating/updating mentor profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

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

        const profile = await prisma.mentorProfile.findUnique({
            where: { userId: decoded.userId },
        });

        if (!profile) {
            return NextResponse.json({ profile: null });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Error fetching mentor profile:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
