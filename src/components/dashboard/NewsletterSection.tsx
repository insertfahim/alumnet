"use client";

import { useState, useEffect } from "react";
import { Mail, Calendar, Eye, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Newsletter {
    id: string;
    title: string;
    subject: string;
    content: string;
    category: string;
    sentAt: string;
    receivedAt: string;
    isRead: boolean;
}

interface NewsletterSectionProps {
    limit?: number;
}

export default function NewsletterSection({
    limit = 5,
}: NewsletterSectionProps) {
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchNewsletters();
    }, []);

    const fetchNewsletters = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/dashboard/newsletters?limit=${limit}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch newsletters");
            }

            const data = await response.json();
            setNewsletters(data.newsletters);
        } catch (err) {
            console.error("Error fetching newsletters:", err);
            setError("Failed to load newsletters");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            general: "bg-blue-100 text-blue-800",
            jobs: "bg-purple-100 text-purple-800",
            events: "bg-green-100 text-green-800",
            mentorship: "bg-orange-100 text-orange-800",
        };
        return (
            colors[category as keyof typeof colors] ||
            "bg-gray-100 text-gray-800"
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-16 bg-gray-200 rounded"
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Mail className="w-6 h-6 text-blue-500 mr-2" />
                    Recent Newsletters
                </h2>
                <Link
                    href="/dashboard/newsletters"
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                >
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            {newsletters.length === 0 ? (
                <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No newsletters received yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Newsletters will appear here when they're sent
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {newsletters.map((newsletter) => (
                        <div
                            key={newsletter.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {newsletter.title}
                                        </h3>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                                                newsletter.category
                                            )}`}
                                        >
                                            {newsletter.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                        {newsletter.subject}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {formatDate(newsletter.receivedAt)}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                        title="Mark as read"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
