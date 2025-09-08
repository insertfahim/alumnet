const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function addTestUser() {
    const prisma = new PrismaClient();

    try {
        console.log("Adding test user...");

        const hashedPassword = await bcrypt.hash("password123", 12);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: "test.alumni@bracu.ac.bd" },
        });

        if (existingUser) {
            console.log("Test user already exists");
            return;
        }

        const user = await prisma.user.create({
            data: {
                email: "test.alumni@bracu.ac.bd",
                password: hashedPassword,
                firstName: "Test",
                lastName: "Alumni",
                graduationYear: 2020,
                degree: "Bachelor's",
                major: "Computer Science",
                currentCompany: "Test Company",
                currentPosition: "Software Engineer",
                location: "Dhaka, Bangladesh",
                bio: "Test alumni user for directory testing.",
                isVerified: true,
                role: "ALUMNI",
            },
        });

        console.log("Test user created:", user.firstName, user.lastName);

        // Count total alumni
        const count = await prisma.user.count({
            where: { role: "ALUMNI" },
        });

        console.log("Total alumni users:", count);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

addTestUser();
