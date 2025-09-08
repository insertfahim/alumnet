"use client";

import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyProgressData {
    month: string;
    amount: number;
    donations: number;
}

interface DonationChartsProps {
    monthlyData: MonthlyProgressData[];
    totalRaised: number;
    totalDonations: number;
    averageDonation: number;
    currency?: string;
    className?: string;
}

export function DonationCharts({
    monthlyData,
    totalRaised,
    totalDonations,
    averageDonation,
    currency = "USD",
    className = "",
}: DonationChartsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(amount);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{label}</p>
                    <p className="text-blue-600">
                        Amount: {formatCurrency(payload[0].value)}
                    </p>
                    {payload[0].payload.donations && (
                        <p className="text-gray-600">
                            Donations: {payload[0].payload.donations}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
            {/* Monthly Progress Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Monthly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                                activeDot={{
                                    r: 6,
                                    stroke: "#3b82f6",
                                    strokeWidth: 2,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Campaign Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <div>
                                <div className="text-sm text-gray-600">
                                    Total Raised
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(totalRaised)}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <div>
                                <div className="text-sm text-gray-600">
                                    Total Donations
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {totalDonations}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <div>
                                <div className="text-sm text-gray-600">
                                    Average Donation
                                </div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(averageDonation)}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

interface DonationBreakdownProps {
    data: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    title: string;
    className?: string;
}

export function DonationBreakdownChart({
    data,
    title,
    className = "",
}: DonationBreakdownProps) {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-blue-600">
                        Amount:{" "}
                        {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                        }).format(data.value)}
                    </p>
                    <p className="text-gray-600">
                        {data.percentage?.toFixed(1)}% of total
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) =>
                                `${name}: ${percentage?.toFixed(1)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
