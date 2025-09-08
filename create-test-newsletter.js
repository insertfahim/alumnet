const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createAndSendTestNewsletter() {
    console.log("Creating and sending test newsletter...");

    try {
        // Create a test campaign
        const campaign = await prisma.campaign.create({
            data: {
                title: "Welcome to Alumni Network",
                subject: "Welcome to our alumni community!",
                bodyHtml:
                    "<h1>Welcome!</h1><p>Welcome to the BRAC University Alumni Network! We're excited to have you join our community.</p><p>This is a test newsletter to demonstrate the newsletter functionality.</p>",
                bodyText:
                    "Welcome! Welcome to the BRAC University Alumni Network! We're excited to have you join our community. This is a test newsletter to demonstrate the newsletter functionality.",
                category: "general",
                status: "DRAFT",
            },
        });
        console.log("Created test campaign:", campaign.id);

        // Get all users with verified emails
        const users = await prisma.user.findMany({
            where: {
                emailVerified: { not: null },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
            take: 5, // Limit to 5 for testing
        });
        console.log(`Found ${users.length} verified users`);

        if (users.length === 0) {
            console.log(
                "No verified users found. Creating test users first..."
            );
            return;
        }

        // Create newsletter preferences for users if they don't exist
        for (const user of users) {
            const existingPref = await prisma.newsletterPref.findUnique({
                where: { userId: user.id },
            });

            if (!existingPref) {
                await prisma.newsletterPref.create({
                    data: {
                        userId: user.id,
                        subscribed: true,
                        categories: ["general", "events", "jobs", "mentorship"],
                        frequency: "WEEKLY",
                    },
                });
                console.log(`Created newsletter preferences for ${user.email}`);
            }
        }

        // Simulate sending the newsletter by creating send records
        const sendPromises = users.map((user) =>
            prisma.send.create({
                data: {
                    campaignId: campaign.id,
                    userId: user.id,
                    status: "SENT",
                },
            })
        );

        await Promise.all(sendPromises);
        console.log(`Created ${sendPromises.length} send records`);

        // Update campaign status to SENT
        await prisma.campaign.update({
            where: { id: campaign.id },
            data: {
                status: "SENT",
                sentAt: new Date(),
            },
        });
        console.log("Updated campaign status to SENT");

        console.log("Test newsletter sent successfully!");
        console.log("Campaign ID:", campaign.id);
        console.log(
            "Sent to users:",
            users.map((u) => u.email)
        );
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createAndSendTestNewsletter();
