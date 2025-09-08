"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Edit,
    Trash2,
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    Eye,
} from "lucide-react";
import { FundraisingCampaign } from "@/types";
import toast from "react-hot-toast";

interface CampaignFormData {
    title: string;
    description: string;
    goalAmountCents: number;
    endDate?: string;
    coverImage?: string;
}

export default function AdminDonationsPage() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] =
        useState<FundraisingCampaign | null>(null);
    const [formData, setFormData] = useState<CampaignFormData>({
        title: "",
        description: "",
        goalAmountCents: 0,
        endDate: "",
        coverImage: "",
    });

    useEffect(() => {
        if (user?.role === "ADMIN") {
            fetchCampaigns();
        }
    }, [user]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/campaigns");
            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.campaigns);
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            toast.error("Failed to load campaigns");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingCampaign
                ? `/api/campaigns/${editingCampaign.id}`
                : "/api/campaigns";

            const method = editingCampaign ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save campaign");
            }

            toast.success(
                editingCampaign
                    ? "Campaign updated successfully"
                    : "Campaign created successfully"
            );

            setIsCreateDialogOpen(false);
            setEditingCampaign(null);
            resetForm();
            fetchCampaigns();
        } catch (error) {
            console.error("Error saving campaign:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to save campaign"
            );
        }
    };

    const handleEdit = (campaign: FundraisingCampaign) => {
        setEditingCampaign(campaign);
        setFormData({
            title: campaign.title,
            description: campaign.description,
            goalAmountCents: campaign.goalAmountCents,
            endDate: campaign.endDate
                ? new Date(campaign.endDate).toISOString().split("T")[0]
                : "",
            coverImage: campaign.coverImage || "",
        });
        setIsCreateDialogOpen(true);
    };

    const handleDelete = async (campaignId: string) => {
        if (!confirm("Are you sure you want to delete this campaign?")) {
            return;
        }

        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete campaign");
            }

            toast.success("Campaign deleted successfully");
            fetchCampaigns();
        } catch (error) {
            console.error("Error deleting campaign:", error);
            toast.error("Failed to delete campaign");
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            goalAmountCents: 0,
            endDate: "",
            coverImage: "",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount / 100);
    };

    if (user?.role !== "ADMIN") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center py-12">
                        <div className="text-6xl mb-4">🚫</div>
                        <h3 className="text-xl font-medium mb-2">
                            Access Denied
                        </h3>
                        <p className="text-gray-600">
                            You don't have permission to access this page.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalRaised = campaigns.reduce(
        (sum, campaign) => sum + campaign.currentAmountCents,
        0
    );
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c) => c.isActive).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Fundraising Campaigns
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage and track all fundraising campaigns
                        </p>
                    </div>

                    <Dialog
                        open={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => {
                                    setEditingCampaign(null);
                                    resetForm();
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Campaign
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCampaign
                                        ? "Edit Campaign"
                                        : "Create New Campaign"}
                                </DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="title">
                                        Campaign Title
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                title: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter campaign title"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        placeholder="Describe the campaign purpose and goals"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="goalAmount">
                                            Goal Amount ($)
                                        </Label>
                                        <Input
                                            id="goalAmount"
                                            type="number"
                                            min="1"
                                            value={
                                                formData.goalAmountCents / 100
                                            }
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    goalAmountCents:
                                                        parseFloat(
                                                            e.target.value
                                                        ) * 100 || 0,
                                                }))
                                            }
                                            placeholder="5000"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="endDate">
                                            End Date (Optional)
                                        </Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    endDate: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="coverImage">
                                        Cover Image URL (Optional)
                                    </Label>
                                    <Input
                                        id="coverImage"
                                        value={formData.coverImage}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                coverImage: e.target.value,
                                            }))
                                        }
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateDialogOpen(false);
                                            setEditingCampaign(null);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingCampaign
                                            ? "Update Campaign"
                                            : "Create Campaign"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <DollarSign className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Raised
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {formatCurrency(totalRaised)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Campaigns
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {totalCampaigns}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">
                                        Active Campaigns
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {activeCampaigns}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Campaigns Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Campaigns</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        ) : campaigns.length === 0 ? (
                            <div className="text-center py-12">
                                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-xl font-medium mb-2">
                                    No campaigns yet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Create your first fundraising campaign to
                                    get started.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Goal</TableHead>
                                        <TableHead>Raised</TableHead>
                                        <TableHead>Progress</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {campaigns.map((campaign) => {
                                        const progress =
                                            campaign.goalAmountCents > 0
                                                ? Math.min(
                                                      (campaign.currentAmountCents /
                                                          campaign.goalAmountCents) *
                                                          100,
                                                      100
                                                  )
                                                : 0;

                                        return (
                                            <TableRow key={campaign.id}>
                                                <TableCell className="font-medium">
                                                    {campaign.title}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        campaign.goalAmountCents
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        campaign.currentAmountCents
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${progress}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm">
                                                            {progress.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            campaign.isActive
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                    >
                                                        {campaign.isActive
                                                            ? "Active"
                                                            : "Ended"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {campaign.endDate
                                                        ? new Date(
                                                              campaign.endDate
                                                          ).toLocaleDateString()
                                                        : "No end date"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    campaign
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    campaign.id
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
