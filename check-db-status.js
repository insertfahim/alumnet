const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkDatabaseStatus() {
    try {
        console.log("Checking database connection...");

        // Check campaigns table
        const campaigns = await prisma.campaign.findMany({
            select: {
                id: true,
                title: true,
                status: true,
            },
        });
        console.log("Campaigns found:", campaigns.length);
        campaigns.forEach((c) => {
            console.log(`- ${c.title}: ${c.status}`);
        });

        // Check fundraising campaigns table
        const fundraisingCampaigns = await prisma.fundraisingCampaign.findMany({
            select: {
                id: true,
                title: true,
                status: true,
            },
        });
        console.log(
            "Fundraising campaigns found:",
            fundraisingCampaigns.length
        );
        fundraisingCampaigns.forEach((c) => {
            console.log(`- ${c.title}: ${c.status}`);
        });
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabaseStatus();
