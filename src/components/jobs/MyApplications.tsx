"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Briefcase,
    Clock,
    MapPin,
    Building2,
    ExternalLink,
    Calendar,
    CheckCircle,
    XCircle,
    Clock3,
    Eye,
} from "lucide-react";
import { ApplicationsStats } from "./ApplicationsStats";

interface JobApplication {
    id: string;
    status: "PENDING" | "REVIEWED" | "REJECTED" | "ACCEPTED";
    coverLetter: string;
    resumeUrl: string | null;
    createdAt: string;
    job: {
        id: string;
        title: string;
        company: string;
        location: string;
        type: string;
        remote: boolean;
        expiresAt: string;
        postedBy: {
            firstName: string;
            lastName: string;
        };
    };
}

export function MyApplications() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
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
                setApplications(data.applications);
            }
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "REVIEWED":
                return "bg-blue-100 text-blue-800";
            case "ACCEPTED":
                return "bg-green-100 text-green-800";
            case "REJECTED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Clock3 className="h-4 w-4" />;
            case "REVIEWED":
                return <Eye className="h-4 w-4" />;
            case "ACCEPTED":
                return <CheckCircle className="h-4 w-4" />;
            case "REJECTED":
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock3 className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <ApplicationsStats />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="space-y-6">
                <ApplicationsStats />
                <Card>
                    <CardContent className="text-center py-12">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Applications Yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                            You haven't applied to any jobs yet. Start exploring
                            opportunities!
                        </p>
                        <Button
                            onClick={() => (window.location.href = "/jobs")}
                        >
                            Browse Jobs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ApplicationsStats />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        My Job Applications
                    </h2>
                    <p className="text-sm text-gray-600">
                        {applications.length} application
                        {applications.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {applications.map((application) => (
                    <Card
                        key={application.id}
                        className="hover:shadow-md transition-shadow"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {application.job.title}
                                        </h3>
                                        <Badge
                                            className={`flex items-center gap-1 ${getStatusColor(
                                                application.status
                                            )}`}
                                        >
                                            {getStatusIcon(application.status)}
                                            {application.status}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Building2 className="h-4 w-4" />
                                            {application.job.company}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {application.job.location}
                                            {application.job.remote &&
                                                " • Remote"}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            Applied{" "}
                                            {formatDate(application.createdAt)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                {
                                                    "full-time":
                                                        "bg-green-100 text-green-800",
                                                    "part-time":
                                                        "bg-blue-100 text-blue-800",
                                                    contract:
                                                        "bg-purple-100 text-purple-800",
                                                    internship:
                                                        "bg-orange-100 text-orange-800",
                                                }[application.job.type] ||
                                                "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {application.job.type
                                                .charAt(0)
                                                .toUpperCase() +
                                                application.job.type
                                                    .slice(1)
                                                    .replace("-", " ")}
                                        </span>

                                        {isExpired(
                                            application.job.expiresAt
                                        ) && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Expired
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cover Letter Preview */}
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    Cover Letter
                                </h4>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                                    {application.coverLetter.length > 200
                                        ? `${application.coverLetter.substring(
                                              0,
                                              200
                                          )}...`
                                        : application.coverLetter}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-xs text-gray-500">
                                    Posted by{" "}
                                    {application.job.postedBy.firstName}{" "}
                                    {application.job.postedBy.lastName}
                                </div>

                                <div className="flex gap-2">
                                    {application.resumeUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                window.open(
                                                    application.resumeUrl!,
                                                    "_blank"
                                                )
                                            }
                                        >
                                            <ExternalLink className="h-4 w-4 mr-1" />
                                            Resume
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            (window.location.href = `/jobs?id=${application.job.id}`)
                                        }
                                    >
                                        View Job
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
