import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateToken } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = loginSchema.parse(body);

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Generate token
        const token = generateToken(user.id);

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword, token });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
