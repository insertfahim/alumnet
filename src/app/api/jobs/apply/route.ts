import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobId, coverLetter, resumeUrl } = body;

        // Get the user from the JWT token
        const token = request.headers
            .get("authorization")
            ?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
        };

        // Check if the job exists
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            );
        }

        // Check if the job has expired
        if (job.expiresAt < new Date()) {
            return NextResponse.json(
                { error: "This job posting has expired" },
                { status: 400 }
            );
        }

        // Check if user has already applied to this job
        const existingApplication = await prisma.jobApplication.findUnique({
            where: {
                jobId_applicantId: {
                    jobId,
                    applicantId: decoded.userId,
                },
            },
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: "You have already applied to this job" },
                { status: 400 }
            );
        }

        // Check if user is trying to apply to their own job posting
        if (job.postedById === decoded.userId) {
            return NextResponse.json(
                { error: "You cannot apply to your own job posting" },
                { status: 400 }
            );
        }

        // Create the job application
        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                applicantId: decoded.userId,
                coverLetter,
                resumeUrl,
                status: "PENDING",
            },
            include: {
                job: {
                    select: {
                        title: true,
                        company: true,
                    },
                },
                applicant: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: "Application submitted successfully",
            application: {
                id: application.id,
                status: application.status,
                jobTitle: application.job.title,
                company: application.job.company,
                appliedAt: application.createdAt,
            },
        });
    } catch (error) {
        console.error("Error applying to job:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch user's job applications
export async function GET(request: NextRequest) {
    try {
        // Get the user from the JWT token
        const token = request.headers
            .get("authorization")
            ?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
        };

        const applications = await prisma.jobApplication.findMany({
            where: {
                applicantId: decoded.userId,
            },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        location: true,
                        type: true,
                        remote: true,
                        expiresAt: true,
                        postedBy: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ applications });
    } catch (error) {
        console.error("Error fetching job applications:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
