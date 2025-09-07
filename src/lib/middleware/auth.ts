import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: string;
        email: string;
        role: Role;
    };
}

export async function withAuth(
    handler: (
        req: AuthenticatedRequest,
        context?: any
    ) => Promise<NextResponse>,
    requiredRole?: Role
) {
    return async (req: NextRequest, context?: any): Promise<NextResponse> => {
        try {
            const token = req.headers
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
                    role: true,
                },
            });

            if (!user) {
                return NextResponse.json(
                    { error: "User not found" },
                    { status: 401 }
                );
            }

            // Check role requirement
            if (requiredRole && user.role !== requiredRole) {
                return NextResponse.json(
                    { error: "Insufficient permissions" },
                    { status: 403 }
                );
            }

            // Add user to request
            const authenticatedReq = req as AuthenticatedRequest;
            authenticatedReq.user = user;

            return handler(authenticatedReq, context);
        } catch (error) {
            console.error("Auth middleware error:", error);
            return NextResponse.json(
                { error: "Internal server error" },
                { status: 500 }
            );
        }
    };
}

export function requireAdmin(
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
    return withAuth(handler, Role.ADMIN);
}

export function requireAuth(
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
    return withAuth(handler);
}
