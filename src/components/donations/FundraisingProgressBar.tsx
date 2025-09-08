"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FundraisingProgressBarProps {
    currentAmount: number;
    goalAmount: number;
    currency?: string;
    showPercentage?: boolean;
    showAmounts?: boolean;
    className?: string;
}

export function FundraisingProgressBar({
    currentAmount,
    goalAmount,
    currency = "USD",
    showPercentage = true,
    showAmounts = true,
    className = "",
}: FundraisingProgressBarProps) {
    const progress =
        goalAmount > 0 ? Math.min((currentAmount / goalAmount) * 100, 100) : 0;
    const remaining = goalAmount - currentAmount;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(amount / 100); // Convert cents to dollars
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {showAmounts && (
                <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatCurrency(currentAmount)} raised</span>
                    <span>{formatCurrency(goalAmount)} goal</span>
                </div>
            )}

            <Progress value={progress} className="h-3" />

            <div className="flex justify-between items-center text-xs text-gray-500">
                {showPercentage && <span>{progress.toFixed(1)}% funded</span>}
                {remaining > 0 && (
                    <span>{formatCurrency(remaining)} to go</span>
                )}
                {remaining <= 0 && progress >= 100 && (
                    <span className="text-green-600 font-medium">
                        Goal reached! 🎉
                    </span>
                )}
            </div>
        </div>
    );
}

interface CampaignProgressCardProps {
    title: string;
    description?: string;
    currentAmount: number;
    goalAmount: number;
    totalDonations: number;
    currency?: string;
    endDate?: Date;
    className?: string;
    onClick?: () => void;
    children?: React.ReactNode;
}

export function CampaignProgressCard({
    title,
    description,
    currentAmount,
    goalAmount,
    totalDonations,
    currency = "USD",
    endDate,
    className = "",
    onClick,
    children,
}: CampaignProgressCardProps) {
    const progress =
        goalAmount > 0 ? Math.min((currentAmount / goalAmount) * 100, 100) : 0;
    const isEnded = endDate && new Date() > endDate;
    const daysLeft = endDate
        ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(amount / 100);
    };

    return (
        <Card
            className={`${className} ${
                onClick
                    ? "cursor-pointer hover:shadow-lg transition-shadow"
                    : ""
            }`}
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {description}
                    </p>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                <FundraisingProgressBar
                    currentAmount={currentAmount}
                    goalAmount={goalAmount}
                    currency={currency}
                />

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-gray-500">Total Donations</div>
                        <div className="font-semibold">{totalDonations}</div>
                    </div>

                    {daysLeft !== null && !isEnded && (
                        <div>
                            <div className="text-gray-500">Days Left</div>
                            <div className="font-semibold">
                                {daysLeft > 0 ? daysLeft : "Ended"}
                            </div>
                        </div>
                    )}

                    {isEnded && (
                        <div>
                            <div className="text-gray-500">Status</div>
                            <div className="font-semibold text-orange-600">
                                Campaign Ended
                            </div>
                        </div>
                    )}
                </div>

                {progress >= 100 && (
                    <div className="text-center py-2 bg-green-50 rounded-lg">
                        <span className="text-green-700 font-medium text-sm">
                            🎉 Goal Achieved! Thank you to all donors.
                        </span>
                    </div>
                )}

                {children}
            </CardContent>
        </Card>
    );
}
