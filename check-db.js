const { PrismaClient } = require("@prisma/client");

async function checkCampaigns() {
    const prisma = new PrismaClient();
    try {
        const count = await prisma.campaign.count();
        console.log(`Total campaigns in database: ${count}`);

        if (count > 0) {
            const campaigns = await prisma.campaign.findMany({
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            });

            console.log("Recent campaigns:");
            campaigns.forEach((c, i) => {
                console.log(
                    `${i + 1}. ${c.title} (${c.status}) - Created: ${
                        c.createdAt
                    }`
                );
            });
        }
    } catch (error) {
        console.error("Database error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkCampaigns();
