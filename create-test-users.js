const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        console.log("🔄 Creating admin user...");

        const email = "admin@bracu.ac.bd";
        const password = "admin123456"; // Change this to a secure password
        const firstName = "Admin";
        const lastName = "User";

        // Check if admin user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log("ℹ️  Admin user already exists with email:", email);
            console.log("   User ID:", existingUser.id);
            console.log("   Role:", existingUser.role);
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create admin user
        const adminUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                graduationYear: 2020,
                degree: "Administration",
                major: "System Administration",
                role: "ADMIN",
                isVerified: true,
                emailVerified: new Date(),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                emailVerified: true,
                createdAt: true,
            },
        });

        console.log("✅ Admin user created successfully!");
        console.log("📧 Email:", adminUser.email);
        console.log("🔐 Password:", password);
        console.log("👤 Name:", `${adminUser.firstName} ${adminUser.lastName}`);
        console.log("🎭 Role:", adminUser.role);
        console.log("✅ Verified:", adminUser.isVerified);
        console.log("📅 Created:", adminUser.createdAt);
        console.log("🆔 ID:", adminUser.id);
        console.log("");
        console.log("🔗 You can now login at: http://localhost:3000/login");
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

async function createTestAlumniUser() {
    try {
        console.log("🔄 Creating test alumni user...");

        const email = "alumni@bracu.ac.bd";
        const password = "admin123456"; // Change this to a secure password
        const firstName = "Test";
        const lastName = "Alumni";

        // Check if alumni user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log(
                "ℹ️  Test alumni user already exists with email:",
                email
            );
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create alumni user
        const alumniUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                graduationYear: 2022,
                degree: "Bachelor of Science",
                major: "Computer Science and Engineering",
                role: "ALUMNI",
                isVerified: false, // Will need admin verification
                emailVerified: new Date(), // Email verified but not admin verified
                bio: "Test alumni user for testing the authentication system.",
                currentCompany: "Tech Company",
                currentPosition: "Software Engineer",
                location: "Dhaka, Bangladesh",
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                emailVerified: true,
                graduationYear: true,
                degree: true,
                major: true,
            },
        });

        console.log("✅ Test alumni user created successfully!");
        console.log("📧 Email:", alumniUser.email);
        console.log("🔐 Password:", password);
        console.log(
            "👤 Name:",
            `${alumniUser.firstName} ${alumniUser.lastName}`
        );
        console.log("🎭 Role:", alumniUser.role);
        console.log("✅ Admin Verified:", alumniUser.isVerified);
        console.log("📧 Email Verified:", !!alumniUser.emailVerified);
        console.log(
            "🎓 Graduation:",
            `${alumniUser.degree} in ${alumniUser.major} (${alumniUser.graduationYear})`
        );
    } catch (error) {
        console.error("❌ Error creating test alumni user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    console.log("🎓 BRACU Alumni Portal - Creating Test Users");
    console.log("===========================================");
    console.log("");

    await createAdminUser();
    console.log("");
    await createTestAlumniUser();

    console.log("");
    console.log("🎉 Setup complete!");
    console.log("");
    console.log("📝 Test Accounts Created:");
    console.log("   Admin: admin@bracu.ac.bd / admin123456");
    console.log("   Alumni: alumni@bracu.ac.bd / admin123456");
    console.log("");
    console.log("🚀 Next steps:");
    console.log("   1. Start the development server: npm run dev");
    console.log("   2. Visit: http://localhost:3000");
    console.log("   3. Login with the admin account to verify users");
    console.log("   4. Test the complete authentication flow");
    console.log("");
}

main();
