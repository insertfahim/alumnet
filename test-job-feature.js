const { PrismaClient } = require("@prisma/client");

async function testDatabaseConnection() {
    const prisma = new PrismaClient();

    try {
        console.log("Testing database connection...");

        // Test basic connection
        const userCount = await prisma.user.count();
        console.log(`✅ Database connected. Found ${userCount} users.`);

        // Check if we can create a job
        const users = await prisma.user.findMany({ take: 1 });

        if (users.length === 0) {
            console.log("❌ No users found. Please create a user first.");
            return;
        }

        console.log(`Using user: ${users[0].firstName} ${users[0].lastName}`);

        // Create a test job
        const job = await prisma.job.create({
            data: {
                title: "Test Job Application Feature",
                company: "Test Company",
                location: "Test Location",
                type: "FULL_TIME",
                remote: true,
                description:
                    "This is a test job to verify the application feature works.",
                requirements: ["Test requirement 1", "Test requirement 2"],
                salary: "Test Salary",
                postedById: users[0].id,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
        });

        console.log(`✅ Created test job: ${job.title} (ID: ${job.id})`);

        // Check if job applications table exists
        const appCount = await prisma.jobApplication.count();
        console.log(
            `✅ Job applications table accessible. Found ${appCount} applications.`
        );

        console.log(
            "\n🎉 Everything looks good! The Apply Now feature should work."
        );
    } catch (error) {
        console.error("❌ Database test failed:", error.message);
        if (error.code) {
            console.error("Error code:", error.code);
        }
    } finally {
        await prisma.$disconnect();
    }
}

testDatabaseConnection();
