import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthenticatedRequest } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";

async function handler(req: AuthenticatedRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "all";
        const status = searchParams.get("status") || "all";

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

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
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
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Convert to CSV
        const csvHeaders = [
            "ID",
            "Email",
            "First Name",
            "Last Name",
            "Graduation Year",
            "Degree",
            "Major",
            "Current Company",
            "Current Position",
            "Location",
            "LinkedIn",
            "GitHub",
            "Website",
            "Role",
            "Profile Verified",
            "Email Verified",
            "Created At",
            "Updated At",
        ];

        const csvRows = users.map((user) => [
            user.id,
            user.email,
            user.firstName,
            user.lastName,
            user.graduationYear,
            user.degree,
            user.major,
            user.currentCompany || "",
            user.currentPosition || "",
            user.location || "",
            user.linkedinUrl || "",
            user.githubUrl || "",
            user.website || "",
            user.role,
            user.isVerified ? "Yes" : "No",
            user.emailVerified ? "Yes" : "No",
            user.createdAt.toISOString(),
            user.updatedAt.toISOString(),
        ]);

        const csvContent = [
            csvHeaders.join(","),
            ...csvRows.map((row) =>
                row
                    .map((field) =>
                        typeof field === "string" && field.includes(",")
                            ? `"${field.replace(/"/g, '""')}"`
                            : field
                    )
                    .join(",")
            ),
        ].join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="users-export-${
                    new Date().toISOString().split("T")[0]
                }.csv"`,
            },
        });
    } catch (error) {
        console.error("Export users error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export const GET = requireAdmin(handler);
