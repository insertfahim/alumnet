"use client";

import { useState, useEffect } from "react";
import {
    BarChart3,
    Users,
    TrendingUp,
    Calendar,
    Activity,
    Download,
    RefreshCw,
    PieChart,
    Map,
    DollarSign,
} from "lucide-react";

interface AnalyticsData {
    userGrowth: Array<{ date: string; count: number }>;
    metrics: {
        totalUsers: number;
        verifiedUsers: number;
        activeUsers: number;
        verificationRate: string;
        engagementRate: string;
    };
    usersByRole: Array<{ role: string; count: number }>;
    usersByGradYear: Array<{ year: number; count: number }>;
    platformUsage: {
        posts: number;
        jobs: number;
        events: number;
        mentorships: number;
    };
    topMajors: Array<{ major: string; count: number }>;
    geographicData: Array<{ location: string; count: number }>;
    donations: {
        totalAmount: number;
        totalCount: number;
    };
    recentActivity: {
        newUsers: Array<any>;
        recentPosts: Array<any>;
    };
}

export default function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("30");

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `/api/admin/analytics?period=${period}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch analytics");
            }

            const analyticsData = await response.json();
            setData(analyticsData);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const exportAnalytics = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `/api/admin/analytics/export?period=${period}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to export analytics");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `analytics-report-${
                new Date().toISOString().split("T")[0]
            }.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting analytics:", error);
        }
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Analytics Dashboard
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Platform insights and user engagement metrics
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                    <button
                        onClick={exportAnalytics}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={fetchAnalytics}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Total Users
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {data.metrics.totalUsers.toLocaleString()}
                            </p>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Verification Rate
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {data.metrics.verificationRate}%
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Active Users
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {data.metrics.activeUsers.toLocaleString()}
                            </p>
                        </div>
                        <Activity className="h-8 w-8 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Donations
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                ${data.donations.totalAmount.toLocaleString()}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        User Growth
                    </h3>
                    <div className="h-64 flex items-end justify-between space-x-1">
                        {data.userGrowth.map((item, index) => {
                            const maxCount = Math.max(
                                ...data.userGrowth.map((d) => d.count)
                            );
                            const height =
                                maxCount > 0
                                    ? (item.count / maxCount) * 100
                                    : 0;
                            return (
                                <div
                                    key={index}
                                    className="flex-1 flex flex-col items-center"
                                >
                                    <div
                                        className="w-full bg-blue-500 rounded-t"
                                        style={{ height: `${height}%` }}
                                        title={`${item.date}: ${item.count} users`}
                                    ></div>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {new Date(item.date).getDate()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Users by Role */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Users by Role
                    </h3>
                    <div className="space-y-3">
                        {data.usersByRole.map((item, index) => {
                            const percentage =
                                data.metrics.totalUsers > 0
                                    ? (
                                          (item.count /
                                              data.metrics.totalUsers) *
                                          100
                                      ).toFixed(1)
                                    : 0;
                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-sm font-medium text-gray-700">
                                        {item.role}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-500 w-12 text-right">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Platform Usage */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Platform Activity
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-semibold text-blue-600">
                                {data.platformUsage.posts}
                            </p>
                            <p className="text-sm text-gray-500">Posts</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-semibold text-green-600">
                                {data.platformUsage.jobs}
                            </p>
                            <p className="text-sm text-gray-500">Jobs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-semibold text-yellow-600">
                                {data.platformUsage.events}
                            </p>
                            <p className="text-sm text-gray-500">Events</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-semibold text-purple-600">
                                {data.platformUsage.mentorships}
                            </p>
                            <p className="text-sm text-gray-500">Mentorships</p>
                        </div>
                    </div>
                </div>

                {/* Top Majors */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Top Majors
                    </h3>
                    <div className="space-y-2">
                        {data.topMajors.slice(0, 5).map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between"
                            >
                                <span className="text-sm text-gray-700 truncate">
                                    {item.major}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Geographic Distribution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.geographicData.slice(0, 6).map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center">
                                <Map className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-700">
                                    {item.location}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {item.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* New Users */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Recent Users
                    </h3>
                    <div className="space-y-3">
                        {data.recentActivity.newUsers
                            .slice(0, 5)
                            .map((user: any) => (
                                <div
                                    key={user.id}
                                    className="flex items-center space-x-3"
                                >
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                        <Users className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {user.role}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Recent Posts */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Recent Posts
                    </h3>
                    <div className="space-y-3">
                        {data.recentActivity.recentPosts
                            .slice(0, 5)
                            .map((post: any) => (
                                <div
                                    key={post.id}
                                    className="border-l-2 border-blue-500 pl-3"
                                >
                                    <p className="text-sm text-gray-900 line-clamp-2">
                                        {post.content.substring(0, 100)}...
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        by {post.author.firstName}{" "}
                                        {post.author.lastName} •{" "}
                                        {new Date(
                                            post.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
