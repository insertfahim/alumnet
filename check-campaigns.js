const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkAndCreateCampaign() {
    try {
        // Check existing campaigns
        const existing = await prisma.campaign.findMany();
        console.log("Existing campaigns:", existing.length);

        if (existing.length === 0) {
            // Create a test campaign
            const campaign = await prisma.campaign.create({
                data: {
                    title: "Test Newsletter Campaign",
                    subject: "Test Subject for Newsletter",
                    bodyHtml:
                        "<h1>Test Newsletter</h1><p>This is a test newsletter for editing, pausing, and deleting functionality.</p>",
                    bodyText:
                        "Test Newsletter - This is a test newsletter for editing, pausing, and deleting functionality.",
                    category: "general",
                    status: "DRAFT",
                },
            });
            console.log("Created test campaign with ID:", campaign.id);
            console.log("Status:", campaign.status);
        } else {
            console.log("Campaigns found:");
            existing.forEach((c) =>
                console.log("-", c.title, "(", c.status, ")")
            );
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndCreateCampaign();
