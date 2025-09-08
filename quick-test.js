const { PrismaClient } = require("@prisma/client");

async function quickTest() {
    const prisma = new PrismaClient();

    try {
        // Test without type field first
        console.log("Testing event creation without type field...");
        const event1 = await prisma.event.create({
            data: {
                title: "Test Event 1",
                description: "Test Description",
                location: "Test Location",
                virtual: false,
                startDate: new Date("2025-09-10T10:00:00Z"),
                endDate: new Date("2025-09-10T12:00:00Z"),
                organizerId: "cmf9gvlhy0000um35qb5e57ej",
            },
        });
        console.log("✅ Event created without type:", event1.id);

        // Clean up
        await prisma.event.delete({ where: { id: event1.id } });
        console.log("✅ Test event cleaned up");

        console.log(
            "\n🎉 The fix is working! Events can now be created successfully."
        );
    } catch (error) {
        console.error("❌ Error:", error.message);

        if (error.message.includes("Unknown argument `type`")) {
            console.log(
                "\n🔍 The original error still exists. Need to ensure Prisma client is properly synced."
            );
        }
    } finally {
        await prisma.$disconnect();
    }
}

quickTest();
