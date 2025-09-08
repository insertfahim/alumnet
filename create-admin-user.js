import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
    console.log("Creating admin user...");

    const hashedPassword = await bcrypt.hash("admin123", 12);

    const adminUser = await prisma.user.create({
        data: {
            email: "admin@bracu.ac.bd",
            password: hashedPassword,
            firstName: "Admin",
            lastName: "User",
            graduationYear: 2020,
            degree: "Bachelor's",
            major: "Computer Science",
            currentCompany: "BRAC University",
            currentPosition: "System Administrator",
            location: "Dhaka, Bangladesh",
            bio: "System administrator for the alumni network.",
            role: "ADMIN",
            isVerified: true,
            emailVerified: new Date(),
        },
    });

    console.log("Admin user created:");
    console.log("Email: admin@bracu.ac.bd");
    console.log("Password: admin123");
    console.log("Role: ADMIN");
}

createAdminUser()
    .catch((e) => {
        console.error("Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
