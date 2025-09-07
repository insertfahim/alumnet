import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

interface ProfileUpdateData {
    bio?: string;
    currentCompany?: string;
    currentPosition?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    website?: string;
    profilePicture?: string;
}

export async function PUT(request: NextRequest) {
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

        // Parse request body
        const profileData: ProfileUpdateData = await request.json();

        // Validate URL fields if provided
        const urlFields = ["linkedinUrl", "githubUrl", "website"];
        for (const field of urlFields) {
            const value = profileData[field as keyof ProfileUpdateData];
            if (value && value.trim() !== "") {
                try {
                    new URL(value);
                } catch (error) {
                    return NextResponse.json(
                        { message: `Invalid URL format for ${field}` },
                        { status: 400 }
                    );
                }
            }
        }

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                bio: profileData.bio?.trim() || null,
                currentCompany: profileData.currentCompany?.trim() || null,
                currentPosition: profileData.currentPosition?.trim() || null,
                location: profileData.location?.trim() || null,
                linkedinUrl: profileData.linkedinUrl?.trim() || null,
                githubUrl: profileData.githubUrl?.trim() || null,
                website: profileData.website?.trim() || null,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                bio: true,
                graduationYear: true,
                degree: true,
                major: true,
                currentCompany: true,
                currentPosition: true,
                location: true,
                linkedinUrl: true,
                githubUrl: true,
                website: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { message: "Internal server error" },
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

        // Get user profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                bio: true,
                graduationYear: true,
                degree: true,
                major: true,
                currentCompany: true,
                currentPosition: true,
                location: true,
                linkedinUrl: true,
                githubUrl: true,
                website: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
