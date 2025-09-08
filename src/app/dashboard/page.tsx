"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    User,
    Users,
    Calendar,
    Briefcase,
    MessageCircle,
    TrendingUp,
    Award,
    Bell,
    Settings,
    Edit,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

// Lazy load the NewsletterSection component
const NewsletterSection = dynamic(
    () => import("@/components/dashboard/NewsletterSection"),
    {
        loading: () => (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        ),
    }
);

interface DashboardStats {
    totalConnections: number;
    upcomingEvents: number;
    jobApplications: number;
    unreadMessages: number;
}

interface RecentActivity {
    id: string;
    type: "connection" | "event" | "job" | "message";
    title: string;
    description: string;
    timestamp: string;
}

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Fetch dashboard stats
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const response = await fetch("/api/dashboard/stats", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch stats");
            return response.json();
        },
        enabled: !!user && !authLoading,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    // Fetch recent activities
    const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
        queryKey: ["dashboard-activities"],
        queryFn: async () => {
            const response = await fetch("/api/dashboard/activities", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch activities");
            return response.json();
        },
        enabled: !!user && !authLoading,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    const dashboardStats: DashboardStats = stats || {
        totalConnections: 0,
        upcomingEvents: 0,
        jobApplications: 0,
        unreadMessages: 0,
    };
    const recentActivities: RecentActivity[] = activitiesData?.activities || [];
    const loading = authLoading || statsLoading || activitiesLoading;

    if (authLoading || statsLoading || activitiesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.firstName}!
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Here's what's happening in your alumni network
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/profile"
                            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Bell className="w-5 h-5" />
                        </button>
                        <Link
                            href="/profile"
                            className="p-2 text-gray-400 hover:text-gray-600"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Connections
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {dashboardStats.totalConnections}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-green-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Upcoming Events
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {dashboardStats.upcomingEvents}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Briefcase className="h-8 w-8 text-purple-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Job Applications
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {dashboardStats.jobApplications}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <MessageCircle className="h-8 w-8 text-orange-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Unread Messages
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {dashboardStats.unreadMessages}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Link
                                href="/directory"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Users className="w-6 h-6 text-blue-500 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Find Alumni
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Connect with fellow graduates
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="/jobs"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Briefcase className="w-6 h-6 text-purple-500 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Browse Jobs
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Find career opportunities
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="/events"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Calendar className="w-6 h-6 text-green-500 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        View Events
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Join upcoming gatherings
                                    </p>
                                </div>
                            </Link>

                            <Link
                                href="/messages"
                                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <MessageCircle className="w-6 h-6 text-orange-500 mr-3" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Send Message
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Reach out to connections
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Recent Activity
                        </h2>
                        {recentActivities.length === 0 ? (
                            <div className="text-center py-8">
                                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    No recent activity to show
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Start exploring to see your activity here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex-shrink-0">
                                            {activity.type === "connection" && (
                                                <Users className="w-5 h-5 text-blue-500" />
                                            )}
                                            {activity.type === "event" && (
                                                <Calendar className="w-5 h-5 text-green-500" />
                                            )}
                                            {activity.type === "job" && (
                                                <Briefcase className="w-5 h-5 text-purple-500" />
                                            )}
                                            {activity.type === "message" && (
                                                <MessageCircle className="w-5 h-5 text-orange-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {activity.title}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(
                                                    activity.timestamp
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Newsletters */}
                    <NewsletterSection />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Profile Completion */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Profile Completion
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Basic Info
                                </span>
                                <span className="text-sm font-medium text-green-600">
                                    ✓ Complete
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Work Experience
                                </span>
                                <span className="text-sm font-medium text-yellow-600">
                                    In Progress
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Education Details
                                </span>
                                <span className="text-sm font-medium text-green-600">
                                    ✓ Complete
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Profile Picture
                                </span>
                                <span className="text-sm font-medium text-gray-400">
                                    Not Started
                                </span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="bg-gray-200 rounded-full h-2">
                                <div className="bg-primary-600 h-2 rounded-full w-3/4"></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                75% Complete
                            </p>
                        </div>
                    </div>

                    {/* Verification Status */}
                    {user && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Verification Status
                            </h3>
                            <div className="flex items-center space-x-3">
                                {user.isVerified ? (
                                    <>
                                        <Award className="w-6 h-6 text-green-500" />
                                        <div>
                                            <p className="font-medium text-green-600">
                                                Verified Alumni
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Your profile is verified
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-6 h-6 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-yellow-600">
                                                Verification Pending
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Complete your verification
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                            {!user.isVerified && (
                                <Link
                                    href="/profile"
                                    className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100"
                                >
                                    Complete Verification
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Upcoming Events Preview */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Upcoming Events
                        </h3>
                        <div className="space-y-3">
                            <div className="text-center py-4">
                                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                    No upcoming events
                                </p>
                                <Link
                                    href="/events"
                                    className="text-sm text-primary-600 hover:text-primary-700 mt-1 inline-block"
                                >
                                    Browse all events
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
