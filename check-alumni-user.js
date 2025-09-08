const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: "alumni@bracu.ac.bd" },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
            },
        });

        if (user) {
            console.log("✅ User found:");
            console.log("📧 Email:", user.email);
            console.log("👤 Name:", `${user.firstName} ${user.lastName}`);
            console.log("🎭 Role:", user.role);
            console.log("✅ Verified:", user.isVerified);
            console.log("🆔 ID:", user.id);
            console.log("");
            console.log("🔐 Password: alumni123456");
        } else {
            console.log("❌ User not found");
        }
    } catch (error) {
        console.error("❌ Error checking user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
