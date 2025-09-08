"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import CampaignProposalForm from "@/components/donations/CampaignProposalForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Edit,
    DollarSign,
    Calendar,
    ArrowLeft,
    AlertTriangle,
    Send,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserCampaign {
    id: string;
    title: string;
    description: string;
    goalAmountCents: number;
    currentAmountCents: number;
    endDate?: string;
    coverImage?: string;
    status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
    createdAt: string;
    approvedAt?: string;
    isActive: boolean;
}

export default function UserProposalsPage() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<UserCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        if (user) {
            fetchUserCampaigns();
        }
    }, [user]);

    const fetchUserCampaigns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(
                "/api/campaigns?status=all&userOwned=true",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.campaigns);
            } else {
                toast.error("Failed to fetch your proposals");
            }
        } catch (error) {
            console.error("Error fetching user campaigns:", error);
            toast.error("Failed to load your proposals");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDraft = async (campaignId: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: "PENDING",
                }),
            });

            if (response.ok) {
                toast.success("Draft submitted for review!");
                fetchUserCampaigns();
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to submit draft");
            }
        } catch (error) {
            console.error("Error submitting draft:", error);
            toast.error("Failed to submit draft");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                    </Badge>
                );
            case "APPROVED":
                return (
                    <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge className="bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            case "DRAFT":
                return (
                    <Badge className="bg-gray-100 text-gray-800">
                        <FileText className="h-3 w-3 mr-1" />
                        Draft
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const formatCurrency = (amountCents: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amountCents / 100);
    };

    const filteredCampaigns = campaigns.filter((campaign) => {
        if (activeTab === "all") return true;
        return campaign.status.toLowerCase() === activeTab;
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center py-12">
                        <div className="text-6xl mb-4">🔒</div>
                        <h3 className="text-xl font-medium mb-2">
                            Login Required
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Please log in to view your campaign proposals.
                        </p>
                        <Button>
                            <Link href="/login">Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm">
                            <Link
                                href="/donations"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Donations
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                My Campaign Proposals
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Track and manage your fundraising campaign
                                submissions
                            </p>
                        </div>
                    </div>
                    <CampaignProposalForm onSuccess={fetchUserCampaigns} />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <FileText className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Proposals
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {campaigns.length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-yellow-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Pending Review
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            campaigns.filter(
                                                (c) => c.status === "PENDING"
                                            ).length
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Approved
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            campaigns.filter(
                                                (c) => c.status === "APPROVED"
                                            ).length
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <DollarSign className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Raised
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(
                                            campaigns
                                                .filter(
                                                    (c) =>
                                                        c.status === "APPROVED"
                                                )
                                                .reduce(
                                                    (sum, c) =>
                                                        sum +
                                                        c.currentAmountCents,
                                                    0
                                                )
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Proposals List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Proposals</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="mb-6">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="draft">Drafts</TabsTrigger>
                                <TabsTrigger value="pending">
                                    Pending
                                </TabsTrigger>
                                <TabsTrigger value="approved">
                                    Approved
                                </TabsTrigger>
                                <TabsTrigger value="rejected">
                                    Rejected
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab}>
                                {loading ? (
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="animate-pulse"
                                            >
                                                <div className="h-32 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredCampaigns.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                        <h3 className="text-xl font-medium mb-2">
                                            No proposals found
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            {activeTab === "all"
                                                ? "You haven't submitted any campaign proposals yet."
                                                : `No ${activeTab} proposals found.`}
                                        </p>
                                        <CampaignProposalForm
                                            onSuccess={fetchUserCampaigns}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredCampaigns.map((campaign) => (
                                            <Card
                                                key={campaign.id}
                                                className="border-l-4 border-l-blue-500"
                                            >
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-xl font-semibold">
                                                                    {
                                                                        campaign.title
                                                                    }
                                                                </h3>
                                                                {getStatusBadge(
                                                                    campaign.status
                                                                )}
                                                            </div>

                                                            <p className="text-gray-600 mb-4 line-clamp-2">
                                                                {
                                                                    campaign.description
                                                                }
                                                            </p>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-gray-500">
                                                                        Goal:
                                                                    </span>
                                                                    <p className="font-semibold">
                                                                        {formatCurrency(
                                                                            campaign.goalAmountCents
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                {campaign.status ===
                                                                    "APPROVED" && (
                                                                    <div>
                                                                        <span className="text-gray-500">
                                                                            Raised:
                                                                        </span>
                                                                        <p className="font-semibold text-green-600">
                                                                            {formatCurrency(
                                                                                campaign.currentAmountCents
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="text-gray-500">
                                                                        Submitted:
                                                                    </span>
                                                                    <p>
                                                                        {new Date(
                                                                            campaign.createdAt
                                                                        ).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                {campaign.endDate && (
                                                                    <div>
                                                                        <span className="text-gray-500">
                                                                            End
                                                                            Date:
                                                                        </span>
                                                                        <p>
                                                                            {new Date(
                                                                                campaign.endDate
                                                                            ).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {campaign.status ===
                                                                "REJECTED" &&
                                                                campaign.rejectionReason && (
                                                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                                        <div className="flex items-start gap-2">
                                                                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                                                                            <div>
                                                                                <p className="text-sm font-medium text-red-800">
                                                                                    Rejection
                                                                                    Reason:
                                                                                </p>
                                                                                <p className="text-sm text-red-700">
                                                                                    {
                                                                                        campaign.rejectionReason
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>

                                                        <div className="flex flex-col gap-2 ml-4">
                                                            {campaign.status ===
                                                                "DRAFT" && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleSubmitDraft(
                                                                                campaign.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <Send className="h-3 w-3 mr-1" />
                                                                        Submit
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                    >
                                                                        <Edit className="h-3 w-3 mr-1" />
                                                                        Edit
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {campaign.status ===
                                                                "APPROVED" && (
                                                                <Button size="sm">
                                                                    <Link
                                                                        href={`/donations`}
                                                                    >
                                                                        View
                                                                        Live
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
