import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const type = searchParams.get("type") || "all";
        const status = searchParams.get("status") || "all";

        const skip = (page - 1) * limit;

        const where: any = {};

        // Search filter
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { company: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        // Type filter
        if (type !== "all") {
            where.type = type.toUpperCase();
        }

        // Status filter
        if (status === "active") {
            where.expiresAt = { gte: new Date() };
        } else if (status === "expired") {
            where.expiresAt = { lt: new Date() };
        }

        const jobs = await prisma.job.findMany({
            where,
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                type: true,
                remote: true,
                description: true,
                requirements: true,
                salary: true,
                expiresAt: true,
                createdAt: true,
                postedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });

        const total = await prisma.job.count({ where });

        return NextResponse.json({
            jobs: jobs.map((job) => ({
                ...job,
                postedByName: `${job.postedBy.firstName} ${job.postedBy.lastName}`,
                applicationsCount: job._count.applications,
                isExpired: new Date() > job.expiresAt,
                status: new Date() > job.expiresAt ? "expired" : "active",
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: "Job ID is required" },
                { status: 400 }
            );
        }

        // Delete applications first
        await prisma.jobApplication.deleteMany({
            where: { jobId: id },
        });

        // Then delete the job
        const job = await prisma.job.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, job });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json(
            { error: "Failed to delete job" },
            { status: 500 }
        );
    }
}
