"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Heart, Home, RefreshCw } from "lucide-react";

export default function DonationCancelledPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-16">
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <XCircle className="h-16 w-16 text-orange-600" />
                        </div>
                        <CardTitle className="text-2xl text-orange-700">
                            Donation Cancelled
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <p className="text-lg text-gray-700 mb-2">
                                Your donation was cancelled.
                            </p>
                            <p className="text-gray-600">
                                No charges have been made to your account. You
                                can try again whenever you're ready to support
                                our cause.
                            </p>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Heart className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-orange-800">
                                        Your support matters
                                    </h4>
                                    <p className="text-sm text-orange-700 mt-1">
                                        Even small contributions can make a big
                                        difference in supporting BRAC University
                                        alumni initiatives worldwide.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button asChild className="flex-1">
                                <Link href="/donations">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try Again
                                </Link>
                            </Button>

                            <Button
                                variant="outline"
                                asChild
                                className="flex-1"
                            >
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
                                <strong>Have questions?</strong> Contact our
                                support team at{" "}
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
