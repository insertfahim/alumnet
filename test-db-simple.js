const { PrismaClient } = require("@prisma/client");

async function testConnection() {
    const prisma = new PrismaClient();
    try {
        console.log("Testing database connection...");
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log("✅ Database connection successful!");
        console.log("Result:", result);
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
