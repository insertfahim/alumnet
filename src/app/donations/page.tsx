"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { CampaignProgressCard } from "@/components/donations/FundraisingProgressBar";
import { DonationForm } from "@/components/donations/DonationForm";
import CampaignProposalForm from "@/components/donations/CampaignProposalForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Heart,
    Users,
    TrendingUp,
    Calendar,
    Filter,
    Plus,
    Settings,
} from "lucide-react";
import { FundraisingCampaign } from "@/types";

interface CampaignWithStats extends FundraisingCampaign {
    currentAmountCents: number;
    totalDonations: number;
    progress: number;
}

export default function DonationsPage() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] =
        useState<CampaignWithStats | null>(null);
    const [filter, setFilter] = useState<"active" | "ended" | "all">("active");

    useEffect(() => {
        fetchCampaigns();
    }, [filter, user]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/campaigns?status=${filter}`, {
                headers: token
                    ? {
                          Authorization: `Bearer ${token}`,
                      }
                    : {},
            });
            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.campaigns);
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDonationSuccess = () => {
        setSelectedCampaign(null);
        fetchCampaigns(); // Refresh campaigns to show updated amounts
    };

    const totalRaised = campaigns.reduce(
        (sum, campaign) => sum + campaign.currentAmountCents,
        0
    );
    const totalDonations = campaigns.reduce(
        (sum, campaign) => sum + campaign.totalDonations,
        0
    );
    const activeCampaigns = campaigns.filter((c) => c.isActive).length;

    if (selectedCampaign) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Button
                        variant="outline"
                        onClick={() => setSelectedCampaign(null)}
                        className="mb-6"
                    >
                        ← Back to Campaigns
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <CampaignProgressCard
                                title={selectedCampaign.title}
                                description={selectedCampaign.description}
                                currentAmount={
                                    selectedCampaign.currentAmountCents
                                }
                                goalAmount={selectedCampaign.goalAmountCents}
                                totalDonations={selectedCampaign.totalDonations}
                                currency={selectedCampaign.currency}
                                endDate={
                                    selectedCampaign.endDate
                                        ? new Date(selectedCampaign.endDate)
                                        : undefined
                                }
                            />

                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Recent Donors
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {/* This would be populated with actual donor data */}
                                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        Anonymous Donor
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Just now
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">
                                                $25
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <DonationForm
                                campaignId={selectedCampaign.id}
                                campaignTitle={selectedCampaign.title}
                                onSuccess={handleDonationSuccess}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-full mx-auto px-4 py-16">
                    <div className="text-center">
                        <Heart className="h-16 w-16 mx-auto mb-4 text-white" />
                        <h1 className="text-4xl font-bold mb-4">
                            Support BRAC University Alumni Network
                        </h1>
                        <p className="text-xl mb-8 max-w-2xl mx-auto">
                            Your generosity helps us build a stronger community,
                            create opportunities, and support initiatives that
                            benefit thousands of BRACU alumni worldwide.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    ${(totalRaised / 100).toLocaleString()}
                                </div>
                                <div className="text-blue-100">
                                    Total Raised
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    {totalDonations.toLocaleString()}
                                </div>
                                <div className="text-blue-100">
                                    Total Donations
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    {activeCampaigns}
                                </div>
                                <div className="text-blue-100">
                                    Active Campaigns
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-full mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs
                                    value={filter}
                                    onValueChange={(value) =>
                                        setFilter(value as any)
                                    }
                                >
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="active">
                                            Active
                                        </TabsTrigger>
                                        <TabsTrigger value="ended">
                                            Ended
                                        </TabsTrigger>
                                        <TabsTrigger value="all">
                                            All
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {user && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>
                                        {user.role === "ADMIN"
                                            ? "Admin Actions"
                                            : "Get Involved"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {user.role === "ADMIN" ? (
                                        <Button className="w-full">
                                            <Link
                                                href="/admin/donations"
                                                className="flex items-center gap-2"
                                            >
                                                <Settings className="h-4 w-4" />
                                                Manage Campaigns
                                            </Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <CampaignProposalForm
                                                onSuccess={fetchCampaigns}
                                            />
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                <Link
                                                    href="/dashboard/donations"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Heart className="h-4 w-4" />
                                                    My Proposals
                                                </Link>
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Why Donate?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium">
                                            Community Impact
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Support initiatives that benefit
                                            thousands of alumni
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium">
                                            Tax Deductible
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            All donations are tax-deductible and
                                            come with receipts
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium">
                                            Flexible Giving
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Choose one-time or recurring
                                            donations
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <Card key={i} className="animate-pulse">
                                        <CardHeader>
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-2 bg-gray-200 rounded mb-4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : campaigns.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-medium mb-2">
                                        No campaigns found
                                    </h3>
                                    <p className="text-gray-600">
                                        {filter === "active"
                                            ? "There are currently no active fundraising campaigns."
                                            : "No campaigns match your filter criteria."}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {campaigns.map((campaign) => (
                                    <CampaignProgressCard
                                        key={campaign.id}
                                        title={campaign.title}
                                        description={campaign.description}
                                        currentAmount={
                                            campaign.currentAmountCents
                                        }
                                        goalAmount={campaign.goalAmountCents}
                                        totalDonations={campaign.totalDonations}
                                        currency={campaign.currency}
                                        endDate={
                                            campaign.endDate
                                                ? new Date(campaign.endDate)
                                                : undefined
                                        }
                                        className="cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() =>
                                            setSelectedCampaign(campaign)
                                        }
                                    >
                                        <div className="mt-4">
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCampaign(
                                                        campaign
                                                    );
                                                }}
                                                className="w-full"
                                            >
                                                <Heart className="h-4 w-4 mr-2" />
                                                Donate Now
                                            </Button>
                                        </div>
                                    </CampaignProgressCard>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
