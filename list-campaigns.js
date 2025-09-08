const { PrismaClient } = require("@prisma/client");

async function listCampaigns() {
    const prisma = new PrismaClient();

    try {
        console.log("Listing all campaigns...");

        const campaigns = await prisma.campaign.findMany({
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
                _count: {
                    select: {
                        sends: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        console.log(`Found ${campaigns.length} campaigns:`);
        campaigns.forEach((c, i) => {
            console.log(`${i + 1}. ${c.title}`);
            console.log(`   Status: ${c.status}`);
            console.log(`   Sends: ${c._count.sends}`);
            console.log(`   Created: ${c.createdAt}`);
            console.log(`   ID: ${c.id}`);
            console.log("");
        });
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

listCampaigns();
