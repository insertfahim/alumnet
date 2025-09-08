import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateAndSaveReceipt } from "@/lib/receipt-generator";

// Mock Stripe implementation
const mockStripe = {
    webhooks: {
        constructEvent: (body: string, signature: string, secret: string) => {
            console.log("Mock Stripe webhook event constructed");
            // Return a mock event
            return {
                id: `evt_mock_${Date.now()}`,
                type: "payment_intent.succeeded",
                data: {
                    object: {
                        id: `pi_mock_${Date.now()}`,
                        amount: 5000, // $50.00
                        currency: "usd",
                        metadata: {
                            donationId: "mock_donation_id",
                        },
                    },
                },
            };
        },
    },
};

const stripe = mockStripe;
const endpointSecret =
    process.env.STRIPE_WEBHOOK_SECRET || "mock_webhook_secret";

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const headersList = await headers();
        const signature = headersList.get("stripe-signature");

        if (!signature) {
            return NextResponse.json(
                { error: "No signature provided" },
                { status: 400 }
            );
        }

        let event: any;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                endpointSecret
            );
        } catch (err: any) {
            console.error(
                "Webhook signature verification failed:",
                err.message
            );
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        switch (event.type) {
            case "payment_intent.succeeded":
                await handlePaymentIntentSucceeded(event.data.object as any);
                break;

            case "payment_intent.payment_failed":
                await handlePaymentIntentFailed(event.data.object as any);
                break;

            case "customer.subscription.created":
                await handleSubscriptionCreated(event.data.object as any);
                break;

            case "customer.subscription.updated":
                await handleSubscriptionUpdated(event.data.object as any);
                break;

            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(event.data.object as any);
                break;

            case "invoice.payment_succeeded":
                await handleInvoicePaymentSucceeded(event.data.object as any);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
    try {
        // Find donation by payment intent ID
        const donation = await prisma.donation.findUnique({
            where: { stripePaymentIntentId: paymentIntent.id },
            include: { campaign: true },
        });

        if (!donation) {
            console.error(
                "Donation not found for payment intent:",
                paymentIntent.id
            );
            return;
        }

        // Update donation status
        await prisma.donation.update({
            where: { id: donation.id },
            data: { status: "COMPLETED" },
        });

        // Update campaign current amount if it's a campaign donation
        if (donation.campaignId) {
            await prisma.fundraisingCampaign.update({
                where: { id: donation.campaignId },
                data: {
                    currentAmountCents: {
                        increment: donation.amountCents,
                    },
                },
            });
        }

        // Generate tax receipt for completed donation
        try {
            await generateAndSaveReceipt(donation.id);
        } catch (receiptError) {
            console.error("Error generating receipt:", receiptError);
            // Don't fail the webhook for receipt generation errors
        }

        console.log("Payment succeeded for donation:", donation.id);
    } catch (error) {
        console.error("Error handling payment success:", error);
    }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
    try {
        const donation = await prisma.donation.findUnique({
            where: { stripePaymentIntentId: paymentIntent.id },
        });

        if (donation) {
            await prisma.donation.update({
                where: { id: donation.id },
                data: { status: "FAILED" },
            });
            console.log("Payment failed for donation:", donation.id);
        }
    } catch (error) {
        console.error("Error handling payment failure:", error);
    }
}

async function handleSubscriptionCreated(subscription: any) {
    try {
        // Find donation by subscription ID
        const donation = await prisma.donation.findUnique({
            where: { stripeSubscriptionId: subscription.id },
        });

        if (donation) {
            // Mark as completed since subscription was created successfully
            await prisma.donation.update({
                where: { id: donation.id },
                data: { status: "COMPLETED" },
            });

            if (donation.campaignId) {
                await prisma.fundraisingCampaign.update({
                    where: { id: donation.campaignId },
                    data: {
                        currentAmountCents: {
                            increment: donation.amountCents,
                        },
                    },
                });
            }

            console.log("Subscription created for donation:", donation.id);
        }
    } catch (error) {
        console.error("Error handling subscription creation:", error);
    }
}

async function handleSubscriptionUpdated(subscription: any) {
    // Handle subscription updates (cancellations, etc.)
    console.log("Subscription updated:", subscription.id);
}

async function handleSubscriptionDeleted(subscription: any) {
    try {
        // Mark associated donation as cancelled
        const donation = await prisma.donation.findUnique({
            where: { stripeSubscriptionId: subscription.id },
        });

        if (donation) {
            await prisma.donation.update({
                where: { id: donation.id },
                data: { status: "CANCELLED" },
            });
            console.log("Subscription cancelled for donation:", donation.id);
        }
    } catch (error) {
        console.error("Error handling subscription deletion:", error);
    }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
    try {
        // Handle recurring payment success
        if (invoice.subscription && typeof invoice.subscription === "string") {
            const donation = await prisma.donation.findUnique({
                where: { stripeSubscriptionId: invoice.subscription },
                include: { campaign: true },
            });

            if (donation && donation.campaignId) {
                // Add the recurring payment amount to campaign total
                await prisma.fundraisingCampaign.update({
                    where: { id: donation.campaignId },
                    data: {
                        currentAmountCents: {
                            increment: donation.amountCents,
                        },
                    },
                });

                // Create a new "donation" record for this recurring payment
                await prisma.donation.create({
                    data: {
                        userId: donation.userId,
                        email: donation.email,
                        firstName: donation.firstName,
                        lastName: donation.lastName,
                        amountCents: donation.amountCents,
                        currency: donation.currency,
                        recurring: true,
                        status: "COMPLETED",
                        isAnonymous: donation.isAnonymous,
                        campaignId: donation.campaignId,
                        stripePaymentIntentId: invoice.payment_intent as string,
                    },
                });

                console.log(
                    "Recurring payment processed for donation:",
                    donation.id
                );
            }
        }
    } catch (error) {
        console.error("Error handling invoice payment:", error);
    }
}

async function generateTaxReceipt(donation: any) {
    try {
        // Generate unique receipt number
        const receiptNum = `REC-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`;

        // Create receipt record
        await prisma.receipt.create({
            data: {
                donationId: donation.id,
                receiptNum,
                pdfKey: `receipts/${receiptNum}.pdf`, // Will be updated when PDF is generated
            },
        });

        // TODO: Generate actual PDF receipt using PDFKit
        // This will be implemented in the tax receipt generator component

        console.log("Tax receipt generated for donation:", donation.id);
    } catch (error) {
        console.error("Error generating tax receipt:", error);
    }
}
