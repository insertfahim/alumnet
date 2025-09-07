"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle2,
    X,
    AlertCircle,
    Eye,
    User,
    Calendar,
    GraduationCap,
} from "lucide-react";
import VerifiedBadge from "../verification/VerifiedBadge";

interface Verification {
    id: string;
    graduationProofUrl: string;
    documentType: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
    verifiedAt?: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        graduationYear: number;
        degree: string;
        major: string;
        isVerified: boolean;
    };
    verifiedBy?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function VerificationManager() {
    const [verifications, setVerifications] = useState<Verification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedVerification, setSelectedVerification] =
        useState<Verification | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        fetchVerifications();
    }, [filter, page]);

    const fetchVerifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `/api/admin/verifications?status=${filter}&page=${page}&limit=10`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch verifications");
            }

            const data = await response.json();
            setVerifications(data.verifications);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error("Error fetching verifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateVerificationStatus = async (
        verificationId: string,
        status: "APPROVED" | "REJECTED",
        reason?: string
    ) => {
        setProcessing(verificationId);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/admin/verifications", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    verificationId,
                    status,
                    rejectionReason: reason,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update verification");
            }

            // Refresh the list
            await fetchVerifications();
            setSelectedVerification(null);
            setRejectionReason("");
        } catch (error) {
            console.error("Error updating verification:", error);
        } finally {
            setProcessing(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <span className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Pending
                    </span>
                );
            case "APPROVED":
                return (
                    <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approved
                    </span>
                );
            case "REJECTED":
                return (
                    <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full text-sm">
                        <X className="w-4 h-4 mr-1" />
                        Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    Profile Verifications
                </h2>

                {/* Filter */}
                <select
                    value={filter}
                    onChange={(e) => {
                        setFilter(e.target.value);
                        setPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Verifications List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {verifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No verifications found for the selected filter.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {verifications.map((verification) => (
                            <div
                                key={verification.id}
                                className="p-6 hover:bg-gray-50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-5 h-5 text-gray-400" />
                                                <span className="font-medium text-gray-900">
                                                    {
                                                        verification.user
                                                            .firstName
                                                    }{" "}
                                                    {verification.user.lastName}
                                                </span>
                                                <VerifiedBadge
                                                    isVerified={
                                                        verification.user
                                                            .isVerified
                                                    }
                                                    size="sm"
                                                />
                                            </div>
                                            {getStatusBadge(
                                                verification.status
                                            )}
                                        </div>

                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div className="flex items-center space-x-4">
                                                <span>
                                                    {verification.user.email}
                                                </span>
                                                <span className="flex items-center">
                                                    <GraduationCap className="w-4 h-4 mr-1" />
                                                    {verification.user.degree}{" "}
                                                    in {verification.user.major}
                                                </span>
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {
                                                        verification.user
                                                            .graduationYear
                                                    }
                                                </span>
                                            </div>
                                            <div>
                                                Document Type:{" "}
                                                {verification.documentType
                                                    .replace("_", " ")
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                Submitted:{" "}
                                                {new Date(
                                                    verification.createdAt
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {verification.status === "REJECTED" &&
                                            verification.rejectionReason && (
                                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                                    <strong>
                                                        Rejection Reason:
                                                    </strong>{" "}
                                                    {
                                                        verification.rejectionReason
                                                    }
                                                </div>
                                            )}

                                        {verification.verifiedBy &&
                                            verification.verifiedAt && (
                                                <div className="mt-2 text-sm text-gray-500">
                                                    Verified by{" "}
                                                    {
                                                        verification.verifiedBy
                                                            .firstName
                                                    }{" "}
                                                    {
                                                        verification.verifiedBy
                                                            .lastName
                                                    }{" "}
                                                    on{" "}
                                                    {new Date(
                                                        verification.verifiedAt
                                                    ).toLocaleDateString()}
                                                </div>
                                            )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                setSelectedVerification(
                                                    verification
                                                )
                                            }
                                            className="flex items-center px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Review
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Review Modal */}
            {selectedVerification && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Review Verification -{" "}
                                    {selectedVerification.user.firstName}{" "}
                                    {selectedVerification.user.lastName}
                                </h3>
                                <button
                                    onClick={() =>
                                        setSelectedVerification(null)
                                    }
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* User Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <strong>Email:</strong>{" "}
                                    {selectedVerification.user.email}
                                </div>
                                <div>
                                    <strong>Graduation Year:</strong>{" "}
                                    {selectedVerification.user.graduationYear}
                                </div>
                                <div>
                                    <strong>Degree:</strong>{" "}
                                    {selectedVerification.user.degree}
                                </div>
                                <div>
                                    <strong>Major:</strong>{" "}
                                    {selectedVerification.user.major}
                                </div>
                            </div>

                            {/* Document */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">
                                    Submitted Document (
                                    {selectedVerification.documentType.replace(
                                        "_",
                                        " "
                                    )}
                                    )
                                </h4>
                                <img
                                    src={
                                        selectedVerification.graduationProofUrl
                                    }
                                    alt="Graduation Proof"
                                    className="w-full max-w-2xl border rounded-lg"
                                />
                            </div>

                            {/* Rejection Reason Input */}
                            {selectedVerification.status === "PENDING" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rejection Reason (optional)
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) =>
                                            setRejectionReason(e.target.value)
                                        }
                                        placeholder="Enter reason for rejection if applicable..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedVerification.status === "PENDING" && (
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() =>
                                            updateVerificationStatus(
                                                selectedVerification.id,
                                                "REJECTED",
                                                rejectionReason
                                            )
                                        }
                                        disabled={
                                            processing ===
                                            selectedVerification.id
                                        }
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {processing ===
                                        selectedVerification.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        ) : (
                                            <X className="w-4 h-4 mr-2" />
                                        )}
                                        Reject
                                    </button>
                                    <button
                                        onClick={() =>
                                            updateVerificationStatus(
                                                selectedVerification.id,
                                                "APPROVED"
                                            )
                                        }
                                        disabled={
                                            processing ===
                                            selectedVerification.id
                                        }
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {processing ===
                                        selectedVerification.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                        )}
                                        Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
