const { PrismaClient } = require("@prisma/client");

async function createCampaignProposal() {
    const prisma = new PrismaClient();

    try {
        console.log("Creating test campaign proposal...");

        // First, get a test user to be the organizer
        const testUser = await prisma.user.findFirst({
            where: {
                role: "ALUMNI",
            },
        });

        if (!testUser) {
            console.log("No test user found. Please create a user first.");
            return;
        }

        console.log("Using user:", testUser.firstName, testUser.lastName);

        const proposal = await prisma.fundraisingCampaign.create({
            data: {
                title: "BRACU Alumni Scholarship Fund 2025",
                description:
                    "Help us provide scholarships for deserving students from underprivileged backgrounds. Your contribution will directly impact the lives of future BRACU students and help build a more inclusive alumni community. All funds will be used for tuition assistance, books, and educational materials.",
                goalAmountCents: 5000000, // $50,000
                currency: "USD",
                endDate: new Date("2025-12-31"),
                coverImage: "/images/campaigns/scholarship-fund.jpg",
                organizerId: testUser.id,
                status: "PENDING", // This will require admin approval
                isActive: false, // Will be activated once approved
            },
            include: {
                organizer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        console.log("✅ Campaign proposal created successfully!");
        console.log("📋 Proposal Details:");
        console.log("   ID:", proposal.id);
        console.log("   Title:", proposal.title);
        console.log(
            "   Goal: $" + (proposal.goalAmountCents / 100).toLocaleString()
        );
        console.log("   Status:", proposal.status);
        console.log(
            "   Organizer:",
            proposal.organizer.firstName,
            proposal.organizer.lastName
        );
        console.log("   Created:", proposal.createdAt.toLocaleDateString());
        console.log("\n📝 Next Steps:");
        console.log("   1. Log in as admin to approve/reject this proposal");
        console.log(
            "   2. Visit /admin/donations to manage campaign proposals"
        );
        console.log(
            "   3. Once approved, the campaign will be visible to donors"
        );
    } catch (error) {
        console.error("❌ Error creating campaign proposal:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createCampaignProposal();
