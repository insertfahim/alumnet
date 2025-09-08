"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    User,
    DollarSign,
    Calendar,
    FileText,
    AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Campaign {
    id: string;
    title: string;
    description: string;
    goalAmountCents: number;
    endDate?: string;
    coverImage?: string;
    status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
    organizer: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    approvedAt?: string;
    approvedBy?: string;
}

export function CampaignProposalManager() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
        null
    );
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (user?.role === "ADMIN") {
            fetchCampaigns();
        }
    }, [user, activeTab]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/campaigns?status=${activeTab}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.campaigns);
            } else {
                toast.error("Failed to fetch campaigns");
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            toast.error("Failed to load campaigns");
        } finally {
            setLoading(false);
        }
    };

    const handleCampaignAction = async (
        campaignId: string,
        action: "approve" | "reject"
    ) => {
        if (action === "reject" && !rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        setActionLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `/api/campaigns/${campaignId}/approve`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        action,
                        rejectionReason:
                            action === "reject" ? rejectionReason : undefined,
                    }),
                }
            );

            if (response.ok) {
                toast.success(`Campaign ${action}d successfully`);
                setReviewDialogOpen(false);
                setSelectedCampaign(null);
                setRejectionReason("");
                fetchCampaigns();
            } else {
                const error = await response.json();
                toast.error(error.error || `Failed to ${action} campaign`);
            }
        } catch (error) {
            console.error(`Error ${action}ing campaign:`, error);
            toast.error(`Failed to ${action} campaign`);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                    >
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case "APPROVED":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                    >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            case "DRAFT":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800"
                    >
                        <FileText className="h-3 w-3 mr-1" />
                        Draft
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatCurrency = (amountCents: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amountCents / 100);
    };

    if (user?.role !== "ADMIN") {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">🚫</div>
                    <h3 className="text-xl font-medium mb-2">Access Denied</h3>
                    <p className="text-gray-600">
                        You need admin privileges to access this page.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Campaign Proposal Management
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger
                                value="pending"
                                className="flex items-center gap-2"
                            >
                                <Clock className="h-4 w-4" />
                                Pending Review
                            </TabsTrigger>
                            <TabsTrigger
                                value="approved"
                                className="flex items-center gap-2"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Approved
                            </TabsTrigger>
                            <TabsTrigger
                                value="rejected"
                                className="flex items-center gap-2"
                            >
                                <XCircle className="h-4 w-4" />
                                Rejected
                            </TabsTrigger>
                            <TabsTrigger
                                value="draft"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Drafts
                            </TabsTrigger>
                            <TabsTrigger
                                value="all"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                All
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab}>
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-16 bg-gray-200 rounded-lg"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : campaigns.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-medium mb-2">
                                        No campaigns found
                                    </h3>
                                    <p className="text-gray-600">
                                        No campaigns with "{activeTab}" status.
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Campaign</TableHead>
                                            <TableHead>Organizer</TableHead>
                                            <TableHead>Goal</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {campaigns.map((campaign) => (
                                            <TableRow key={campaign.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {campaign.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                                            {
                                                                campaign.description
                                                            }
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        {
                                                            campaign.organizer
                                                                .firstName
                                                        }{" "}
                                                        {
                                                            campaign.organizer
                                                                .lastName
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        campaign.goalAmountCents
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(
                                                        campaign.status
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        campaign.createdAt
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedCampaign(
                                                                    campaign
                                                                );
                                                                setReviewDialogOpen(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            Review
                                                        </Button>
                                                        {campaign.status ===
                                                            "PENDING" && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleCampaignAction(
                                                                            campaign.id,
                                                                            "approve"
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        actionLoading
                                                                    }
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Approve
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Review Campaign Proposal
                        </DialogTitle>
                    </DialogHeader>

                    {selectedCampaign && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">
                                        Status
                                    </Label>
                                    <div className="mt-1">
                                        {getStatusBadge(
                                            selectedCampaign.status
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">
                                        Organizer
                                    </Label>
                                    <p className="mt-1">
                                        {selectedCampaign.organizer.firstName}{" "}
                                        {selectedCampaign.organizer.lastName}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-600">
                                    Campaign Title
                                </Label>
                                <h3 className="text-xl font-semibold mt-1">
                                    {selectedCampaign.title}
                                </h3>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-600">
                                    Description
                                </Label>
                                <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                                    <p className="whitespace-pre-wrap">
                                        {selectedCampaign.description}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Goal Amount
                                    </Label>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        {formatCurrency(
                                            selectedCampaign.goalAmountCents
                                        )}
                                    </p>
                                </div>
                                {selectedCampaign.endDate && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            End Date
                                        </Label>
                                        <p className="mt-1">
                                            {new Date(
                                                selectedCampaign.endDate
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedCampaign.coverImage && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">
                                        Cover Image
                                    </Label>
                                    <div className="mt-1 border rounded-lg overflow-hidden">
                                        <img
                                            src={selectedCampaign.coverImage}
                                            alt="Campaign cover"
                                            className="w-full h-48 object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedCampaign.status === "REJECTED" &&
                                selectedCampaign.rejectionReason && (
                                    <div>
                                        <Label className="text-sm font-medium text-red-600 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Rejection Reason
                                        </Label>
                                        <div className="mt-1 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-red-800">
                                                {
                                                    selectedCampaign.rejectionReason
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {selectedCampaign.status === "PENDING" && (
                                <div className="border-t pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="rejectionReason">
                                                Rejection Reason (Required for
                                                rejection)
                                            </Label>
                                            <Textarea
                                                id="rejectionReason"
                                                value={rejectionReason}
                                                onChange={(e) =>
                                                    setRejectionReason(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Provide a clear reason for rejection..."
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="destructive"
                                                onClick={() =>
                                                    handleCampaignAction(
                                                        selectedCampaign.id,
                                                        "reject"
                                                    )
                                                }
                                                disabled={actionLoading}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                {actionLoading
                                                    ? "Rejecting..."
                                                    : "Reject"}
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    handleCampaignAction(
                                                        selectedCampaign.id,
                                                        "approve"
                                                    )
                                                }
                                                disabled={actionLoading}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                {actionLoading
                                                    ? "Approving..."
                                                    : "Approve"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CampaignProposalManager;
