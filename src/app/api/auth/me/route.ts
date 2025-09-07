import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                graduationYear: true,
                degree: true,
                major: true,
                profilePicture: true,
                bio: true,
                currentCompany: true,
                currentPosition: true,
                location: true,
                linkedinUrl: true,
                githubUrl: true,
                website: true,
                role: true,
                isVerified: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
