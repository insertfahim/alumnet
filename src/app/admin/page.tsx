"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import VerificationManager from "@/components/admin/VerificationManager";
import {
    Users,
    Shield,
    CheckCircle,
    XCircle,
    FileText,
    BarChart3,
    Mail,
    DollarSign,
} from "lucide-react";

interface UnverifiedUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    graduationYear: number;
    major: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("verifications");
    const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        verifiedUsers: 0,
        pendingVerifications: 0,
        totalDonations: 0,
    });

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (user.role !== "ADMIN") {
            router.push("/");
            return;
        }

        fetchData();
    }, [user, router]);

    const fetchData = async () => {
        try {
            const response = await fetch("/api/admin/dashboard", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUnverifiedUsers(data.unverifiedUsers);
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyUser = async (userId: string, isVerified: boolean) => {
        try {
            const response = await fetch("/api/admin/verify-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ userId, isVerified }),
            });

            if (response.ok) {
                // Remove user from unverified list if verified
                if (isVerified) {
                    setUnverifiedUsers((prev) =>
                        prev.filter((u) => u.id !== userId)
                    );
                    setStats((prev) => ({
                        ...prev,
                        verifiedUsers: prev.verifiedUsers + 1,
                        pendingVerifications: prev.pendingVerifications - 1,
                    }));
                }
            } else {
                console.error("Failed to verify user");
            }
        } catch (error) {
            console.error("Error verifying user:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600">
                    Manage users, verifications, and platform settings
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total Users
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stats.totalUsers}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Shield className="h-8 w-8 text-green-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Verified Users
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stats.verifiedUsers}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <FileText className="h-8 w-8 text-yellow-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Pending Verifications
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stats.pendingVerifications}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-purple-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total Donations
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                ${stats.totalDonations}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab("verifications")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "verifications"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Profile Verifications
                        </button>
                        <button
                            onClick={() => setActiveTab("legacy")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "legacy"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Legacy Verifications
                        </button>
                        <button
                            onClick={() => setActiveTab("analytics")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "analytics"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab("newsletter")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "newsletter"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Newsletter
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === "verifications" && <VerificationManager />}

                    {activeTab === "legacy" && (
                        <>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Legacy User Verifications
                            </h2>

                            {unverifiedUsers.length === 0 ? (
                                <div className="text-center py-8">
                                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        No pending verifications
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {unverifiedUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4">
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">
                                                            {user.firstName}{" "}
                                                            {user.lastName}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {user.email}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Class of{" "}
                                                            {
                                                                user.graduationYear
                                                            }{" "}
                                                            • {user.major}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleVerifyUser(
                                                            user.id,
                                                            true
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Verify
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleVerifyUser(
                                                            user.id,
                                                            false
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "analytics" && (
                        <div className="text-center py-8">
                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                Analytics coming soon
                            </p>
                        </div>
                    )}

                    {activeTab === "newsletter" && (
                        <div className="text-center py-8">
                            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                                Newsletter management coming soon
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
