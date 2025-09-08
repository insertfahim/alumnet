"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthProvider";
import { loadStripe } from "@/lib/mock-stripe";
import { Heart, CreditCard, Shield, Clock } from "lucide-react";
import toast from "react-hot-toast";

const donationSchema = z.object({
    amount: z.number().min(1, "Amount must be at least $1"),
    currency: z.string().default("USD"),
    recurring: z.boolean().default(false),
    frequency: z.enum(["monthly", "quarterly", "yearly"]).optional(),
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    message: z.string().max(500, "Message too long").optional(),
    isAnonymous: z.boolean().default(false),
    campaignId: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationFormProps {
    campaignId?: string;
    campaignTitle?: string;
    onSuccess?: () => void;
    className?: string;
}

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function DonationForm({
    campaignId,
    campaignTitle,
    onSuccess,
    className = "",
}: DonationFormProps) {
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<DonationFormData>({
        resolver: zodResolver(donationSchema),
        defaultValues: {
            currency: "USD",
            recurring: false,
            isAnonymous: false,
            campaignId,
        },
    });

    const isRecurring = watch("recurring");
    const isAnonymous = watch("isAnonymous");

    const presetAmounts = [10, 25, 50, 100, 250, 500];

    const handlePresetAmount = (amount: number) => {
        setSelectedAmount(amount);
        setValue("amount", amount);
    };

    const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setSelectedAmount(null);
        setValue("amount", value);
    };

    const onSubmit = async (data: DonationFormData) => {
        try {
            setIsProcessing(true);

            // If user is authenticated, use their info
            if (user && !isAnonymous) {
                data.firstName = data.firstName || user.firstName;
                data.lastName = data.lastName || user.lastName;
                data.email = data.email || user.email;
            }

            // Convert amount to cents
            const amountCents = Math.round(data.amount * 100);

            // In development mode, skip Stripe and directly complete the donation
            if (process.env.NODE_ENV === "development") {
                // Create donation record
                const response = await fetch("/api/donations", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...data,
                        amountCents,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || "Failed to create donation");
                }

                const donation = await response.json();

                toast.success(
                    "Donation completed successfully! Thank you for your support."
                );
                onSuccess?.();
                return;
            }

            // Production flow with Stripe
            // Create donation record
            const response = await fetch("/api/donations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    amountCents,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create donation");
            }

            const donation = await response.json();

            // Initialize Stripe
            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error("Stripe failed to initialize");
            }

            // Create payment intent
            const paymentResponse = await fetch(
                "/api/payments/create-payment-intent",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        donationId: donation.id,
                        amount: amountCents,
                        currency: data.currency,
                        recurring: data.recurring,
                        frequency: data.frequency,
                    }),
                }
            );

            if (!paymentResponse.ok) {
                throw new Error("Failed to create payment intent");
            }

            const paymentData = await paymentResponse.json();

            // Redirect to Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: paymentData.sessionId,
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            toast.success("Redirecting to secure payment...");
            onSuccess?.();
        } catch (error) {
            console.error("Donation error:", error);
            toast.error(
                error instanceof Error ? error.message : "Donation failed"
            );
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Make a Donation
                </CardTitle>
                {campaignTitle && (
                    <p className="text-sm text-gray-600">
                        Supporting: {campaignTitle}
                    </p>
                )}
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Donation Amount */}
                    <div>
                        <Label className="text-base font-medium">
                            Donation Amount
                        </Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {presetAmounts.map((amount) => (
                                <Button
                                    key={amount}
                                    type="button"
                                    variant={
                                        selectedAmount === amount
                                            ? "default"
                                            : "outline"
                                    }
                                    className="h-12"
                                    onClick={() => handlePresetAmount(amount)}
                                >
                                    ${amount}
                                </Button>
                            ))}
                        </div>

                        <div className="mt-4">
                            <Label htmlFor="custom-amount">Custom Amount</Label>
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                    $
                                </span>
                                <Input
                                    id="custom-amount"
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="Enter amount"
                                    className="pl-8"
                                    {...register("amount", {
                                        valueAsNumber: true,
                                    })}
                                    onChange={handleCustomAmount}
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.amount.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Recurring Donation */}
                    <div>
                        <Label className="text-base font-medium">
                            Donation Type
                        </Label>
                        <RadioGroup
                            value={isRecurring ? "recurring" : "one-time"}
                            onValueChange={(value) =>
                                setValue("recurring", value === "recurring")
                            }
                            className="mt-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="one-time"
                                    id="one-time"
                                />
                                <Label
                                    htmlFor="one-time"
                                    className="flex items-center gap-2"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    One-time donation
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="recurring"
                                    id="recurring"
                                />
                                <Label
                                    htmlFor="recurring"
                                    className="flex items-center gap-2"
                                >
                                    <Clock className="h-4 w-4" />
                                    Recurring donation
                                </Label>
                            </div>
                        </RadioGroup>

                        {isRecurring && (
                            <div className="mt-3">
                                <Label>Frequency</Label>
                                <RadioGroup
                                    onValueChange={(value) =>
                                        setValue("frequency", value as any)
                                    }
                                    className="mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="monthly"
                                            id="monthly"
                                        />
                                        <Label htmlFor="monthly">Monthly</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="quarterly"
                                            id="quarterly"
                                        />
                                        <Label htmlFor="quarterly">
                                            Quarterly
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="yearly"
                                            id="yearly"
                                        />
                                        <Label htmlFor="yearly">Yearly</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        )}
                    </div>

                    {/* Personal Information */}
                    {(!user || isAnonymous) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    {...register("firstName")}
                                    placeholder="John"
                                />
                                {errors.firstName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    {...register("lastName")}
                                    placeholder="Doe"
                                />
                                {errors.lastName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.lastName.message}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="john@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Message */}
                    <div>
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                            id="message"
                            {...register("message")}
                            placeholder="Leave a message with your donation..."
                            rows={3}
                        />
                        {errors.message && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.message.message}
                            </p>
                        )}
                    </div>

                    {/* Anonymous Option */}
                    {user && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="anonymous"
                                checked={isAnonymous}
                                onCheckedChange={(checked) =>
                                    setValue("isAnonymous", checked as boolean)
                                }
                            />
                            <Label htmlFor="anonymous" className="text-sm">
                                Make this donation anonymous
                            </Label>
                        </div>
                    )}

                    {/* Security Notice */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium">Secure Payment</p>
                                <p>
                                    Your donation is processed securely through
                                    Stripe. We never store your payment
                                    information.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full h-12 text-lg"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Heart className="h-5 w-5 mr-2" />
                                Donate ${watch("amount") || 0}
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
