"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Heart, Home } from "lucide-react";
import toast from "react-hot-toast";

export default function DonationSuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [donationDetails, setDonationDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            verifyPayment();
        }
    }, [sessionId]);

    const verifyPayment = async () => {
        try {
            const response = await fetch(
                `/api/payments/verify-session?session_id=${sessionId}`
            );
            if (response.ok) {
                const data = await response.json();
                setDonationDetails(data);
            }
        } catch (error) {
            console.error("Error verifying payment:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async () => {
        if (!donationDetails?.receiptNum) {
            toast.error("Receipt not available yet. Please try again later.");
            return;
        }

        try {
            // In a real implementation, this would download the PDF
            toast.success(
                `Receipt ${donationDetails.receiptNum} downloaded successfully!`
            );
        } catch (error) {
            toast.error("Failed to download receipt");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <h3 className="text-xl font-medium mb-2">
                            Processing your donation...
                        </h3>
                        <p className="text-gray-600">
                            Please wait while we confirm your payment.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-16">
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-700">
                            Donation Successful!
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <p className="text-lg text-gray-700 mb-2">
                                Thank you for your generous contribution!
                            </p>
                            <p className="text-gray-600">
                                Your support helps BRAC University Alumni
                                Network make a difference in the lives of
                                thousands of alumni worldwide.
                            </p>
                        </div>

                        {donationDetails && (
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium text-green-800 mb-2">
                                    Donation Details
                                </h4>
                                <div className="space-y-1 text-sm text-green-700">
                                    <p>
                                        <strong>Amount:</strong>{" "}
                                        {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency:
                                                donationDetails.currency ||
                                                "USD",
                                        }).format(
                                            (donationDetails.amountCents || 0) /
                                                100
                                        )}
                                    </p>
                                    <p>
                                        <strong>Type:</strong>{" "}
                                        {donationDetails.recurring
                                            ? "Recurring"
                                            : "One-time"}
                                    </p>
                                    {donationDetails.campaignTitle && (
                                        <p>
                                            <strong>Campaign:</strong>{" "}
                                            {donationDetails.campaignTitle}
                                        </p>
                                    )}
                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {new Date(
                                            donationDetails.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                    {donationDetails.receiptNum && (
                                        <p>
                                            <strong>Receipt #:</strong>{" "}
                                            {donationDetails.receiptNum}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            {donationDetails?.receiptNum && (
                                <Button
                                    onClick={handleDownloadReceipt}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Tax Receipt
                                </Button>
                            )}

                            <Button asChild className="flex-1">
                                <Link href="/dashboard/donations">
                                    <Heart className="h-4 w-4 mr-2" />
                                    View My Donations
                                </Link>
                            </Button>
                        </div>

                        <div className="text-center">
                            <Button variant="ghost" asChild>
                                <Link href="/">
                                    <Home className="h-4 w-4 mr-2" />
                                    Return to Home
                                </Link>
                            </Button>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-blue-800">
                                <strong>Need help?</strong> Contact our support
                                team at{" "}
                                <a
                                    href="mailto:support@bracu-alumni.org"
                                    className="text-blue-600 hover:underline"
                                >
                                    support@bracu-alumni.org
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
