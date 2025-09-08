import { NextRequest, NextResponse } from "next/server";

// Mock Stripe implementation
const mockStripe = {
    checkout: {
        sessions: {
            retrieve: async (sessionId: string, options?: any) => {
                console.log(
                    "Mock Stripe Session retrieved:",
                    sessionId,
                    options
                );
                return {
                    id: sessionId,
                    payment_status: "paid",
                    payment_intent: {
                        id: `pi_mock_${Date.now()}`,
                        status: "succeeded",
                    },
                    subscription: null,
                    metadata: {
                        donationId: "mock_donation_id_123",
                    },
                    amount_total: 5000,
                    currency: "usd",
                };
            },
        },
    },
};

const stripe = mockStripe;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.json(
                { error: "Session ID required" },
                { status: 400 }
            );
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["payment_intent", "subscription"],
        });

        if (!session) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }

        // Find the donation record
        const { prisma } = await import("@/lib/prisma");

        let donation = null;

        if (session.metadata?.donationId) {
            donation = await prisma.donation.findUnique({
                where: { id: session.metadata.donationId },
                include: {
                    campaign: {
                        select: {
                            title: true,
                        },
                    },
                    receipts: {
                        select: {
                            receiptNum: true,
                        },
                    },
                },
            });
        }

        if (!donation) {
            return NextResponse.json(
                { error: "Donation not found" },
                { status: 404 }
            );
        }

        // Update donation status if payment was successful
        if (session.payment_status === "paid") {
            await prisma.donation.update({
                where: { id: donation.id },
                data: {
                    status: "COMPLETED",
                    stripePaymentIntentId:
                        typeof session.payment_intent === "string"
                            ? session.payment_intent
                            : session.payment_intent?.id,
                    stripeSubscriptionId:
                        session.subscription &&
                        typeof session.subscription === "string"
                            ? session.subscription
                            : null,
                },
            });
        }

        return NextResponse.json({
            ...donation,
            sessionStatus: session.payment_status,
            amountCents: session.amount_total,
            currency: session.currency,
        });
    } catch (error) {
        console.error("Error verifying payment session:", error);
        return NextResponse.json(
            { error: "Failed to verify payment session" },
            { status: 500 }
        );
    }
}
