const { PrismaClient } = require("@prisma/client");

async function createDraftCampaign() {
    const prisma = new PrismaClient();

    try {
        console.log("Creating a DRAFT campaign for testing...");

        const campaign = await prisma.campaign.create({
            data: {
                title: "Draft Newsletter Campaign",
                subject: "Test Subject for Edit/Pause/Delete",
                bodyHtml:
                    "<h1>Draft Newsletter</h1><p>This is a draft newsletter that you can edit, pause, or delete to test the functionality.</p><p>You can modify this content and test all the admin features.</p>",
                bodyText:
                    "Draft Newsletter - This is a draft newsletter that you can edit, pause, or delete to test the functionality.",
                category: "general",
                status: "DRAFT",
            },
        });

        console.log("Draft campaign created successfully!");
        console.log("ID:", campaign.id);
        console.log("Title:", campaign.title);
        console.log("Status:", campaign.status);
        console.log("");
        console.log(
            "Now you should be able to see the edit, pause, and delete buttons for this campaign in the admin panel."
        );
    } catch (error) {
        console.error("Error creating campaign:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createDraftCampaign();
