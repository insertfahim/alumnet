const { PrismaClient } = require("@prisma/client");

async function checkAndAddTypeColumn() {
    const prisma = new PrismaClient();

    try {
        // Check if the type column exists
        const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name = 'type'
    `;

        console.log("Column check result:", result);

        if (result.length === 0) {
            console.log("Type column does not exist, adding it...");
            await prisma.$executeRaw`
        ALTER TABLE "events" 
        ADD COLUMN "type" TEXT
      `;
            console.log("Type column added successfully");
        } else {
            console.log("Type column already exists");
        }

        // Test creating an event
        console.log("Testing event creation...");
        const testEvent = await prisma.event.create({
            data: {
                title: "Test Event",
                description: "Test Description",
                location: "Test Location",
                virtual: false,
                type: "workshop",
                startDate: new Date("2025-09-10T10:00:00Z"),
                endDate: new Date("2025-09-10T12:00:00Z"),
                organizerId: "cmf9gvlhy0000um35qb5e57ej", // Use existing organizer ID from error
            },
        });

        console.log("Test event created successfully:", testEvent.id);

        // Clean up test event
        await prisma.event.delete({
            where: { id: testEvent.id },
        });
        console.log("Test event cleaned up");
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndAddTypeColumn();
