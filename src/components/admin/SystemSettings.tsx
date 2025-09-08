"use client";

import React, { useState, useEffect } from "react";
import {
    Server,
    Database,
    HardDrive,
    Shield,
    RefreshCw,
    Download,
    Trash2,
    Settings,
    Activity,
    AlertTriangle,
    CheckCircle,
    Info,
} from "lucide-react";

interface SystemInfo {
    totalUsers: number;
    verifiedUsers: number;
    totalPosts: number;
    totalComments: number;
    totalJobs: number;
    totalEvents: number;
    totalDonations: number;
    pendingVerifications: number;
    databaseHealth: string;
    lastBackup: string;
    storageUsage: string;
    apiVersion: string;
    uptime: string;
}

const SystemSettings: React.FC = () => {
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchSystemInfo();
    }, []);

    const fetchSystemInfo = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/system");
            if (!response.ok) throw new Error("Failed to fetch system info");

            const data = await response.json();
            setSystemInfo(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch system info"
            );
        } finally {
            setLoading(false);
        }
    };

    const performAction = async (action: string, data?: any) => {
        try {
            setActionLoading(action);
            const response = await fetch("/api/admin/system", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, data }),
            });

            if (!response.ok) throw new Error("Failed to perform action");

            const result = await response.json();
            alert(result.message || "Action completed successfully");

            if (action === "cleanup") {
                await fetchSystemInfo(); // Refresh stats after cleanup
            }
        } catch (err) {
            alert(
                err instanceof Error ? err.message : "Failed to perform action"
            );
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    System Settings
                </h2>
                <button
                    onClick={fetchSystemInfo}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    System Health
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Database
                                className={`h-5 w-5 ${
                                    systemInfo?.databaseHealth === "Connected"
                                        ? "text-green-500"
                                        : "text-red-500"
                                }`}
                            />
                            <span className="font-medium">Database</span>
                        </div>
                        <p
                            className={`text-sm mt-1 ${
                                systemInfo?.databaseHealth === "Connected"
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {systemInfo?.databaseHealth || "Unknown"}
                        </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Server className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">Uptime</span>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">
                            {systemInfo?.uptime}
                        </p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-purple-500" />
                            <span className="font-medium">Storage</span>
                        </div>
                        <p className="text-sm text-purple-600 mt-1">
                            {systemInfo?.storageUsage}
                        </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">Version</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            API v{systemInfo?.apiVersion}
                        </p>
                    </div>
                </div>
            </div>

            {/* System Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    System Statistics
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {systemInfo?.totalUsers.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Users</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {systemInfo?.verifiedUsers} verified
                        </div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {systemInfo?.totalPosts.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Posts</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {systemInfo?.totalComments} comments
                        </div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {systemInfo?.totalJobs.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Jobs</div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                            {systemInfo?.totalEvents.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Events</div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                            ${systemInfo?.totalDonations.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Donations</div>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                            {systemInfo?.pendingVerifications.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                            Pending Verifications
                        </div>
                    </div>
                </div>
            </div>

            {/* System Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Actions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => performAction("backup")}
                        disabled={actionLoading === "backup"}
                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors disabled:opacity-50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Download className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-blue-900">
                                Create Backup
                            </span>
                        </div>
                        <p className="text-sm text-blue-700">
                            {actionLoading === "backup"
                                ? "Creating backup..."
                                : "Generate database backup"}
                        </p>
                        {systemInfo?.lastBackup && (
                            <p className="text-xs text-blue-600 mt-2">
                                Last:{" "}
                                {new Date(
                                    systemInfo.lastBackup
                                ).toLocaleDateString()}
                            </p>
                        )}
                    </button>

                    <button
                        onClick={() => performAction("cleanup")}
                        disabled={actionLoading === "cleanup"}
                        className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors disabled:opacity-50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Trash2 className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-900">
                                Database Cleanup
                            </span>
                        </div>
                        <p className="text-sm text-green-700">
                            {actionLoading === "cleanup"
                                ? "Cleaning up..."
                                : "Remove expired tokens and old data"}
                        </p>
                    </button>

                    <button
                        onClick={() => performAction("clearCache")}
                        disabled={actionLoading === "clearCache"}
                        className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors disabled:opacity-50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="h-5 w-5 text-purple-600" />
                            <span className="font-medium text-purple-900">
                                Clear Cache
                            </span>
                        </div>
                        <p className="text-sm text-purple-700">
                            {actionLoading === "clearCache"
                                ? "Clearing cache..."
                                : "Clear application cache"}
                        </p>
                    </button>

                    <button
                        onClick={() => {
                            const enabled = confirm(
                                "Enable maintenance mode? This will make the site unavailable to users."
                            );
                            performAction("maintenance", { enabled });
                        }}
                        disabled={actionLoading === "maintenance"}
                        className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors disabled:opacity-50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-5 w-5 text-orange-600" />
                            <span className="font-medium text-orange-900">
                                Maintenance Mode
                            </span>
                        </div>
                        <p className="text-sm text-orange-700">
                            {actionLoading === "maintenance"
                                ? "Updating..."
                                : "Toggle maintenance mode"}
                        </p>
                    </button>
                </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    System Information
                </h3>

                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                            Database Health
                        </span>
                        <span
                            className={`text-sm flex items-center gap-2 ${
                                systemInfo?.databaseHealth === "Connected"
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {systemInfo?.databaseHealth === "Connected" ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                <AlertTriangle className="h-4 w-4" />
                            )}
                            {systemInfo?.databaseHealth}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                            API Version
                        </span>
                        <span className="text-sm text-gray-900">
                            v{systemInfo?.apiVersion}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                            Storage Usage
                        </span>
                        <span className="text-sm text-gray-900">
                            {systemInfo?.storageUsage}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                            System Uptime
                        </span>
                        <span className="text-sm text-gray-900">
                            {systemInfo?.uptime}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-gray-600">
                            Last Backup
                        </span>
                        <span className="text-sm text-gray-900">
                            {systemInfo?.lastBackup
                                ? new Date(
                                      systemInfo.lastBackup
                                  ).toLocaleString()
                                : "Never"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
