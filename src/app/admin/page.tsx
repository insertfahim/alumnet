"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import VerificationManager from "@/components/admin/VerificationManager";
import UserManagement from "@/components/admin/UserManagement";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import NewsletterManagement from "@/components/admin/NewsletterManagement";
import ContentModeration from "@/components/admin/ContentModeration";
import EventManagement from "@/components/admin/EventManagement";
import SystemSettings from "@/components/admin/SystemSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Users,
    Shield,
    CheckCircle,
    XCircle,
    FileText,
    BarChart3,
    Mail,
    DollarSign,
    Settings,
    Activity,
    MessageSquare,
    Calendar,
    Key,
    Plus,
    Save,
    X,
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
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("verifications");
    const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>(
        []
    );
    const [loading, setLoading] = useState(true);
    const [resetUserSearch, setResetUserSearch] = useState("");
    const [resetUserResults, setResetUserResults] = useState<any[]>([]);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState("");
    const [stats, setStats] = useState({
        totalUsers: 0,
        verifiedUsers: 0,
        pendingVerifications: 0,
        totalDonations: 0,
    });

    // Donation form state
    const [showDonationForm, setShowDonationForm] = useState(false);
    const [donationFormData, setDonationFormData] = useState({
        title: "",
        description: "",
        goalAmount: "",
        endDate: "",
        coverImage: "",
    });
    const [submittingDonation, setSubmittingDonation] = useState(false);

    useEffect(() => {
        if (authLoading) return; // Wait for auth check to complete

        if (!user) {
            router.push("/login");
            return;
        }

        if (user.role !== "ADMIN") {
            router.push("/");
            return;
        }

        fetchData();
    }, [user, authLoading, router]);

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

    const searchUsers = async (query: string) => {
        if (!query.trim()) {
            setResetUserResults([]);
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/users/search?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            if (response.ok) {
                const users = await response.json();
                setResetUserResults(users);
            }
        } catch (error) {
            console.error("Failed to search users:", error);
        }
    };

    const handlePasswordReset = async (userId: string) => {
        setResetLoading(true);
        setResetMessage("");

        try {
            const response = await fetch("/api/admin/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (response.ok) {
                setResetMessage(
                    `Temporary password generated for ${data.user.name}. Check the server console for the password.`
                );
                setResetUserSearch("");
                setResetUserResults([]);
            } else {
                setResetMessage(data.error || "Failed to reset password");
            }
        } catch (error) {
            setResetMessage("Network error. Please try again.");
        } finally {
            setResetLoading(false);
        }
    };

    const handleDonationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !donationFormData.title.trim() ||
            !donationFormData.description.trim() ||
            !donationFormData.goalAmount
        ) {
            alert("Please fill in all required fields");
            return;
        }

        setSubmittingDonation(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/campaigns", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: donationFormData.title,
                    description: donationFormData.description,
                    goalAmountCents: Math.round(
                        parseFloat(donationFormData.goalAmount) * 100
                    ),
                    endDate: donationFormData.endDate || null,
                    coverImage: donationFormData.coverImage || null,
                    status: "APPROVED", // Admin can directly approve
                }),
            });

            if (response.ok) {
                alert(
                    "Donation campaign created successfully! It will be visible to all users."
                );
                setShowDonationForm(false);
                setDonationFormData({
                    title: "",
                    description: "",
                    goalAmount: "",
                    endDate: "",
                    coverImage: "",
                });
            } else {
                const error = await response.json();
                alert(
                    `Failed to create campaign: ${
                        error.error || "Unknown error"
                    }`
                );
            }
        } catch (error) {
            console.error("Error creating campaign:", error);
            alert("Failed to create campaign. Please try again.");
        } finally {
            setSubmittingDonation(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Loading admin dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
                    <nav
                        className="-mb-px flex flex-wrap justify-center space-x-8"
                        aria-label="Tabs"
                    >
                        <button
                            onClick={() => setActiveTab("verifications")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "verifications"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <Shield className="w-4 h-4 inline mr-2" />
                            Profile Verifications
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "users"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            User Management
                        </button>
                        <button
                            onClick={() => setActiveTab("password-reset")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "password-reset"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <Key className="w-4 h-4 inline mr-2" />
                            Password Reset
                        </button>
                        <button
                            onClick={() => setActiveTab("analytics")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "analytics"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <BarChart3 className="w-4 h-4 inline mr-2" />
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab("events")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "events"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Events
                        </button>
                        <button
                            onClick={() => setActiveTab("donations")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "donations"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <DollarSign className="w-4 h-4 inline mr-2" />
                            Donations
                        </button>
                        <button
                            onClick={() => setActiveTab("system")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "system"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <Settings className="w-4 h-4 inline mr-2" />
                            System
                        </button>
                        <button
                            onClick={() => setActiveTab("legacy")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "legacy"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <Activity className="w-4 h-4 inline mr-2" />
                            Legacy Verifications
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === "verifications" && <VerificationManager />}

                    {activeTab === "users" && <UserManagement />}

                    {activeTab === "password-reset" && (
                        <div className="space-y-6">
                            <div className="text-center py-8">
                                <Key className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-xl font-medium mb-2">
                                    Password Reset Management
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Help users reset their passwords when they
                                    can't access their email.
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-blue-900 mb-4">
                                    How Password Reset Works
                                </h4>
                                <div className="space-y-3 text-sm text-blue-800">
                                    <p>
                                        <strong>1. User Request:</strong> Users
                                        can request a password reset from the
                                        login page.
                                    </p>
                                    <p>
                                        <strong>2. Console Output:</strong>{" "}
                                        Since email is not configured, reset
                                        links are logged to the server console.
                                    </p>
                                    <p>
                                        <strong>3. Admin Assistance:</strong> As
                                        an admin, you can help users by:
                                    </p>
                                    <ul className="list-disc list-inside ml-4 space-y-1">
                                        <li>
                                            Checking the server console for
                                            reset links
                                        </li>
                                        <li>
                                            Sharing the reset link directly with
                                            the user
                                        </li>
                                        <li>
                                            Manually resetting passwords if
                                            needed
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">
                                    Manual Password Reset
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Search for a user and generate a temporary
                                    password for them.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="user-search"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Search Users
                                        </label>
                                        <input
                                            type="text"
                                            id="user-search"
                                            value={resetUserSearch}
                                            onChange={(e) => {
                                                setResetUserSearch(
                                                    e.target.value
                                                );
                                                searchUsers(e.target.value);
                                            }}
                                            placeholder="Enter name or email..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>

                                    {resetUserResults.length > 0 && (
                                        <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                                            {resetUserResults.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="p-3 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {user.firstName}{" "}
                                                            {user.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={() =>
                                                            handlePasswordReset(
                                                                user.id
                                                            )
                                                        }
                                                        disabled={resetLoading}
                                                        size="sm"
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        {resetLoading
                                                            ? "Resetting..."
                                                            : "Reset Password"}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {resetMessage && (
                                        <div
                                            className={`p-4 rounded-md ${
                                                resetMessage.includes(
                                                    "generated"
                                                )
                                                    ? "bg-green-50 border border-green-200"
                                                    : "bg-red-50 border border-red-200"
                                            }`}
                                        >
                                            <p
                                                className={`text-sm ${
                                                    resetMessage.includes(
                                                        "generated"
                                                    )
                                                        ? "text-green-800"
                                                        : "text-red-800"
                                                }`}
                                            >
                                                {resetMessage}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "analytics" && <AnalyticsDashboard />}

                    {activeTab === "newsletter" && <NewsletterManagement />}

                    {activeTab === "content" && <ContentModeration />}

                    {activeTab === "events" && <EventManagement />}

                    {activeTab === "donations" && (
                        <div className="space-y-6">
                            {!showDonationForm ? (
                                <div className="text-center py-8">
                                    <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-medium mb-2">
                                        Donations Management
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Create and manage fundraising campaigns
                                        that all users can see and donate to.
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <Button
                                            onClick={() =>
                                                setShowDonationForm(true)
                                            }
                                            className="bg-primary-600 hover:bg-primary-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Donation Post
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                (window.location.href =
                                                    "/admin/donations")
                                            }
                                            variant="outline"
                                        >
                                            View All Campaigns
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Card className="max-w-2xl mx-auto">
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle>
                                                Create New Donation Campaign
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setShowDonationForm(false)
                                                }
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <form
                                            onSubmit={handleDonationSubmit}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <Label htmlFor="donation-title">
                                                    Campaign Title *
                                                </Label>
                                                <Input
                                                    id="donation-title"
                                                    value={
                                                        donationFormData.title
                                                    }
                                                    onChange={(e) =>
                                                        setDonationFormData(
                                                            (prev) => ({
                                                                ...prev,
                                                                title: e.target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="Enter campaign title"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="donation-description">
                                                    Description *
                                                </Label>
                                                <Textarea
                                                    id="donation-description"
                                                    value={
                                                        donationFormData.description
                                                    }
                                                    onChange={(e) =>
                                                        setDonationFormData(
                                                            (prev) => ({
                                                                ...prev,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="Describe your fundraising campaign"
                                                    rows={4}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="donation-goal">
                                                    Goal Amount ($) *
                                                </Label>
                                                <Input
                                                    id="donation-goal"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={
                                                        donationFormData.goalAmount
                                                    }
                                                    onChange={(e) =>
                                                        setDonationFormData(
                                                            (prev) => ({
                                                                ...prev,
                                                                goalAmount:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="1000.00"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="donation-end-date">
                                                    End Date (Optional)
                                                </Label>
                                                <Input
                                                    id="donation-end-date"
                                                    type="date"
                                                    value={
                                                        donationFormData.endDate
                                                    }
                                                    onChange={(e) =>
                                                        setDonationFormData(
                                                            (prev) => ({
                                                                ...prev,
                                                                endDate:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="donation-image">
                                                    Cover Image URL (Optional)
                                                </Label>
                                                <Input
                                                    id="donation-image"
                                                    value={
                                                        donationFormData.coverImage
                                                    }
                                                    onChange={(e) =>
                                                        setDonationFormData(
                                                            (prev) => ({
                                                                ...prev,
                                                                coverImage:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        submittingDonation
                                                    }
                                                    className="bg-primary-600 hover:bg-primary-700"
                                                >
                                                    {submittingDonation ? (
                                                        "Creating..."
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4 mr-2" />
                                                            Create Campaign
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setShowDonationForm(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {activeTab === "system" && <SystemSettings />}

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
                </div>
            </div>
        </div>
    );
}
