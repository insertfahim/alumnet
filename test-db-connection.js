const { PrismaClient } = require("@prisma/client");

async function testConnection() {
    const prisma = new PrismaClient();

    try {
        console.log("Testing database connection...");

        // Try to count users
        const userCount = await prisma.user.count();
        console.log("Database connection successful!");
        console.log("Total users:", userCount);

        // Try to count campaigns
        const campaignCount = await prisma.campaign.count();
        console.log("Total campaigns:", campaignCount);

        if (campaignCount === 0) {
            console.log("No campaigns found. Creating a test campaign...");

            const campaign = await prisma.campaign.create({
                data: {
                    title: "Test Newsletter Campaign",
                    subject: "Test Subject",
                    bodyHtml:
                        "<h1>Test Newsletter</h1><p>This is a test newsletter.</p>",
                    bodyText: "Test Newsletter - This is a test newsletter.",
                    category: "general",
                    status: "DRAFT",
                },
            });

            console.log("Test campaign created with ID:", campaign.id);
        }
    } catch (error) {
        console.error("Database error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
