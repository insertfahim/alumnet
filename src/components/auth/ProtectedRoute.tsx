"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthUtils } from "@/lib/auth-utils";

interface ProtectedRouteProps {
    children: ReactNode;
    requireAuth?: boolean;
    requireVerification?: boolean;
    requireAdminVerification?: boolean;
    adminOnly?: boolean;
    redirectTo?: string;
    fallback?: ReactNode;
}

export default function ProtectedRoute({
    children,
    requireAuth = true,
    requireVerification = false,
    requireAdminVerification = false,
    adminOnly = false,
    redirectTo,
    fallback,
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return; // Wait for auth check to complete

        // Check authentication requirement
        if (requireAuth && !AuthUtils.isAuthenticated(user)) {
            const loginUrl =
                redirectTo ||
                `/login?redirect=${encodeURIComponent(
                    window.location.pathname
                )}`;
            router.push(loginUrl);
            return;
        }

        // Check admin requirement
        if (adminOnly && !AuthUtils.canAccessAdmin(user)) {
            router.push("/dashboard");
            return;
        }

        // Check email verification requirement
        if (requireVerification && !AuthUtils.hasVerifiedEmail(user)) {
            router.push("/auth/verify-email");
            return;
        }

        // Check admin verification requirement
        if (
            requireAdminVerification &&
            !AuthUtils.canAccessPremiumFeatures(user)
        ) {
            router.push("/dashboard?verification=pending");
            return;
        }
    }, [
        user,
        loading,
        requireAuth,
        requireVerification,
        requireAdminVerification,
        adminOnly,
        redirectTo,
        router,
    ]);

    // Show loading state
    if (loading) {
        return (
            fallback || (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            )
        );
    }

    // Check all requirements before rendering
    if (requireAuth && !AuthUtils.isAuthenticated(user)) {
        return null; // Will redirect
    }

    if (adminOnly && !AuthUtils.canAccessAdmin(user)) {
        return null; // Will redirect
    }

    if (requireVerification && !AuthUtils.hasVerifiedEmail(user)) {
        return null; // Will redirect
    }

    if (requireAdminVerification && !AuthUtils.canAccessPremiumFeatures(user)) {
        return null; // Will redirect
    }

    return <>{children}</>;
}

// Specific protected route components for common use cases
export function AdminRoute({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute
            adminOnly={true}
            requireAuth={true}
            requireVerification={true}
        >
            {children}
        </ProtectedRoute>
    );
}

export function AlumniRoute({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute requireAuth={true} requireVerification={true}>
            {children}
        </ProtectedRoute>
    );
}

export function VerifiedAlumniRoute({ children }: { children: ReactNode }) {
    return (
        <ProtectedRoute
            requireAuth={true}
            requireVerification={true}
            requireAdminVerification={true}
        >
            {children}
        </ProtectedRoute>
    );
}
