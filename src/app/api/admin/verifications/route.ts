import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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

        // Check if user is admin
        const admin = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true },
        });

        if (admin?.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        // Build where clause conditionally
        let whereClause: any = {};
        if (statusFilter && statusFilter !== "all") {
            whereClause.status = statusFilter;
        }

        const [verifications, total] = await Promise.all([
            prisma.verification.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            graduationYear: true,
                            degree: true,
                            major: true,
                            isVerified: true,
                        },
                    },
                    verifiedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.verification.count({ where: whereClause }),
        ]);

        return NextResponse.json({
            verifications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get verifications error:", error);
        return NextResponse.json(
            { error: "Failed to get verifications" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
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

        // Check if user is admin
        const admin = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true },
        });

        if (admin?.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const { verificationId, status, rejectionReason } = await req.json();

        if (!verificationId || !status) {
            return NextResponse.json(
                { error: "Verification ID and status are required" },
                { status: 400 }
            );
        }

        const verification = await prisma.verification.findUnique({
            where: { id: verificationId },
            include: { user: true },
        });

        if (!verification) {
            return NextResponse.json(
                { error: "Verification not found" },
                { status: 404 }
            );
        }

        // Update verification record
        const updateData: any = {
            verifiedById: decoded.userId,
            updatedAt: new Date(),
        };

        if (status === "APPROVED") {
            updateData.status = "APPROVED";
            updateData.verifiedAt = new Date();
            updateData.rejectionReason = null;
        } else if (status === "REJECTED") {
            updateData.status = "REJECTED";
            updateData.verifiedAt = null;
            updateData.rejectionReason = rejectionReason;
        } else {
            updateData.status = "PENDING";
            updateData.verifiedAt = null;
            updateData.rejectionReason = null;
        }

        const updatedVerification = await prisma.verification.update({
            where: { id: verificationId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        isVerified: true,
                    },
                },
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

        // If approved, update user's isVerified flag
        if (status === "APPROVED") {
            await prisma.user.update({
                where: { id: verification.userId },
                data: { isVerified: true },
            });
        } else if (status === "REJECTED") {
            await prisma.user.update({
                where: { id: verification.userId },
                data: { isVerified: false },
            });
        }

        return NextResponse.json({
            message: `Verification ${status.toLowerCase()} successfully`,
            verification: updatedVerification,
        });
    } catch (error) {
        console.error("Update verification error:", error);
        return NextResponse.json(
            { error: "Failed to update verification" },
            { status: 500 }
        );
    }
}
