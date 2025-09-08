"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
    Mail,
    Calendar,
    Eye,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
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

export default function NewslettersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalNewsletters, setTotalNewsletters] = useState(0);
    const [category, setCategory] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push("/login");
            return;
        }
        fetchNewsletters();
    }, [user, authLoading, page, category, search]);

    const fetchNewsletters = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                category,
            });

            if (search) {
                params.append("search", search);
            }

            const response = await fetch(
                `/api/dashboard/newsletters?${params.toString()}`,
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
            setTotalPages(data.pagination.totalPages);
            setTotalNewsletters(data.pagination.total);
        } catch (err) {
            console.error("Error fetching newsletters:", err);
            setError("Failed to load newsletters");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
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

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "general", label: "General" },
        { value: "jobs", label: "Jobs" },
        { value: "events", label: "Events" },
        { value: "mentorship", label: "Mentorship" },
    ];

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading newsletters...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <Mail className="w-8 h-8 text-blue-500 mr-3" />
                                My Newsletters
                            </h1>
                            <p className="text-gray-600 mt-2">
                                View all newsletters you've received
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search newsletters..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>
                        <div className="sm:w-48">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {error ? (
                    <div className="bg-white rounded-lg shadow p-8">
                        <div className="text-center">
                            <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Error Loading Newsletters
                            </h3>
                            <p className="text-gray-500">{error}</p>
                            <button
                                onClick={fetchNewsletters}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : newsletters.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8">
                        <div className="text-center">
                            <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No Newsletters Found
                            </h3>
                            <p className="text-gray-500">
                                {search || category !== "all"
                                    ? "No newsletters match your current filters."
                                    : "You haven't received any newsletters yet."}
                            </p>
                            {(search || category !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setCategory("all");
                                    }}
                                    className="mt-4 text-primary-600 hover:text-primary-700"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Newsletter List */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {newsletters.map((newsletter) => (
                                    <div
                                        key={newsletter.id}
                                        className="p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {newsletter.title}
                                                    </h3>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                                                            newsletter.category
                                                        )}`}
                                                    >
                                                        {newsletter.category}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {newsletter.subject}
                                                </p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Received on{" "}
                                                    {formatDate(
                                                        newsletter.receivedAt
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-4">
                                                <button
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                    onClick={() => {
                                                        // TODO: Open newsletter in modal or new page
                                                        alert(
                                                            "Newsletter viewing will be implemented"
                                                        );
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {newsletters.length} of{" "}
                                    {totalNewsletters} newsletters
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() =>
                                            setPage(Math.max(1, page - 1))
                                        }
                                        disabled={page === 1}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setPage(
                                                Math.min(totalPages, page + 1)
                                            )
                                        }
                                        disabled={page === totalPages}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 mr-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
