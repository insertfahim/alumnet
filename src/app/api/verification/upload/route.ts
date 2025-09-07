import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImageToImageKit } from "@/lib/imagekit";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.replace("Bearer ", "");

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

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const documentType = formData.get("documentType") as string;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
                },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate filename
        const fileExtension = file.name.split(".").pop();
        const fileName = `graduation-proof-${
            decoded.userId
        }-${Date.now()}.${fileExtension}`;

        // Upload to ImageKit
        const uploadResult = await uploadImageToImageKit(
            buffer,
            fileName,
            "verification"
        );

        // Check if user already has a verification record
        const existingVerification = await prisma.verification.findUnique({
            where: { userId: decoded.userId },
        });

        if (existingVerification) {
            // Update existing verification
            const verification = await prisma.verification.update({
                where: { userId: decoded.userId },
                data: {
                    graduationProofUrl: uploadResult.url,
                    documentType: documentType || "graduation_certificate",
                    status: "PENDING",
                    rejectionReason: null,
                    updatedAt: new Date(),
                },
            });

            return NextResponse.json({
                message: "Verification proof updated successfully",
                verification: {
                    id: verification.id,
                    status: verification.status,
                    graduationProofUrl: verification.graduationProofUrl,
                    documentType: verification.documentType,
                },
            });
        } else {
            // Create new verification
            const verification = await prisma.verification.create({
                data: {
                    userId: decoded.userId,
                    graduationProofUrl: uploadResult.url,
                    documentType: documentType || "graduation_certificate",
                    status: "PENDING",
                },
            });

            return NextResponse.json({
                message: "Verification proof uploaded successfully",
                verification: {
                    id: verification.id,
                    status: verification.status,
                    graduationProofUrl: verification.graduationProofUrl,
                    documentType: verification.documentType,
                },
            });
        }
    } catch (error) {
        console.error("Verification upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload verification proof" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("authorization")?.replace("Bearer ", "");

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

        const verification = await prisma.verification.findUnique({
            where: { userId: decoded.userId },
            include: {
                verifiedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({ verification });
    } catch (error) {
        console.error("Get verification error:", error);
        return NextResponse.json(
            { error: "Failed to get verification status" },
            { status: 500 }
        );
    }
}
