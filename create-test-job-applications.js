// Test script to create job applications
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createJobApplicationsTest() {
    try {
        // Find a user to create applications for
        const users = await prisma.user.findMany({
            take: 2,
        });

        if (users.length < 2) {
            console.log(
                "Need at least 2 users to create job applications test"
            );
            return;
        }

        const jobPoster = users[0];
        const jobApplicant = users[1];

        // Create a test job
        const job = await prisma.job.create({
            data: {
                title: "Senior Software Engineer",
                company: "BRACU Tech Solutions",
                location: "Dhaka, Bangladesh",
                type: "FULL_TIME",
                remote: true,
                description:
                    "We are looking for a Senior Software Engineer to join our growing team. You will work on cutting-edge projects using modern technologies.",
                requirements: [
                    "5+ years of experience in software development",
                    "Proficiency in JavaScript, TypeScript, React",
                    "Experience with Node.js and databases",
                    "Strong problem-solving skills",
                    "BRACU graduate preferred",
                ],
                salary: "৳80,000 - ৳120,000",
                postedById: jobPoster.id,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
        });

        console.log("Created test job:", job.title);

        // Create a test application
        const application = await prisma.jobApplication.create({
            data: {
                jobId: job.id,
                applicantId: jobApplicant.id,
                coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Software Engineer position at BRACU Tech Solutions. As a BRACU graduate with extensive experience in software development, I believe I would be a valuable addition to your team.

Throughout my career, I have developed expertise in JavaScript, TypeScript, and React, working on various full-stack applications. My experience includes building scalable web applications, implementing RESTful APIs, and working with modern development tools and practices.

I am particularly excited about the opportunity to work on cutting-edge projects and contribute to the growth of a company that values innovation and technical excellence. My problem-solving skills and ability to work collaboratively make me well-suited for this role.

Thank you for considering my application. I look forward to the opportunity to discuss how my skills and experience can contribute to your team's success.

Best regards,
${jobApplicant.firstName} ${jobApplicant.lastName}`,
                resumeUrl: "https://drive.google.com/file/d/sample-resume-url",
                status: "PENDING",
            },
        });

        console.log("Created test job application:", application.id);

        // Create another job
        const job2 = await prisma.job.create({
            data: {
                title: "Frontend Developer",
                company: "Creative Digital Agency",
                location: "Chittagong, Bangladesh",
                type: "PART_TIME",
                remote: false,
                description:
                    "Join our creative team as a Frontend Developer. Work on exciting web projects for various clients.",
                requirements: [
                    "3+ years of frontend development experience",
                    "React, Vue.js or Angular",
                    "CSS frameworks (Tailwind, Bootstrap)",
                    "Responsive design principles",
                    "UI/UX collaboration experience",
                ],
                salary: "৳45,000 - ৳65,000",
                postedById: jobPoster.id,
                expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
            },
        });

        console.log("Created second test job:", job2.title);

        console.log("✅ Job applications test data created successfully!");
        console.log("\nTo test the application feature:");
        console.log("1. Go to /jobs page");
        console.log('2. Click "Apply Now" on any job');
        console.log("3. Fill out the application form");
        console.log('4. Check "My Applications" tab to see your applications');
    } catch (error) {
        console.error("Error creating job applications test data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    createJobApplicationsTest();
}

module.exports = createJobApplicationsTest;
