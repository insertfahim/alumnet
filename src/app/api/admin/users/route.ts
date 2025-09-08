import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest) {
    if (req.method === "GET") {
        return await handleGetUsers(req);
    } else if (req.method === "PATCH") {
        return await handleUpdateUser(req);
    } else if (req.method === "DELETE") {
        return await handleDeleteUser(req);
    }

    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handleGetUsers(req: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "all";
        const status = searchParams.get("status") || "all";
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { major: { contains: search, mode: "insensitive" } },
                { currentCompany: { contains: search, mode: "insensitive" } },
            ];
        }

        if (role !== "all") {
            where.role = role;
        }

        if (status === "verified") {
            where.isVerified = true;
        } else if (status === "unverified") {
            where.isVerified = false;
        }

        // Build orderBy
        const orderBy: any = {};
        orderBy[sortBy] = sortOrder;

        const [users, totalUsers] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    graduationYear: true,
                    degree: true,
                    major: true,
                    currentCompany: true,
                    currentPosition: true,
                    location: true,
                    role: true,
                    isVerified: true,
                    emailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            posts: true,
                            jobs: true,
                            organizedEvents: true,
                            donations: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        const totalPages = Math.ceil(totalUsers / limit);

        return NextResponse.json({
            users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Admin users fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

async function handleUpdateUser(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const {
            userId,
            role,
            isVerified,
            emailVerified,
            firstName,
            lastName,
            email,
        } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const updateData: any = {};

        if (role !== undefined) updateData.role = role;
        if (isVerified !== undefined) updateData.isVerified = isVerified;
        if (emailVerified !== undefined)
            updateData.emailVerified = emailVerified ? new Date() : null;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (email !== undefined) updateData.email = email;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                emailVerified: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Admin user update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

async function handleDeleteUser(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Prevent deleting other admin users
        const userToDelete = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (userToDelete?.role === "ADMIN") {
            return NextResponse.json(
                { error: "Cannot delete admin users" },
                { status: 403 }
            );
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Admin user delete error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export const GET = requireAdmin(handler);
export const PATCH = requireAdmin(handler);
export const DELETE = requireAdmin(handler);
