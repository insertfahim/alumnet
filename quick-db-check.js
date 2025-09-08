const { PrismaClient } = require("@prisma/client");

async function quickCheck() {
    const prisma = new PrismaClient();

    try {
        const userCount = await prisma.user.count();
        const campaignCount = await prisma.fundraisingCampaign.count();

        console.log("📊 Database Summary:");
        console.log(`   👥 Users: ${userCount}`);
        console.log(`   🎯 Campaigns: ${campaignCount}`);

        if (campaignCount > 0) {
            const campaigns = await prisma.fundraisingCampaign.findMany({
                select: {
                    title: true,
                    status: true,
                    goalAmountCents: true,
                },
                take: 3,
            });

            console.log("\n📋 Recent Campaigns:");
            campaigns.forEach((campaign, i) => {
                console.log(`   ${i + 1}. ${campaign.title}`);
                console.log(`      Status: ${campaign.status}`);
                console.log(
                    `      Goal: $${(
                        campaign.goalAmountCents / 100
                    ).toLocaleString()}`
                );
            });
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

quickCheck();
