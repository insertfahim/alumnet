"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { AuthUtils } from "@/lib/auth-utils";
import { CheckCircle, AlertTriangle, Clock, Mail } from "lucide-react";
import Link from "next/link";

export default function AuthStatus() {
    const { user, resendVerification } = useAuth();

    if (!user) return null;

    const status = AuthUtils.getVerificationStatusMessage(user);
    const completionPercentage = AuthUtils.getProfileCompletionPercentage(user);

    const getStatusIcon = () => {
        switch (status.type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "warning":
                return <Mail className="h-5 w-5 text-amber-500" />;
            case "info":
                return <Clock className="h-5 w-5 text-blue-500" />;
            case "error":
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusBorderColor = () => {
        switch (status.type) {
            case "success":
                return "border-green-200 bg-green-50";
            case "warning":
                return "border-amber-200 bg-amber-50";
            case "info":
                return "border-blue-200 bg-blue-50";
            case "error":
                return "border-red-200 bg-red-50";
            default:
                return "border-gray-200 bg-gray-50";
        }
    };

    const handleResendVerification = async () => {
        await resendVerification(user.email);
    };

    return (
        <div className="space-y-4">
            {/* Verification Status */}
            <div className={`border rounded-lg p-4 ${getStatusBorderColor()}`}>
                <div className="flex items-center space-x-3">
                    {getStatusIcon()}
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            {status.message}
                        </p>

                        {/* Action buttons based on status */}
                        {!AuthUtils.hasVerifiedEmail(user) && (
                            <div className="mt-2 flex space-x-2">
                                <button
                                    onClick={handleResendVerification}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Resend verification email
                                </button>
                            </div>
                        )}

                        {AuthUtils.hasVerifiedEmail(user) &&
                            !AuthUtils.isVerifiedByAdmin(user) &&
                            AuthUtils.isAlumni(user) && (
                                <p className="mt-1 text-xs text-gray-600">
                                    An admin will review your account soon.
                                </p>
                            )}
                    </div>
                </div>
            </div>

            {/* Profile Completion */}
            {completionPercentage < 100 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                            Profile Completion
                        </p>
                        <span className="text-sm text-gray-600">
                            {completionPercentage}%
                        </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>

                    <p className="text-xs text-gray-600 mb-2">
                        Complete your profile to unlock all features
                    </p>

                    <Link
                        href="/profile"
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Complete Profile →
                    </Link>
                </div>
            )}

            {/* Role and Permissions */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {AuthUtils.formatRole(user.role)}
                        </p>
                        <p className="text-xs text-gray-600">
                            {AuthUtils.getGraduationInfo(user)}
                        </p>
                    </div>

                    <div className="text-right">
                        {AuthUtils.canAccessPremiumFeatures(user) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                            </span>
                        )}

                        {AuthUtils.hasVerifiedEmail(user) &&
                            !AuthUtils.isVerifiedByAdmin(user) && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Pending
                                </span>
                            )}

                        {!AuthUtils.hasVerifiedEmail(user) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Unverified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Feature Access Summary */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <p className="text-sm font-medium text-gray-900 mb-3">
                    Available Features
                </p>

                <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <span>Alumni Directory</span>
                        <span
                            className={`${
                                AuthUtils.canAccessAlumniFeatures(user)
                                    ? "text-green-600"
                                    : "text-gray-400"
                            }`}
                        >
                            {AuthUtils.canAccessAlumniFeatures(user)
                                ? "✓"
                                : "✗"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span>Messaging</span>
                        <span
                            className={`${
                                AuthUtils.canAccessPremiumFeatures(user)
                                    ? "text-green-600"
                                    : "text-gray-400"
                            }`}
                        >
                            {AuthUtils.canAccessPremiumFeatures(user)
                                ? "✓"
                                : "✗"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span>Job Board</span>
                        <span
                            className={`${
                                AuthUtils.canAccessAlumniFeatures(user)
                                    ? "text-green-600"
                                    : "text-gray-400"
                            }`}
                        >
                            {AuthUtils.canAccessAlumniFeatures(user)
                                ? "✓"
                                : "✗"}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span>Events</span>
                        <span
                            className={`${
                                AuthUtils.canAccessAlumniFeatures(user)
                                    ? "text-green-600"
                                    : "text-gray-400"
                            }`}
                        >
                            {AuthUtils.canAccessAlumniFeatures(user)
                                ? "✓"
                                : "✗"}
                        </span>
                    </div>

                    {AuthUtils.isAdmin(user) && (
                        <div className="flex items-center justify-between">
                            <span>Admin Panel</span>
                            <span className="text-blue-600">✓</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
