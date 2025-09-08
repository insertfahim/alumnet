"use client";

import { useState, useEffect } from "react";
import {
    Mail,
    Plus,
    Send,
    Edit,
    Trash2,
    Users,
    Calendar,
    Eye,
    Clock,
    CheckCircle,
    AlertCircle,
    Filter,
    Search,
    RefreshCw,
} from "lucide-react";

interface Campaign {
    id: string;
    title: string;
    subject: string;
    bodyHtml?: string;
    bodyText?: string;
    category: string;
    status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "PAUSED" | "CANCELLED";
    scheduledAt?: string;
    sentAt?: string;
    createdAt: string;
    updatedAt: string;
    _count: {
        sends: number;
    };
}

interface Subscriber {
    id: string;
    categories: string[];
    frequency: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        graduationYear: number;
        major: string;
        createdAt: string;
    };
}

export default function NewsletterManagement() {
    const [activeTab, setActiveTab] = useState("campaigns");
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCampaigns, setTotalCampaigns] = useState(0);
    const [totalSubscribers, setTotalSubscribers] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(
        null
    );
    const [filters, setFilters] = useState({
        status: "all",
        search: "",
    });
    const [stats, setStats] = useState({
        subscribed: 0,
        unsubscribed: 0,
        categoryBreakdown: [],
    });
    const [showSendModal, setShowSendModal] = useState(false);
    const [sendResult, setSendResult] = useState<{
        campaign: any;
        subscribers: any[];
        recipientCount: number;
        successfulSends: number;
    } | null>(null);

    useEffect(() => {
        if (activeTab === "campaigns") {
            fetchCampaigns();
        } else {
            fetchSubscribers();
        }
    }, [activeTab, page, filters]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                status: filters.status,
            });

            const token = localStorage.getItem("token");
            const response = await fetch(
                `/api/admin/newsletter/campaigns?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch campaigns");
            }

            const data = await response.json();
            setCampaigns(data.campaigns);
            setTotalPages(data.pagination.totalPages);
            setTotalCampaigns(data.pagination.totalCampaigns);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                search: filters.search,
            });

            const token = localStorage.getItem("token");
            const response = await fetch(
                `/api/admin/newsletter/subscribers?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch subscribers");
            }

            const data = await response.json();
            setSubscribers(data.subscribers);
            setTotalPages(data.pagination.totalPages);
            setTotalSubscribers(data.pagination.totalSubscribers);
            setStats(data.stats);
        } catch (error) {
            console.error("Error fetching subscribers:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendCampaign = async (campaignId: string) => {
        console.log("Sending campaign:", campaignId);
        if (
            !confirm(
                "Are you sure you want to send this campaign? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            console.log("Token exists:", !!token);

            const response = await fetch("/api/admin/newsletter/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ campaignId }),
            });

            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Error response:", errorData);
                throw new Error("Failed to send campaign");
            }

            const data = await response.json();
            console.log("Success response:", data);
            setSendResult({
                campaign: data.campaign,
                subscribers: data.subscribers,
                recipientCount: data.recipientCount,
                successfulSends: data.successfulSends,
            });
            setShowSendModal(true);
            fetchCampaigns();
        } catch (error) {
            console.error("Error sending campaign:", error);
            alert("Failed to send campaign");
        }
    };

    const deleteCampaign = async (campaignId: string) => {
        if (!confirm("Are you sure you want to delete this campaign?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/admin/newsletter/campaigns", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ campaignId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete campaign");
            }

            fetchCampaigns();
        } catch (error) {
            console.error("Error deleting campaign:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to delete campaign";
            alert(errorMessage);
        }
    };

    const pauseCampaign = async (campaignId: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/admin/newsletter/campaigns", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    campaignId,
                    status: "PAUSED",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to pause campaign");
            }

            fetchCampaigns();
        } catch (error) {
            console.error("Error pausing campaign:", error);
        }
    };

    const resumeCampaign = async (campaignId: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/admin/newsletter/campaigns", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    campaignId,
                    status: "DRAFT",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to resume campaign");
            }

            fetchCampaigns();
        } catch (error) {
            console.error("Error resuming campaign:", error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "DRAFT":
                return (
                    <span className="flex items-center text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-sm">
                        <Edit className="w-3 h-3 mr-1" />
                        Draft
                    </span>
                );
            case "SCHEDULED":
                return (
                    <span className="flex items-center text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        Scheduled
                    </span>
                );
            case "SENDING":
                return (
                    <span className="flex items-center text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-sm">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Sending
                    </span>
                );
            case "SENT":
                return (
                    <span className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Sent
                    </span>
                );
            case "PAUSED":
                return (
                    <span className="flex items-center text-orange-600 bg-orange-100 px-2 py-1 rounded-full text-sm">
                        <Clock className="w-3 h-3 mr-1" />
                        Paused
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-full text-sm">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Cancelled
                    </span>
                );
            default:
                return null;
        }
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            general: "bg-blue-100 text-blue-800",
            jobs: "bg-green-100 text-green-800",
            events: "bg-yellow-100 text-yellow-800",
            mentorship: "bg-purple-100 text-purple-800",
        };
        return (
            colors[category as keyof typeof colors] ||
            "bg-gray-100 text-gray-800"
        );
    };

    if (loading && campaigns.length === 0 && subscribers.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Send Campaign Modal
    if (showSendModal && sendResult) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Campaign Sent Successfully!
                            </h3>
                            <button
                                onClick={() => setShowSendModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    <span className="text-green-800 font-medium">
                                        Campaign "{sendResult.campaign.title}"
                                        has been sent successfully!
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {sendResult.recipientCount}
                                    </div>
                                    <div className="text-sm text-blue-800">
                                        Total Recipients
                                    </div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="text-2xl font-bold text-green-600">
                                        {sendResult.successfulSends}
                                    </div>
                                    <div className="text-sm text-green-800">
                                        Successfully Sent
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg">
                                <div className="p-4 border-b border-gray-200">
                                    <h4 className="font-medium text-gray-900">
                                        Campaign Details
                                    </h4>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Subject:
                                        </span>
                                        <span className="font-medium">
                                            {sendResult.campaign.subject}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Category:
                                        </span>
                                        <span className="font-medium capitalize">
                                            {sendResult.campaign.category}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Sent At:
                                        </span>
                                        <span className="font-medium">
                                            {new Date().toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg">
                                <div className="p-4 border-b border-gray-200">
                                    <h4 className="font-medium text-gray-900">
                                        Recipients (
                                        {sendResult.subscribers.length})
                                    </h4>
                                </div>
                                <div className="max-h-40 overflow-y-auto">
                                    {sendResult.subscribers.map(
                                        (subscriber: any, index: number) => (
                                            <div
                                                key={index}
                                                className="p-3 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {subscriber.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {subscriber.email}
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-green-600">
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    <span className="text-sm">
                                                        Sent
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowSendModal(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Newsletter Management
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Manage email campaigns and subscribers
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Campaign
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => {
                                setActiveTab("campaigns");
                                setPage(1);
                            }}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "campaigns"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <Mail className="w-4 h-4 inline mr-2" />
                            Campaigns ({totalCampaigns})
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("subscribers");
                                setPage(1);
                            }}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "subscribers"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            Subscribers ({totalSubscribers})
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === "campaigns" && (
                        <div className="space-y-4">
                            {/* Filters */}
                            <div className="flex items-center space-x-4">
                                <select
                                    value={filters.status}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            status: e.target.value,
                                        })
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="PAUSED">Paused</option>
                                    <option value="SENT">Sent</option>
                                </select>
                                <button
                                    onClick={fetchCampaigns}
                                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </button>
                            </div>

                            {/* Campaigns List */}
                            {campaigns.length === 0 ? (
                                <div className="text-center py-8">
                                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        No campaigns found
                                    </p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Create First Campaign
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {campaigns.map((campaign) => (
                                        <div
                                            key={campaign.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-medium text-gray-900">
                                                            {campaign.title}
                                                        </h3>
                                                        {getStatusBadge(
                                                            campaign.status
                                                        )}
                                                        <span
                                                            className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(
                                                                campaign.category
                                                            )}`}
                                                        >
                                                            {campaign.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Subject:{" "}
                                                        {campaign.subject}
                                                    </p>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span>
                                                            Created:{" "}
                                                            {new Date(
                                                                campaign.createdAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                        {campaign.sentAt && (
                                                            <span>
                                                                Sent:{" "}
                                                                {new Date(
                                                                    campaign.sentAt
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {campaign.scheduledAt && (
                                                            <span>
                                                                Scheduled:{" "}
                                                                {new Date(
                                                                    campaign.scheduledAt
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        <span>
                                                            {
                                                                campaign._count
                                                                    .sends
                                                            }{" "}
                                                            recipients
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {(campaign.status ===
                                                        "DRAFT" ||
                                                        campaign.status ===
                                                            "PAUSED" ||
                                                        campaign.status ===
                                                            "SENT") && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    setEditingCampaign(
                                                                        campaign
                                                                    )
                                                                }
                                                                className="p-2 text-gray-400 hover:text-blue-600"
                                                                title="Edit campaign"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            {campaign.status !==
                                                                "SENT" && (
                                                                <button
                                                                    onClick={() =>
                                                                        sendCampaign(
                                                                            campaign.id
                                                                        )
                                                                    }
                                                                    className="p-2 text-gray-400 hover:text-green-600"
                                                                    title="Send campaign"
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    {campaign.status ===
                                                        "SCHEDULED" && (
                                                        <button
                                                            onClick={() =>
                                                                pauseCampaign(
                                                                    campaign.id
                                                                )
                                                            }
                                                            className="p-2 text-gray-400 hover:text-orange-600"
                                                            title="Pause campaign"
                                                        >
                                                            <Clock className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {campaign.status ===
                                                        "PAUSED" && (
                                                        <button
                                                            onClick={() =>
                                                                resumeCampaign(
                                                                    campaign.id
                                                                )
                                                            }
                                                            className="p-2 text-gray-400 hover:text-green-600"
                                                            title="Resume campaign"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {campaign.status !==
                                                        "SENDING" &&
                                                        campaign.status !==
                                                            "SENT" && (
                                                            <button
                                                                onClick={() =>
                                                                    deleteCampaign(
                                                                        campaign.id
                                                                    )
                                                                }
                                                                className="p-2 text-gray-400 hover:text-red-600"
                                                                title="Delete campaign"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "subscribers" && (
                        <div className="space-y-4">
                            {/* Search and Stats */}
                            <div className="flex items-center justify-between">
                                <div className="flex-1 relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search subscribers..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={filters.search}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                search: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>Subscribed: {stats.subscribed}</span>
                                    <span>
                                        Unsubscribed: {stats.unsubscribed}
                                    </span>
                                </div>
                            </div>

                            {/* Subscribers List */}
                            {subscribers.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        No subscribers found
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Subscriber
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Categories
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Frequency
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Subscribed
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {subscribers.map((subscriber) => (
                                                <tr
                                                    key={subscriber.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {
                                                                    subscriber
                                                                        .user
                                                                        .firstName
                                                                }{" "}
                                                                {
                                                                    subscriber
                                                                        .user
                                                                        .lastName
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {
                                                                    subscriber
                                                                        .user
                                                                        .email
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {
                                                                    subscriber
                                                                        .user
                                                                        .role
                                                                }{" "}
                                                                • Class of{" "}
                                                                {
                                                                    subscriber
                                                                        .user
                                                                        .graduationYear
                                                                }
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {subscriber.categories.map(
                                                                (category) => (
                                                                    <span
                                                                        key={
                                                                            category
                                                                        }
                                                                        className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(
                                                                            category
                                                                        )}`}
                                                                    >
                                                                        {
                                                                            category
                                                                        }
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {subscriber.frequency}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {new Date(
                                                            subscriber.createdAt
                                                        ).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-700">
                                Page {page} of {totalPages}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Campaign Modal */}
            {(showCreateModal || editingCampaign) && (
                <CampaignModal
                    campaign={editingCampaign}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingCampaign(null);
                    }}
                    onSave={() => {
                        setShowCreateModal(false);
                        setEditingCampaign(null);
                        fetchCampaigns();
                    }}
                />
            )}
        </div>
    );
}

interface CampaignModalProps {
    campaign?: Campaign | null;
    onClose: () => void;
    onSave: () => void;
}

function CampaignModal({ campaign, onClose, onSave }: CampaignModalProps) {
    const [formData, setFormData] = useState({
        title: campaign?.title || "",
        subject: campaign?.subject || "",
        bodyHtml: campaign?.bodyHtml || "",
        bodyText: campaign?.bodyText || "",
        category: campaign?.category || "general",
        scheduledAt: campaign?.scheduledAt || "",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem("token");
            const url = campaign
                ? "/api/admin/newsletter/campaigns"
                : "/api/admin/newsletter/campaigns";

            const method = campaign ? "PATCH" : "POST";
            const body = campaign
                ? {
                      campaignId: campaign.id,
                      title: formData.title,
                      subject: formData.subject,
                      content: formData.bodyHtml,
                      category: formData.category,
                      scheduledFor: formData.scheduledAt || null,
                  }
                : {
                      title: formData.title,
                      subject: formData.subject,
                      content: formData.bodyHtml,
                      category: formData.category,
                      scheduledFor: formData.scheduledAt || null,
                  };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error("Failed to save campaign");
            }

            onSave();
        } catch (error) {
            console.error("Error saving campaign:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        {campaign ? "Edit Campaign" : "Create Campaign"}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Campaign Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Subject
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    subject: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    category: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="general">General</option>
                            <option value="jobs">Jobs</option>
                            <option value="events">Events</option>
                            <option value="mentorship">Mentorship</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Content (HTML)
                        </label>
                        <textarea
                            value={formData.bodyHtml}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    bodyHtml: e.target.value,
                                })
                            }
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter HTML content for the email..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Schedule For Later (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.scheduledAt}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    scheduledAt: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : campaign
                            ? "Update Campaign"
                            : "Create Campaign"}
                    </button>
                </div>
            </div>
        </div>
    );
}
