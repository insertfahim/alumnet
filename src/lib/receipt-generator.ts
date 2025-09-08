import PDFDocument from "pdfkit";
import { prisma } from "./prisma";

export interface ReceiptData {
    donationId: string;
    receiptNum: string;
    donorName: string;
    donorEmail: string;
    amount: number;
    currency: string;
    donationDate: Date;
    campaignTitle?: string;
    isRecurring: boolean;
    frequency?: string;
}

export async function generateTaxReceipt(
    receiptData: ReceiptData
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "LETTER",
                margin: 50,
            });

            const buffers: Buffer[] = [];

            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });

            doc.on("error", reject);

            // Header
            doc.fontSize(24)
                .font("Helvetica-Bold")
                .text("BRAC University Alumni Network", { align: "center" });

            doc.moveDown();
            doc.fontSize(16)
                .font("Helvetica")
                .text("Tax Deductible Donation Receipt", { align: "center" });

            doc.moveDown(2);

            // Receipt details
            doc.fontSize(12)
                .font("Helvetica-Bold")
                .text("Receipt Number:", { continued: true })
                .font("Helvetica")
                .text(` ${receiptData.receiptNum}`);

            doc.text("Date:", { continued: true }).text(
                ` ${receiptData.donationDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                })}`
            );

            doc.moveDown();

            // Donor information
            doc.fontSize(14).font("Helvetica-Bold").text("Donor Information");

            doc.moveDown(0.5);
            doc.fontSize(12)
                .font("Helvetica")
                .text("Name:", { continued: true })
                .text(` ${receiptData.donorName}`);

            doc.text("Email:", { continued: true }).text(
                ` ${receiptData.donorEmail}`
            );

            doc.moveDown();

            // Donation details
            doc.fontSize(14).font("Helvetica-Bold").text("Donation Details");

            doc.moveDown(0.5);
            doc.fontSize(12).font("Helvetica");

            if (receiptData.campaignTitle) {
                doc.text("Campaign:", { continued: true }).text(
                    ` ${receiptData.campaignTitle}`
                );
            }

            const amountText = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: receiptData.currency,
            }).format(receiptData.amount / 100);

            doc.text("Amount:", { continued: true }).text(` ${amountText}`);

            if (receiptData.isRecurring) {
                doc.text("Type:", { continued: true }).text(
                    ` Recurring ${receiptData.frequency || "donation"}`
                );
            } else {
                doc.text("Type:", { continued: true }).text(
                    " One-time donation"
                );
            }

            doc.moveDown(2);

            // Tax information
            doc.fontSize(14).font("Helvetica-Bold").text("Tax Information");

            doc.moveDown(0.5);
            doc.fontSize(10)
                .font("Helvetica")
                .text(
                    "This donation is tax-deductible to the extent allowed by law. " +
                        "Please consult your tax advisor for specific tax implications. " +
                        "BRAC University Alumni Network is a 501(c)(3) nonprofit organization.",
                    { align: "left" }
                );

            doc.moveDown();

            doc.text(
                "EIN: 00-0000000 | For tax purposes, please retain this receipt for your records.",
                { align: "left" }
            );

            doc.moveDown(2);

            // Footer
            doc.fontSize(10)
                .font("Helvetica")
                .text(
                    "Thank you for your generous support of BRAC University Alumni Network!",
                    { align: "center" }
                );

            doc.text("www.bracu-alumni.org | support@bracu-alumni.org", {
                align: "center",
            });

            // Add border
            doc.rect(
                20,
                20,
                doc.page.width - 40,
                doc.page.height - 40
            ).stroke();

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

export async function generateAndSaveReceipt(
    donationId: string
): Promise<string> {
    try {
        // Get donation details
        const donation = await prisma.donation.findUnique({
            where: { id: donationId },
            include: {
                campaign: true,
                user: true,
            },
        });

        if (!donation) {
            throw new Error("Donation not found");
        }

        // Generate receipt number
        const receiptNum = `REC-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`;

        // Prepare receipt data
        const receiptData: ReceiptData = {
            donationId,
            receiptNum,
            donorName: donation.isAnonymous
                ? "Anonymous Donor"
                : `${donation.firstName || donation.user?.firstName} ${
                      donation.lastName || donation.user?.lastName
                  }`.trim(),
            donorEmail: donation.email || donation.user?.email || "",
            amount: donation.amountCents,
            currency: donation.currency,
            donationDate: donation.createdAt,
            campaignTitle: donation.campaign?.title,
            isRecurring: donation.recurring,
            frequency: donation.recurring ? "monthly" : undefined, // This could be enhanced to store frequency
        };

        // Generate PDF
        const pdfBuffer = await generateTaxReceipt(receiptData);

        // TODO: Upload PDF to S3/Cloud storage and get URL
        // For now, we'll store the receipt record with a placeholder
        let receipt = await prisma.receipt.findFirst({
            where: { donationId },
        });

        if (!receipt) {
            receipt = await prisma.receipt.create({
                data: {
                    donationId,
                    receiptNum,
                    pdfKey: `receipts/${receiptNum}.pdf`,
                },
            });
        }

        // TODO: Actually save the PDF buffer to storage
        // const s3Key = await uploadToS3(pdfBuffer, `receipts/${receiptNum}.pdf`);

        return receipt.receiptNum;
    } catch (error) {
        console.error("Error generating receipt:", error);
        throw error;
    }
}

// Helper function to upload to S3 (to be implemented)
async function uploadToS3(buffer: Buffer, key: string): Promise<string> {
    // TODO: Implement S3 upload
    // const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    // const s3Client = new S3Client({
    //     region: process.env.AWS_REGION,
    //     credentials: {
    //         accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    //         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    //     },
    // });

    // const command = new PutObjectCommand({
    //     Bucket: process.env.AWS_S3_BUCKET!,
    //     Key: key,
    //     Body: buffer,
    //     ContentType: "application/pdf",
    // });

    // await s3Client.send(command);

    return key;
}
