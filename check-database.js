const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkJobsAndUsers() {
    try {
        console.log("Checking current database state...");

        const userCount = await prisma.user.count();
        const jobCount = await prisma.job.count();
        const verifiedUsers = await prisma.user.count({
            where: { isVerified: true },
        });

        console.log(`Total users: ${userCount}`);
        console.log(`Verified users: ${verifiedUsers}`);
        console.log(`Total jobs: ${jobCount}`);

        if (jobCount === 0) {
            console.log(
                "No jobs found. The database might be empty or need seeding."
            );
        } else {
            const recentJobs = await prisma.job.findMany({
                take: 3,
                orderBy: { createdAt: "desc" },
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

            console.log("\nRecent jobs:");
            recentJobs.forEach((job) => {
                console.log(
                    `- ${job.title} at ${job.company} (posted by ${job.postedBy.firstName} ${job.postedBy.lastName})`
                );
            });
        }
    } catch (error) {
        console.error("Database error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkJobsAndUsers();
