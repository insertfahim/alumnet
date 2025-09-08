const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');nst { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createTestUserAndJobs() {
    try {
        console.log("Creating test user and jobs...");

        // Create a test user who can post jobs
        const hashedPassword = await bcrypt.hash("password123", 10);

        let testUser;
        try {
            testUser = await prisma.user.create({
                data: {
                    email: "test.recruiter@bracu.ac.bd",
                    password: hashedPassword,
                    firstName: "Test",
                    lastName: "Recruiter",
                    graduationYear: 2020,
                    degree: "Bachelor's",
                    major: "Computer Science and Engineering",
                    currentCompany: "Samsung R&D Institute",
                    currentPosition: "Senior Software Engineer",
                    location: "Dhaka, Bangladesh",
                    isVerified: true,
                    role: "ALUMNI",
                },
            });
            console.log("Created test user:", testUser.email);
        } catch (error) {
            if (error.code === "P2002") {
                console.log(
                    "Test user already exists, finding existing user..."
                );
                testUser = await prisma.user.findUnique({
                    where: { email: "test.recruiter@bracu.ac.bd" },
                });
            } else {
                throw error;
            }
        }

        if (!testUser) {
            console.error("Could not create or find test user");
            return;
        }

        // Delete existing jobs by this user to avoid duplicates
        await prisma.job.deleteMany({
            where: { postedById: testUser.id },
        });

        // Create sample jobs
        const jobs = [
            {
                title: "Senior Full Stack Developer",
                company: "Samsung R&D Institute Bangladesh",
                location: "Dhaka, Bangladesh",
                type: "FULL_TIME",
                remote: false,
                description:
                    "Join our team to develop next-generation mobile applications and services. Work with cutting-edge technologies and contribute to products used by millions globally.",
                requirements: [
                    "5+ years of experience in full-stack development",
                    "Proficiency in React, Node.js, TypeScript",
                    "Experience with mobile app development",
                    "Strong problem-solving skills",
                ],
                salary: "৳80,000 - ৳120,000",
            },
            {
                title: "Product Manager - Fintech",
                company: "bKash Limited",
                location: "Dhaka, Bangladesh",
                type: "FULL_TIME",
                remote: true,
                description:
                    "Lead product development for Bangladesh's leading mobile financial services platform. Drive innovation in digital payments and financial inclusion.",
                requirements: [
                    "3+ years in product management",
                    "Experience in fintech or payments",
                    "Strong analytical skills",
                    "MBA preferred",
                ],
                salary: "৳90,000 - ৳140,000",
            },
            {
                title: "Data Science Intern",
                company: "Grameenphone Ltd",
                location: "Dhaka, Bangladesh",
                type: "INTERNSHIP",
                remote: true,
                description:
                    "Summer internship opportunity to work with big data and machine learning projects in telecommunications industry.",
                requirements: [
                    "Currently pursuing degree in CS/Statistics/Mathematics",
                    "Knowledge of Python, SQL",
                    "Interest in data analysis and ML",
                ],
                salary: "৳20,000 - ৳30,000",
            },
        ];

        for (const jobData of jobs) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

            const job = await prisma.job.create({
                data: {
                    ...jobData,
                    postedById: testUser.id,
                    expiresAt: expiresAt,
                },
            });

            console.log(`Created job: ${job.title} at ${job.company}`);
        }

        console.log("Test data created successfully!");

        // Show current job count
        const jobCount = await prisma.job.count();
        console.log(`Total jobs in database: ${jobCount}`);
    } catch (error) {
        console.error("Error creating test data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUserAndJobs();
