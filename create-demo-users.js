const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createDemoUsers() {
    try {
        console.log("🎓 Creating demo users for BRACU Alumni Portal");
        console.log("============================================");

        // User 1: Admin
        console.log("\n🔄 Creating admin user...");
        const adminEmail = "admin@bracu.ac.bd";
        const adminPassword = "admin123456";

        // Check if admin exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingAdmin) {
            console.log("ℹ️  Admin user already exists:", adminEmail);
        } else {
            const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

            const adminUser = await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedAdminPassword,
                    firstName: "Admin",
                    lastName: "User",
                    graduationYear: 2020,
                    degree: "Administration",
                    major: "System Administration",
                    role: "ADMIN",
                    isVerified: true,
                    emailVerified: new Date(),
                    bio: "System administrator for the alumni network.",
                    currentCompany: "BRAC University",
                    currentPosition: "System Administrator",
                    location: "Dhaka, Bangladesh",
                },
            });

            console.log("✅ Admin user created successfully!");
            console.log("📧 Email:", adminUser.email);
            console.log("🔐 Password:", adminPassword);
            console.log(
                "👤 Name:",
                `${adminUser.firstName} ${adminUser.lastName}`
            );
            console.log("🎭 Role:", adminUser.role);
        }

        // User 2: Alumni
        console.log("\n🔄 Creating alumni user...");
        const alumniEmail = "alumni@bracu.ac.bd";
        const alumniPassword = "admin123456";

        // Check if alumni exists
        const existingAlumni = await prisma.user.findUnique({
            where: { email: alumniEmail },
        });

        if (existingAlumni) {
            console.log("ℹ️  Alumni user already exists:", alumniEmail);
        } else {
            const hashedAlumniPassword = await bcrypt.hash(alumniPassword, 12);

            const alumniUser = await prisma.user.create({
                data: {
                    email: alumniEmail,
                    password: hashedAlumniPassword,
                    firstName: "Test",
                    lastName: "Alumni",
                    graduationYear: 2022,
                    degree: "Bachelor of Science",
                    major: "Computer Science and Engineering",
                    role: "ALUMNI",
                    isVerified: false,
                    emailVerified: new Date(),
                    bio: "Demo alumni user for testing the platform.",
                    currentCompany: "Tech Company",
                    currentPosition: "Software Engineer",
                    location: "Dhaka, Bangladesh",
                },
            });

            console.log("✅ Alumni user created successfully!");
            console.log("📧 Email:", alumniUser.email);
            console.log("🔐 Password:", alumniPassword);
            console.log(
                "👤 Name:",
                `${alumniUser.firstName} ${alumniUser.lastName}`
            );
            console.log("🎭 Role:", alumniUser.role);
        }

        console.log("\n🎉 Demo users setup complete!");
        console.log("\n📝 Demo Accounts:");
        console.log("   Admin: admin@bracu.ac.bd / admin123456");
        console.log("   Alumni: alumni@bracu.ac.bd / admin123456");
        console.log("\n🚀 You can now login at: http://localhost:3000/login");
    } catch (error) {
        console.error("❌ Error creating demo users:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createDemoUsers();
