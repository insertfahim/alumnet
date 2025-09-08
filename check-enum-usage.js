const { PrismaClient } = require("@prisma/client");

// Create a raw query to check enum values in use
async function checkEnumUsage() {
    const prisma = new PrismaClient();

    try {
        // Check what enum values are currently in the fundraising_campaigns table
        const result = await prisma.$queryRaw`
            SELECT DISTINCT status 
            FROM fundraising_campaigns
        `;

        console.log("Current CampaignStatus values in use:");
        console.log(result);

        // Check what enum values are currently in the campaigns table (newsletter campaigns)
        const newsletterResult = await prisma.$queryRaw`
            SELECT DISTINCT status 
            FROM campaigns
        `;

        console.log("Current NewsletterCampaignStatus values in use:");
        console.log(newsletterResult);

        // Check the actual enum definition in the database
        const enumValues = await prisma.$queryRaw`
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (
                SELECT oid 
                FROM pg_type 
                WHERE typname = 'CampaignStatus'
            )
        `;

        console.log("CampaignStatus enum values defined in database:");
        console.log(enumValues);
    } catch (error) {
        console.error("Error checking enum usage:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkEnumUsage();
