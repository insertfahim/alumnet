"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Briefcase,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    BarChart3,
} from "lucide-react";

interface ApplicationStats {
    total: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
}

export function ApplicationsStats() {
    const [stats, setStats] = useState<ApplicationStats>({
        total: 0,
        pending: 0,
        reviewed: 0,
        accepted: 0,
        rejected: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch("/api/jobs/apply", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const applications = data.applications;

                const stats: ApplicationStats = {
                    total: applications.length,
                    pending: applications.filter(
                        (app: any) => app.status === "PENDING"
                    ).length,
                    reviewed: applications.filter(
                        (app: any) => app.status === "REVIEWED"
                    ).length,
                    accepted: applications.filter(
                        (app: any) => app.status === "ACCEPTED"
                    ).length,
                    rejected: applications.filter(
                        (app: any) => app.status === "REJECTED"
                    ).length,
                };

                setStats(stats);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSuccessRate = () => {
        if (stats.total === 0) return 0;
        return Math.round((stats.accepted / stats.total) * 100);
    };

    const statCards = [
        {
            title: "Total Applications",
            value: stats.total,
            icon: Briefcase,
            color: "bg-blue-500",
        },
        {
            title: "Pending Review",
            value: stats.pending,
            icon: Clock,
            color: "bg-yellow-500",
        },
        {
            title: "Accepted",
            value: stats.accepted,
            icon: CheckCircle,
            color: "bg-green-500",
        },
        {
            title: "Success Rate",
            value: `${getSuccessRate()}%`,
            icon: TrendingUp,
            color: "bg-purple-500",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                        <Card
                            key={index}
                            className="hover:shadow-md transition-shadow"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {card.title}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {card.value}
                                        </p>
                                    </div>
                                    <div
                                        className={`p-3 rounded-full ${card.color}`}
                                    >
                                        <IconComponent className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {stats.total > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Application Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                    Pending ({stats.pending})
                                </span>
                                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{
                                            width: `${
                                                (stats.pending / stats.total) *
                                                100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {Math.round(
                                        (stats.pending / stats.total) * 100
                                    )}
                                    %
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                    Reviewed ({stats.reviewed})
                                </span>
                                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{
                                            width: `${
                                                (stats.reviewed / stats.total) *
                                                100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {Math.round(
                                        (stats.reviewed / stats.total) * 100
                                    )}
                                    %
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                    Accepted ({stats.accepted})
                                </span>
                                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{
                                            width: `${
                                                (stats.accepted / stats.total) *
                                                100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {Math.round(
                                        (stats.accepted / stats.total) * 100
                                    )}
                                    %
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                    Rejected ({stats.rejected})
                                </span>
                                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{
                                            width: `${
                                                (stats.rejected / stats.total) *
                                                100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {Math.round(
                                        (stats.rejected / stats.total) * 100
                                    )}
                                    %
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
