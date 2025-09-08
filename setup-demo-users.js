const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function setupDemoUsers() {
    try {
        console.log("🎓 Setting up demo users for BRACU Alumni Portal");
        console.log("================================================");

        const users = [
            {
                email: "admin@bracu.ac.bd",
                password: "admin123456",
                firstName: "Admin",
                lastName: "User",
                role: "ADMIN",
                isVerified: true,
                graduationYear: 2020,
                degree: "Administration",
                major: "System Administration",
                currentCompany: "BRAC University",
                currentPosition: "System Administrator",
                location: "Dhaka, Bangladesh",
                bio: "System administrator for the alumni network.",
            },
            {
                email: "alumni@bracu.ac.bd",
                password: "admin123456",
                firstName: "Test",
                lastName: "Alumni",
                role: "ALUMNI",
                isVerified: false,
                graduationYear: 2022,
                degree: "Bachelor of Science",
                major: "Computer Science and Engineering",
                currentCompany: "Tech Company",
                currentPosition: "Software Engineer",
                location: "Dhaka, Bangladesh",
                bio: "Demo alumni user for testing the platform.",
            },
        ];

        for (const userData of users) {
            console.log(`\n🔄 Processing user: ${userData.email}`);

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email },
            });

            if (existingUser) {
                console.log(`ℹ️  User already exists: ${userData.email}`);

                // Check if password needs updating
                const isPasswordCorrect = await bcrypt.compare(
                    userData.password,
                    existingUser.password
                );
                if (!isPasswordCorrect) {
                    console.log(`🔄 Updating password for: ${userData.email}`);
                    const hashedPassword = await bcrypt.hash(
                        userData.password,
                        12
                    );

                    await prisma.user.update({
                        where: { email: userData.email },
                        data: { password: hashedPassword },
                    });

                    console.log(`✅ Password updated for: ${userData.email}`);
                } else {
                    console.log(
                        `✅ Password already correct for: ${userData.email}`
                    );
                }

                // Update other fields if needed
                const needsUpdate =
                    existingUser.role !== userData.role ||
                    existingUser.isVerified !== userData.isVerified;

                if (needsUpdate) {
                    await prisma.user.update({
                        where: { email: userData.email },
                        data: {
                            role: userData.role,
                            isVerified: userData.isVerified,
                            emailVerified:
                                existingUser.emailVerified || new Date(),
                        },
                    });
                    console.log(
                        `✅ User details updated for: ${userData.email}`
                    );
                }
            } else {
                // Create new user
                console.log(`➕ Creating new user: ${userData.email}`);
                const hashedPassword = await bcrypt.hash(userData.password, 12);

                const newUser = await prisma.user.create({
                    data: {
                        ...userData,
                        password: hashedPassword,
                        emailVerified: new Date(),
                    },
                });

                console.log(`✅ User created successfully: ${newUser.email}`);
                console.log(
                    `👤 Name: ${newUser.firstName} ${newUser.lastName}`
                );
                console.log(`🎭 Role: ${newUser.role}`);
                console.log(`✅ Verified: ${newUser.isVerified}`);
            }
        }

        console.log("\n🎉 Demo users setup complete!");
        console.log("\n📝 Demo Accounts:");
        console.log("   Admin: admin@bracu.ac.bd / admin123456");
        console.log("   Alumni: alumni@bracu.ac.bd / admin123456");
        console.log("\n🚀 You can now login at: http://localhost:3000/login");
    } catch (error) {
        console.error("❌ Error setting up demo users:", error.message);
        console.error("Stack:", error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

setupDemoUsers();
