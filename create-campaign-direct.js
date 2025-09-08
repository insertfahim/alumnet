const { PrismaClient } = require("@prisma/client");

async function createTestCampaign() {
    const prisma = new PrismaClient();

    try {
        console.log("Creating test campaign...");

        const campaign = await prisma.campaign.create({
            data: {
                title: "Test Newsletter Campaign",
                subject: "Test Subject for Newsletter",
                bodyHtml:
                    "<h1>Test Newsletter</h1><p>This is a test newsletter for testing edit, pause, and delete functionality.</p>",
                bodyText:
                    "Test Newsletter - This is a test newsletter for testing edit, pause, and delete functionality.",
                category: "general",
                status: "DRAFT",
            },
        });

        console.log("Campaign created successfully!");
        console.log("ID:", campaign.id);
        console.log("Title:", campaign.title);
        console.log("Status:", campaign.status);
    } catch (error) {
        console.error("Error creating campaign:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createTestCampaign();
