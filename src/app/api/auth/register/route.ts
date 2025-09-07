import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    graduationYear: z
        .number()
        .int()
        .min(1950)
        .max(new Date().getFullYear() + 10),
    degree: z.string().min(1),
    major: z.string().min(1),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = registerSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                graduationYear: validatedData.graduationYear,
                degree: validatedData.degree,
                major: validatedData.major,
            },
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

        // Generate token
        const token = generateToken(user.id);

        return NextResponse.json({ user, token }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
