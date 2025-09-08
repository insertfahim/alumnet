const { PrismaClient } = require("@prisma/client");

async function checkEventTableStructure() {
    const prisma = new PrismaClient();

    try {
        console.log("Checking Event table structure...");

        // Get column information
        const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `;

        console.log("Event table columns:");
        columns.forEach((col) => {
            console.log(
                `- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
            );
        });

        // Check if type column exists
        const typeColumn = columns.find((col) => col.column_name === "type");

        if (!typeColumn) {
            console.log("\n❌ Type column does NOT exist in the database");
            console.log("Adding type column...");

            await prisma.$executeRaw`
        ALTER TABLE "events" ADD COLUMN "type" TEXT
      `;

            console.log("✅ Type column added successfully");
        } else {
            console.log("\n✅ Type column already exists in the database");
        }
    } catch (error) {
        console.error("Error checking table structure:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkEventTableStructure();
