import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createNewsletterData() {
    console.log("Creating newsletter test data...");

    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);

    // Create newsletter preferences for all users
    for (const user of users) {
        await prisma.newsletterPref.create({
            data: {
                userId: user.id,
                subscribed: true,
                categories: ["general", "events", "jobs", "mentorship"],
                frequency: "weekly",
            },
        });
    }
    console.log("Created newsletter preferences");

    // Create a test campaign
    const campaign = await prisma.campaign.create({
        data: {
            title: "Welcome to Alumni Network",
            subject: "Welcome to our alumni community!",
            content:
                "Welcome to the BRAC University Alumni Network! We're excited to have you join our community.",
            category: "general",
            status: "DRAFT",
            scheduledFor: null,
        },
    });
    console.log("Created test campaign:", campaign.id);

    console.log("Newsletter test data created successfully!");
}

createNewsletterData()
    .catch((e) => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
