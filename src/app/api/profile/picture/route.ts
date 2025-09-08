import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImageToImageKit, deleteImageFromImageKit } from "@/lib/imagekit";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
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

        // Get the uploaded file
        const formData = await request.formData();
        const file = formData.get("profilePicture") as File;

        if (!file) {
            return NextResponse.json(
                { message: "No file provided" },
                { status: 400 }
            );
        }

        console.log("Received file:", {
            name: file.name,
            type: file.type,
            size: file.size,
        });

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { message: "File must be an image" },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { message: "File size must be less than 5MB" },
                { status: 400 }
            );
        }

        // Get current user to check for existing profile picture
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                profilePicture: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!currentUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate filename
        const fileName = `profile_${userId}_${Date.now()}.${file.name
            .split(".")
            .pop()}`;

        // Upload to ImageKit
        console.log("Uploading to ImageKit...");
        const uploadResult = await uploadImageToImageKit(
            buffer,
            fileName,
            "profile-pictures"
        );
        console.log("ImageKit upload successful:", uploadResult.url);

        // If user has an existing profile picture, delete it
        if (currentUser.profilePicture) {
            try {
                // Extract fileId from existing URL if it's from ImageKit
                const urlParts = currentUser.profilePicture.split("/");
                const fileIdPart = urlParts[urlParts.length - 1];
                // This is a simplified extraction - in production you might want to store fileId separately
                // For now, we'll skip deletion to avoid errors
                console.log(
                    "User has existing profile picture, keeping for now"
                );
            } catch (error) {
                console.log(
                    "Could not delete previous profile picture:",
                    error
                );
            }
        }

        // Update user's profile picture in database
        console.log("Updating user profile picture in database...");
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                profilePicture: uploadResult.url,
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
        console.log("Database update successful");

        return NextResponse.json({
            message: "Profile picture updated successfully",
            user: updatedUser,
            profilePictureUrl: uploadResult.url,
        });
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
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

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { profilePicture: true },
        });

        if (!currentUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        if (!currentUser.profilePicture) {
            return NextResponse.json(
                { message: "No profile picture to remove" },
                { status: 400 }
            );
        }

        // Update user's profile picture in database (set to null)
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                profilePicture: null,
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
            message: "Profile picture removed successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error removing profile picture:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
