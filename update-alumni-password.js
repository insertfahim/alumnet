const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function updateAlumniPassword() {
    try {
        console.log("🔄 Updating alumni user password...");

        const email = "alumni@bracu.ac.bd";
        const newPassword = "alumni123456";

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
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
            },
        });

        console.log("✅ Alumni user password updated successfully!");
        console.log("📧 Email:", updatedUser.email);
        console.log("🔐 New Password:", newPassword);
        console.log(
            "👤 Name:",
            `${updatedUser.firstName} ${updatedUser.lastName}`
        );
        console.log("🎭 Role:", updatedUser.role);
        console.log("✅ Verified:", updatedUser.isVerified);
        console.log("🆔 ID:", updatedUser.id);
    } catch (error) {
        console.error("❌ Error updating alumni user password:", error);
        // If user doesn't exist, create them
        if (error.code === "P2025") {
            console.log("ℹ️  User not found, creating new user...");
            await createNewUser();
        }
    } finally {
        await prisma.$disconnect();
    }
}

async function createNewUser() {
    try {
        const email = "alumni@bracu.ac.bd";
        const password = "alumni123456";
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: "Test",
                lastName: "Alumni",
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
            },
        });

        console.log("✅ New alumni user created successfully!");
        console.log("📧 Email:", newUser.email);
        console.log("🔐 Password:", password);
        console.log("👤 Name:", `${newUser.firstName} ${newUser.lastName}`);
        console.log("🎭 Role:", newUser.role);
        console.log("✅ Verified:", newUser.isVerified);
        console.log("🆔 ID:", newUser.id);
    } catch (createError) {
        console.error("❌ Error creating new user:", createError);
    }
}

updateAlumniPassword();
