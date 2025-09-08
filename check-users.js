const { PrismaClient } = require("@prisma/client");

async function checkUsers() {
    const prisma = new PrismaClient();

    try {
        const userCount = await prisma.user.count();
        console.log("Total users in database:", userCount);

        if (userCount > 0) {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isVerified: true,
                    graduationYear: true,
                    major: true,
                    currentCompany: true,
                    currentPosition: true,
                    location: true,
                },
                take: 5,
            });

            console.log("\nFirst 5 users:");
            users.forEach((user) => {
                console.log(
                    `- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`
                );
            });
        }
    } catch (error) {
        console.error("Error checking users:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
