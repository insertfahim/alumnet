const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkNewsletterData() {
    console.log("Checking newsletter data...");

    try {
        // Check campaigns
        const campaigns = await prisma.campaign.findMany();
        console.log(`Found ${campaigns.length} campaigns:`);
        campaigns.forEach((campaign) => {
            console.log(`- ${campaign.title} (${campaign.status})`);
        });

        // Check sends
        const sends = await prisma.send.findMany();
        console.log(`Found ${sends.length} sends`);

        // Check newsletter preferences
        const prefs = await prisma.newsletterPref.findMany();
        console.log(`Found ${prefs.length} newsletter preferences`);

        // Check users
        const users = await prisma.user.findMany();
        console.log(`Found ${users.length} users`);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkNewsletterData();
