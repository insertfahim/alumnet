const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function simpleTest() {
    console.log("Testing database connection...");

    try {
        // Test basic connection
        const userCount = await prisma.user.count();
        console.log("User count:", userCount);

        const jobCount = await prisma.job.count();
        console.log("Job count:", jobCount);

        // If no jobs exist, let's create one simple job with a basic user
        if (jobCount === 0) {
            console.log("No jobs found, creating test data...");

            // Create or find a simple user first
            let user = await prisma.user.findFirst({
                where: { isVerified: true },
            });

            if (!user) {
                console.log("No verified users found, creating one...");
                user = await prisma.user.create({
                    data: {
                        email: "simple.user@test.com",
                        password: "hashedpassword123",
                        firstName: "John",
                        lastName: "Doe",
                        graduationYear: 2020,
                        degree: "Bachelor's",
                        major: "Computer Science",
                        isVerified: true,
                        role: "ALUMNI",
                    },
                });
                console.log("Created user:", user.email);
            }

            // Create a simple job
            const job = await prisma.job.create({
                data: {
                    title: "Test Software Developer",
                    company: "Test Company Ltd",
                    location: "Dhaka, Bangladesh",
                    type: "FULL_TIME",
                    remote: false,
                    description:
                        "This is a test job posting to verify the system is working.",
                    requirements: ["Programming skills", "Problem solving"],
                    salary: "50,000 - 70,000 BDT",
                    postedById: user.id,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                },
            });

            console.log("Created job:", job.title);
        } else {
            console.log("Jobs already exist in database");

            // Show first few jobs
            const jobs = await prisma.job.findMany({
                take: 3,
                include: {
                    postedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });

            jobs.forEach((job) => {
                console.log(
                    `- ${job.title} at ${job.company} (by ${job.postedBy.firstName} ${job.postedBy.lastName})`
                );
            });
        }
    } catch (error) {
        console.error("Database error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

simpleTest();
