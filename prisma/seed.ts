import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...");

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 12);

    const user1 = await prisma.user.create({
        data: {
            email: "john.doe@example.com",
            password: hashedPassword,
            firstName: "John",
            lastName: "Doe",
            graduationYear: 2020,
            degree: "Bachelor's",
            major: "Computer Science",
            currentCompany: "Tech Corp",
            currentPosition: "Software Engineer",
            location: "San Francisco, CA",
            bio: "Passionate software engineer with 3+ years of experience in full-stack development.",
            isVerified: true,
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: "jane.smith@example.com",
            password: hashedPassword,
            firstName: "Jane",
            lastName: "Smith",
            graduationYear: 2018,
            degree: "Master's",
            major: "Business Administration",
            currentCompany: "Global Consulting",
            currentPosition: "Senior Consultant",
            location: "New York, NY",
            bio: "Strategic business consultant helping companies navigate digital transformation.",
            isVerified: true,
        },
    });

    const user3 = await prisma.user.create({
        data: {
            email: "mike.johnson@example.com",
            password: hashedPassword,
            firstName: "Mike",
            lastName: "Johnson",
            graduationYear: 2019,
            degree: "Bachelor's",
            major: "Marketing",
            currentCompany: "Creative Agency",
            currentPosition: "Marketing Director",
            location: "Los Angeles, CA",
            bio: "Creative marketing professional with expertise in digital campaigns and brand strategy.",
            isVerified: true,
        },
    });

    // Create sample jobs
    await prisma.job.create({
        data: {
            title: "Senior Software Engineer",
            company: "Tech Innovations Inc.",
            location: "San Francisco, CA",
            type: "FULL_TIME",
            remote: true,
            description:
                "We are looking for a Senior Software Engineer to join our growing team. You will be responsible for designing and implementing scalable software solutions.",
            requirements: [
                "5+ years of experience",
                "React, Node.js, TypeScript",
                "Experience with cloud platforms",
            ],
            salary: "$120,000 - $160,000",
            postedById: user1.id,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });

    await prisma.job.create({
        data: {
            title: "Product Manager",
            company: "Global Consulting",
            location: "New York, NY",
            type: "FULL_TIME",
            remote: false,
            description:
                "Join our product team to drive innovation and deliver exceptional user experiences. You will work closely with engineering and design teams.",
            requirements: [
                "3+ years in product management",
                "Strong analytical skills",
                "Experience with agile methodologies",
            ],
            salary: "$90,000 - $130,000",
            postedById: user2.id,
            expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        },
    });

    // Create sample events
    await prisma.event.create({
        data: {
            title: "Annual Alumni Reunion 2024",
            description:
                "Join us for our annual reunion with networking, dinner, and special presentations from distinguished alumni.",
            location: "Grand Ballroom, University Campus",
            virtual: false,
            startDate: new Date("2024-06-15T18:00:00"),
            endDate: new Date("2024-06-15T22:00:00"),
            maxAttendees: 200,
            price: 75,
            organizerId: user1.id,
        },
    });

    await prisma.event.create({
        data: {
            title: "Tech Career Networking Night",
            description:
                "Connect with alumni working in technology. Learn about career opportunities and share industry insights.",
            location: "Virtual Event",
            virtual: true,
            startDate: new Date("2024-05-20T19:00:00"),
            endDate: new Date("2024-05-20T21:00:00"),
            maxAttendees: 100,
            organizerId: user2.id,
        },
    });

    // Create sample connections
    await prisma.connection.create({
        data: {
            fromUserId: user1.id,
            toUserId: user2.id,
            status: "ACCEPTED",
            message: "Would love to connect and discuss opportunities in tech!",
        },
    });

    console.log("✅ Database seeded successfully!");
    console.log("📧 Sample users created with email/password:");
    console.log("   john.doe@example.com / password123");
    console.log("   jane.smith@example.com / password123");
    console.log("   mike.johnson@example.com / password123");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
