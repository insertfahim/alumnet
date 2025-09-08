const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAlumniUser() {
    try {
        console.log("🔄 Creating alumni user...");

        const email = "alumni@bracu.ac.bd";
        const password = "alumni123456";
        const firstName = "Test";
        const lastName = "Alumni";

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        let user;
        if (existingUser) {
            console.log("ℹ️  User already exists, updating password...");

            // Update existing user
            user = await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    firstName,
                    lastName,
                    graduationYear: 2022,
                    degree: "Bachelor of Science",
                    major: "Computer Science and Engineering",
                    role: "ALUMNI",
                    isVerified: true,
                    emailVerified: new Date(),
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
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    graduationYear: 2022,
                    degree: "Bachelor of Science",
                    major: "Computer Science and Engineering",
                    role: "ALUMNI",
                    isVerified: true,
                    emailVerified: new Date(),
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
        }

        console.log("✅ Alumni user created/updated successfully!");
        console.log("📧 Email:", user.email);
        console.log("🔐 Password:", password);
        console.log("👤 Name:", `${user.firstName} ${user.lastName}`);
        console.log("🎭 Role:", user.role);
        console.log("✅ Admin Verified:", user.isVerified);
        console.log("📧 Email Verified:", !!user.emailVerified);
        console.log(
            "🎓 Graduation:",
            `${user.degree} in ${user.major} (${user.graduationYear})`
        );
        console.log("🆔 ID:", user.id);
    } catch (error) {
        console.error("❌ Error creating/updating alumni user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createAlumniUser();
