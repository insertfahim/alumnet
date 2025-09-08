"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Calendar,
    DollarSign,
    FileText,
    ImageIcon,
    Send,
    Save,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface CampaignFormData {
    title: string;
    description: string;
    goalAmountCents: number;
    endDate: string;
    coverImage: string;
}

interface CampaignProposalFormProps {
    onSuccess?: () => void;
    existingCampaign?: any;
}

export function CampaignProposalForm({
    onSuccess,
    existingCampaign,
}: CampaignProposalFormProps) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CampaignFormData>({
        title: existingCampaign?.title || "",
        description: existingCampaign?.description || "",
        goalAmountCents: existingCampaign?.goalAmountCents || 0,
        endDate: existingCampaign?.endDate
            ? new Date(existingCampaign.endDate).toISOString().split("T")[0]
            : "",
        coverImage: existingCampaign?.coverImage || "",
    });

    const handleSubmit = async (isDraft: boolean = false) => {
        if (!user) {
            toast.error("Please log in to submit a proposal");
            return;
        }

        if (
            !formData.title.trim() ||
            !formData.description.trim() ||
            formData.goalAmountCents <= 0
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const endpoint = existingCampaign
                ? `/api/campaigns/${existingCampaign.id}`
                : "/api/campaigns";
            const method = existingCampaign ? "PUT" : "POST";

            const requestBody = {
                ...formData,
                goalAmountCents: Math.round(formData.goalAmountCents * 100), // Convert to cents
            };

            // For new campaigns, include isDraft parameter
            if (!existingCampaign) {
                (requestBody as any).isDraft = isDraft;
            } else {
                // For existing campaigns, determine status based on isDraft and current status
                if (isDraft || existingCampaign.status === "DRAFT") {
                    (requestBody as any).status = "DRAFT";
                } else {
                    // If submitting a draft, change status to PENDING (unless admin)
                    (requestBody as any).status =
                        user.role === "ADMIN" ? "APPROVED" : "PENDING";
                }
            }

            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const campaign = await response.json();
                const isUpdate = !!existingCampaign;
                const isSubmittingDraft =
                    isDraft ||
                    (existingCampaign?.status === "DRAFT" &&
                        !(requestBody as any).status);

                toast.success(
                    isUpdate
                        ? isSubmittingDraft
                            ? "Campaign draft updated!"
                            : user.role === "ADMIN"
                            ? "Campaign updated and approved!"
                            : "Campaign submitted for review!"
                        : isDraft
                        ? "Campaign saved as draft!"
                        : user.role === "ADMIN"
                        ? "Campaign created and approved!"
                        : "Campaign proposal submitted for review!"
                );

                setIsOpen(false);
                setFormData({
                    title: "",
                    description: "",
                    goalAmountCents: 0,
                    endDate: "",
                    coverImage: "",
                });

                if (onSuccess) {
                    onSuccess();
                }
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to submit proposal");
            }
        } catch (error) {
            console.error("Error submitting proposal:", error);
            toast.error("Failed to submit proposal");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    {existingCampaign
                        ? "Edit Campaign"
                        : "Propose New Campaign"}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {existingCampaign
                            ? "Edit Campaign Proposal"
                            : "Create Campaign Proposal"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900 mb-1">
                                    Campaign Proposal Process
                                </h4>
                                <p className="text-sm text-blue-700">
                                    {user?.role === "ADMIN"
                                        ? "As an admin, your campaigns will be automatically approved."
                                        : "Your proposal will be reviewed by administrators before going live. You can save drafts and edit them before submission."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label
                                htmlFor="title"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Campaign Title *
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Enter a compelling campaign title"
                                maxLength={100}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.title.length}/100 characters
                            </p>
                        </div>

                        <div>
                            <Label
                                htmlFor="description"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Description *
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Describe your campaign purpose, goals, and how the funds will be used..."
                                rows={5}
                                maxLength={1000}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.description.length}/1000 characters
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label
                                    htmlFor="goalAmount"
                                    className="flex items-center gap-2"
                                >
                                    <DollarSign className="h-4 w-4" />
                                    Goal Amount ($) *
                                </Label>
                                <Input
                                    id="goalAmount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={formData.goalAmountCents / 100}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            goalAmountCents:
                                                parseFloat(e.target.value) *
                                                    100 || 0,
                                        })
                                    }
                                    placeholder="5000"
                                    required
                                />
                            </div>

                            <div>
                                <Label
                                    htmlFor="endDate"
                                    className="flex items-center gap-2"
                                >
                                    <Calendar className="h-4 w-4" />
                                    End Date (Optional)
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            endDate: e.target.value,
                                        })
                                    }
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                        </div>

                        <div>
                            <Label
                                htmlFor="coverImage"
                                className="flex items-center gap-2"
                            >
                                <ImageIcon className="h-4 w-4" />
                                Cover Image URL (Optional)
                            </Label>
                            <Input
                                id="coverImage"
                                type="url"
                                value={formData.coverImage}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        coverImage: e.target.value,
                                    })
                                }
                                placeholder="https://example.com/your-image.jpg"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Add a compelling image to make your campaign
                                more engaging
                            </p>
                        </div>

                        {formData.coverImage && (
                            <div className="space-y-2">
                                <Label>Image Preview</Label>
                                <div className="border rounded-lg overflow-hidden">
                                    <img
                                        src={formData.coverImage}
                                        alt="Campaign preview"
                                        className="w-full h-32 object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => handleSubmit(true)}
                            disabled={isSubmitting}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save as Draft
                        </Button>
                        <Button
                            onClick={() => handleSubmit(false)}
                            disabled={isSubmitting}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {isSubmitting
                                ? "Submitting..."
                                : user?.role === "ADMIN"
                                ? "Create & Approve"
                                : "Submit for Review"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default CampaignProposalForm;
