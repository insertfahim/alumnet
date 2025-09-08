import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
});

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
                    stripePaymentIntentId: session.payment_intent as string,
                    ...(session.subscription && {
                        stripeSubscriptionId: session.subscription as string,
                    }),
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
