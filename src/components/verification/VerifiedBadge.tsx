"use client";

import { CheckCircle2 } from "lucide-react";

interface VerifiedBadgeProps {
    isVerified: boolean;
    size?: "sm" | "md" | "lg";
    showText?: boolean;
    className?: string;
}

export default function VerifiedBadge({
    isVerified,
    size = "md",
    showText = false,
    className = "",
}: VerifiedBadgeProps) {
    if (!isVerified) return null;

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    const textSizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
    };

    return (
        <div className={`flex items-center text-blue-600 ${className}`}>
            <CheckCircle2
                className={`${sizeClasses[size]} fill-blue-600 text-white`}
                aria-label="Verified Profile"
            />
            {showText && (
                <span className={`ml-1 font-medium ${textSizeClasses[size]}`}>
                    Verified
                </span>
            )}
        </div>
    );
}
