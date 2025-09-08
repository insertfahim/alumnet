import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Define protected routes that require authentication
const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/messages",
    "/directory",
    "/events",
    "/jobs",
    "/admin",
];

// Define admin-only routes
const adminOnlyRoutes = ["/admin"];

// Define public routes that authenticated users shouldn't access
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
    // Skip middleware during build time
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_RUNTIME) {
        return NextResponse.next();
    }

    const { pathname } = request.nextUrl;
    const token =
        request.cookies.get("token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "");

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Check if route is admin-only
    const isAdminRoute = adminOnlyRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Check if route is auth route (login/register)
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // If accessing protected routes without token, redirect to login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user has token, verify it and get user info
    if (token) {
        try {
            const decoded = verifyToken(token);

            if (!decoded) {
                // Invalid token, clear it and redirect to login if on protected route
                const response = isProtectedRoute
                    ? NextResponse.redirect(new URL("/login", request.url))
                    : NextResponse.next();

                response.cookies.delete("token");
                return response;
            }

            // For admin routes, we need to check user role from database
            if (isAdminRoute) {
                try {
                    // Note: In a real application, you might want to cache this
                    // or include role in the JWT token to avoid database calls
                    const userResponse = await fetch(
                        `${request.nextUrl.origin}/api/auth/me`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (!userResponse.ok) {
                        return NextResponse.redirect(
                            new URL("/login", request.url)
                        );
                    }

                    const user = await userResponse.json();

                    if (user.role !== "ADMIN") {
                        return NextResponse.redirect(
                            new URL("/dashboard", request.url)
                        );
                    }
                } catch (error) {
                    console.error("Error verifying admin status:", error);
                    return NextResponse.redirect(
                        new URL("/login", request.url)
                    );
                }
            }

            // If authenticated user tries to access auth routes, redirect based on role
            if (isAuthRoute) {
                try {
                    const userResponse = await fetch(
                        `${request.nextUrl.origin}/api/auth/me`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (userResponse.ok) {
                        const user = await userResponse.json();
                        if (user.role === "ADMIN") {
                            return NextResponse.redirect(
                                new URL("/admin", request.url)
                            );
                        } else {
                            return NextResponse.redirect(
                                new URL("/dashboard", request.url)
                            );
                        }
                    } else {
                        // If we can't get user data, default to dashboard
                        return NextResponse.redirect(
                            new URL("/dashboard", request.url)
                        );
                    }
                } catch (error) {
                    console.error("Error getting user data:", error);
                    return NextResponse.redirect(
                        new URL("/dashboard", request.url)
                    );
                }
            }
        } catch (error) {
            console.error("Token verification error:", error);

            // Clear invalid token
            const response = isProtectedRoute
                ? NextResponse.redirect(new URL("/login", request.url))
                : NextResponse.next();

            response.cookies.delete("token");
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!api|_next/static|_next/image|favicon.ico|public|images).*)",
    ],
};
