const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkCampaigns() {
    try {
        const campaigns = await prisma.campaign.findMany();
        console.log("Total campaigns:", campaigns.length);
        if (campaigns.length > 0) {
            console.log("Campaigns:");
            campaigns.forEach((c, i) => {
                console.log(`${i + 1}. ${c.title} - Status: ${c.status}`);
            });
        } else {
            console.log("No campaigns found. Creating a test campaign...");

            const newCampaign = await prisma.campaign.create({
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

            console.log("Created campaign:", newCampaign.title);
            console.log("Campaign ID:", newCampaign.id);
            console.log("Status:", newCampaign.status);
        }
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkCampaigns();
