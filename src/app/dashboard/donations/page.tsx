"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Heart,
    Download,
    Calendar,
    CreditCard,
    TrendingUp,
    Receipt,
    AlertCircle,
    CheckCircle,
    Clock,
} from "lucide-react";
import { Donation, Receipt as ReceiptType } from "@/types";
import toast from "react-hot-toast";

interface DonationWithDetails extends Omit<Donation, "campaign"> {
    campaign?: {
        id: string;
        title: string;
    };
    receipts: ReceiptType[];
}

export default function DonationDashboard() {
    const { user } = useAuth();
    const [donations, setDonations] = useState<DonationWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        if (user) {
            fetchDonations();
        }
    }, [user, activeTab]);

    const fetchDonations = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/donations?status=${activeTab}`);
            if (response.ok) {
                const data = await response.json();
                setDonations(data.donations);
            }
        } catch (error) {
            console.error("Error fetching donations:", error);
            toast.error("Failed to load donations");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async (
        donationId: string,
        receiptNum: string
    ) => {
        try {
            // In a real implementation, this would download the PDF from S3
            // For now, we'll show a placeholder
            toast.success(`Receipt ${receiptNum} would be downloaded here`);
        } catch (error) {
            console.error("Error downloading receipt:", error);
            toast.error("Failed to download receipt");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "PENDING":
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case "FAILED":
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            case "CANCELLED":
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            "default" | "secondary" | "destructive" | "outline"
        > = {
            COMPLETED: "default",
            PENDING: "secondary",
            FAILED: "destructive",
            CANCELLED: "outline",
        };

        return (
            <Badge variant={variants[status] || "outline"}>
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </Badge>
        );
    };

    const formatCurrency = (amountCents: number, currency: string = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(amountCents / 100);
    };

    const totalDonated = donations
        .filter((d) => d.status === "COMPLETED")
        .reduce((sum, d) => sum + d.amountCents, 0);

    const recurringDonations = donations.filter((d) => d.recurring).length;
    const oneTimeDonations = donations.filter((d) => !d.recurring).length;

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center py-12">
                        <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-medium mb-2">
                            Sign In Required
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Please sign in to view your donation history.
                        </p>
                        <Link href="/login">
                            <Button>Sign In</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-full mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        My Donations
                    </h1>
                    <p className="text-gray-600">
                        Track your donation history and manage recurring
                        contributions
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <TrendingUp className="h-8 w-8 text-green-600" />
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Donated
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(totalDonated)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <Heart className="h-8 w-8 text-red-600" />
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Donations
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {donations.length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <CreditCard className="h-8 w-8 text-blue-600" />
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-600">
                                        Recurring
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {recurringDonations}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <Receipt className="h-8 w-8 text-purple-600" />
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-600">
                                        Tax Receipts
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            donations.filter(
                                                (d) => d.receipts.length > 0
                                            ).length
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Donations List */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Donation History</CardTitle>
                            <Link href="/donations">
                                <Button>
                                    <Heart className="h-4 w-4 mr-2" />
                                    Make Another Donation
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="mb-6">
                                <TabsTrigger value="all">
                                    All Donations
                                </TabsTrigger>
                                <TabsTrigger value="COMPLETED">
                                    Completed
                                </TabsTrigger>
                                <TabsTrigger value="PENDING">
                                    Pending
                                </TabsTrigger>
                                <TabsTrigger value="recurring">
                                    Recurring
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
                                                <div className="h-20 bg-gray-200 rounded-lg"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : donations.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                        <h3 className="text-xl font-medium mb-2">
                                            No donations found
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            You haven't made any donations yet.
                                            Every contribution makes a
                                            difference!
                                        </p>
                                        <Link href="/donations">
                                            <Button>Start Donating</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {donations.map((donation) => (
                                            <Card
                                                key={donation.id}
                                                className="p-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        {getStatusIcon(
                                                            donation.status
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium">
                                                                    {donation
                                                                        .campaign
                                                                        ?.title ||
                                                                        "General Donation"}
                                                                </h4>
                                                                {getStatusBadge(
                                                                    donation.status
                                                                )}
                                                                {donation.recurring && (
                                                                    <Badge variant="outline">
                                                                        Recurring
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                <Calendar className="h-3 w-3 inline mr-1" />
                                                                {new Date(
                                                                    donation.createdAt
                                                                ).toLocaleDateString()}
                                                                {donation.message && (
                                                                    <span className="ml-4">
                                                                        "
                                                                        {
                                                                            donation.message
                                                                        }
                                                                        "
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="font-bold text-lg">
                                                            {formatCurrency(
                                                                donation.amountCents,
                                                                donation.currency
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 mt-2">
                                                            {donation.receipts
                                                                .length > 0 && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleDownloadReceipt(
                                                                            donation.id,
                                                                            donation
                                                                                .receipts[0]
                                                                                .receiptNum
                                                                        )
                                                                    }
                                                                >
                                                                    <Download className="h-3 w-3 mr-1" />
                                                                    Receipt
                                                                </Button>
                                                            )}
                                                            {donation.recurring &&
                                                                donation.status ===
                                                                    "COMPLETED" && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                    >
                                                                        Manage
                                                                    </Button>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
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
