import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Mock Stripe implementation
const mockStripe = {
    paymentIntents: {
        create: async (options: any) => {
            console.log("Mock Stripe PaymentIntent created:", options);
            return {
                id: `pi_mock_${Date.now()}`,
                client_secret: `pi_mock_${Date.now()}_secret_mock`,
                status: "requires_payment_method",
                amount: options.amount,
                currency: options.currency,
            };
        },
    },
    checkout: {
        sessions: {
            create: async (options: any) => {
                console.log("Mock Stripe Checkout Session created:", options);
                return {
                    id: `cs_mock_${Date.now()}`,
                    url: `https://checkout.stripe.com/mock/session/${Date.now()}`,
                };
            },
        },
    },
};

const stripe = mockStripe;

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        const body = await request.json();
        const { donationId, amount, currency, recurring, frequency } = body;

        if (!donationId || !amount || !currency) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify donation exists and belongs to user
        const donation = await prisma.donation.findUnique({
            where: { id: donationId },
            include: { user: true },
        });

        if (!donation) {
            return NextResponse.json(
                { error: "Donation not found" },
                { status: 404 }
            );
        }

        // Check if user owns this donation (if authenticated)
        let authenticatedUser = null;
        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            if (decoded) {
                authenticatedUser = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                });
                if (
                    authenticatedUser &&
                    donation.userId !== authenticatedUser.id
                ) {
                    return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 403 }
                    );
                }
            }
        }

        // For recurring donations, create a subscription
        if (recurring) {
            const priceData = getRecurringPriceData(
                amount,
                currency,
                frequency
            );

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: priceData,
                        quantity: 1,
                    },
                ],
                mode: "subscription",
                success_url: `${process.env.NEXTAUTH_URL}/donations/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXTAUTH_URL}/donations/cancelled`,
                metadata: {
                    donationId,
                    recurring: "true",
                    frequency,
                },
                customer_email: donation.email || undefined,
            });

            // Update donation with subscription placeholder
            await prisma.donation.update({
                where: { id: donationId },
                data: {
                    stripeSubscriptionId: `pending_${session.id}`,
                },
            });

            return NextResponse.json({ sessionId: session.id });
        } else {
            // For one-time donations, create payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: currency.toLowerCase(),
                metadata: {
                    donationId,
                    recurring: "false",
                },
                receipt_email: donation.email || undefined,
            });

            // Update donation with payment intent ID
            await prisma.donation.update({
                where: { id: donationId },
                data: {
                    stripePaymentIntentId: paymentIntent.id,
                },
            });

            return NextResponse.json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            });
        }
    } catch (error) {
        console.error("Error creating payment intent:", error);
        return NextResponse.json(
            { error: "Failed to create payment intent" },
            { status: 500 }
        );
    }
}

function getRecurringPriceData(
    amount: number,
    currency: string,
    frequency: string
) {
    const interval =
        frequency === "quarterly"
            ? "month"
            : frequency === "yearly"
            ? "year"
            : "month";
    const intervalCount = frequency === "quarterly" ? 3 : 1;

    return {
        currency: currency.toLowerCase(),
        product_data: {
            name: `Recurring Donation - ${
                frequency.charAt(0).toUpperCase() + frequency.slice(1)
            }`,
            description: `Recurring donation of ${(amount / 100).toLocaleString(
                "en-US",
                {
                    style: "currency",
                    currency,
                }
            )} ${frequency}`,
        },
        unit_amount: amount,
        recurring: {
            interval: interval as "month" | "year",
            interval_count: intervalCount,
        },
    };
}
