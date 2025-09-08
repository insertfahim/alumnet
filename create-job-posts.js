const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const jobPosts = [
    {
        title: "Senior Software Engineer",
        company: "Samsung R&D Institute Bangladesh",
        location: "Dhaka, Bangladesh",
        type: "FULL_TIME",
        remote: false,
        description:
            "Join Samsung R&D Institute Bangladesh as a Senior Software Engineer. Work on cutting-edge mobile technologies and innovative software solutions for next-generation devices. You'll be part of a dynamic team developing applications and systems that impact millions of users globally.",
        requirements: [
            "5+ years of experience in software development",
            "Proficiency in React, Node.js, TypeScript",
            "Experience with Android/iOS development",
            "Strong problem-solving and debugging skills",
            "Bachelor's degree in Computer Science or related field",
            "BRACU graduates preferred",
        ],
        salary: "৳80,000 - ৳120,000",
        durationDays: 30,
    },
    {
        title: "Assistant Vice President - Corporate Banking",
        company: "BRAC Bank Limited",
        location: "Dhaka, Bangladesh",
        type: "FULL_TIME",
        remote: false,
        description:
            "BRAC Bank Limited is seeking an experienced Assistant Vice President to join our corporate banking division. Lead strategic initiatives, manage key client relationships, and drive business growth in the corporate banking sector.",
        requirements: [
            "MBA or equivalent qualification",
            "8+ years of experience in banking/finance",
            "Strong leadership and team management experience",
            "Excellent analytical and strategic planning skills",
            "Experience in corporate banking and client relationship management",
        ],
        salary: "৳150,000 - ৳200,000",
        durationDays: 45,
    },
    {
        title: "Product Manager - Digital Solutions",
        company: "Grameenphone Ltd",
        location: "Dhaka, Bangladesh",
        type: "FULL_TIME",
        remote: true,
        description:
            "Join Grameenphone as a Product Manager for our digital solutions portfolio. Drive innovation in mobile financial services and digital products that serve millions of customers across Bangladesh.",
        requirements: [
            "3+ years in product management",
            "Experience with digital products and mobile services",
            "Strong analytical and data-driven decision making",
            "Excellent communication and stakeholder management",
            "Experience with agile methodologies",
        ],
        salary: "৳90,000 - ৳130,000",
        durationDays: 25,
    },
    {
        title: "UX/UI Designer",
        company: "Brain Station 23 Ltd",
        location: "Dhaka, Bangladesh",
        type: "FULL_TIME",
        remote: true,
        description:
            "We are seeking a talented UX/UI Designer to create intuitive and engaging user experiences for our diverse range of digital products. Work with international clients and cutting-edge technologies.",
        requirements: [
            "Portfolio demonstrating strong UX/UI skills",
            "Proficiency in Figma, Adobe Creative Suite",
            "3+ years of experience in digital design",
            "Understanding of user-centered design principles",
            "Experience with prototyping and user testing",
        ],
        salary: "৳60,000 - ৳90,000",
        durationDays: 30,
    },
    {
        title: "Data Scientist",
        company: "BDCOM Online Ltd",
        location: "Dhaka, Bangladesh",
        type: "FULL_TIME",
        remote: false,
        description:
            "Join our data science team to analyze large datasets, build predictive models, and derive actionable insights that drive business decisions in the telecommunications industry.",
        requirements: [
            "Master's degree in Data Science, Statistics, or related field",
            "3+ years of experience in data science and analytics",
            "Proficiency in Python, R, SQL",
            "Experience with machine learning frameworks",
            "Strong statistical analysis and modeling skills",
        ],
        salary: "৳70,000 - ৳100,000",
        durationDays: 40,
    },
    {
        title: "DevOps Engineer",
        company: "Pathao Ltd",
        location: "Dhaka, Bangladesh",
        type: "FULL_TIME",
        remote: true,
        description:
            "Looking for a DevOps Engineer to help scale our infrastructure and improve our development processes. Work with cutting-edge cloud technologies and automation tools.",
        requirements: [
            "4+ years of DevOps/Infrastructure experience",
            "Experience with AWS, Docker, Kubernetes",
            "Proficiency in CI/CD pipelines",
            "Knowledge of monitoring and logging tools",
            "Experience with Infrastructure as Code (Terraform, CloudFormation)",
        ],
        salary: "৳85,000 - ৳115,000",
        durationDays: 35,
    },
    {
        title: "Marketing Manager - Digital",
        company: "ACI Limited",
        location: "Dhaka, Bangladesh",
        type: "FULL_TIME",
        remote: false,
        description:
            "Lead digital marketing initiatives for one of Bangladesh's leading consumer goods companies. Develop and execute comprehensive digital marketing strategies across multiple brands.",
        requirements: [
            "MBA in Marketing or related field",
            "5+ years of digital marketing experience",
            "Experience with social media marketing and analytics",
            "Strong understanding of consumer behavior",
            "Experience managing marketing budgets and campaigns",
        ],
        salary: "৳75,000 - ৳110,000",
        durationDays: 30,
    },
    {
        title: "Software Engineering Intern",
        company: "Enosis Solutions",
        location: "Dhaka, Bangladesh",
        type: "INTERNSHIP",
        remote: true,
        description:
            "Join our summer internship program and gain hands-on experience in software development. Work on real projects with mentorship from senior engineers.",
        requirements: [
            "Currently pursuing Computer Science or related degree",
            "Basic knowledge of programming languages (Java, Python, JavaScript)",
            "Strong problem-solving skills",
            "Eagerness to learn and adapt",
            "Good communication skills",
        ],
        salary: "৳15,000 - ৳25,000",
        durationDays: 60,
    },
];

async function createJobPosts() {
    try {
        // First, let's find some verified users to post these jobs
        const verifiedUsers = await prisma.user.findMany({
            where: {
                isVerified: true,
                role: "ALUMNI",
            },
            take: 8,
        });

        if (verifiedUsers.length === 0) {
            console.log(
                "No verified users found. Creating some verified users first..."
            );

            // Create some verified users if none exist
            const newUsers = await Promise.all([
                prisma.user.create({
                    data: {
                        email: "fahima.rahman@gmail.com",
                        password: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789", // This would be properly hashed
                        firstName: "Fahima",
                        lastName: "Rahman",
                        graduationYear: 2018,
                        degree: "Bachelor's",
                        major: "Computer Science and Engineering",
                        currentCompany: "Samsung R&D Institute",
                        currentPosition: "Senior Software Engineer",
                        location: "Dhaka, Bangladesh",
                        isVerified: true,
                        role: "ALUMNI",
                    },
                }),
                prisma.user.create({
                    data: {
                        email: "rafiq.ahmed@gmail.com",
                        password: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789",
                        firstName: "Rafiq",
                        lastName: "Ahmed",
                        graduationYear: 2016,
                        degree: "Master's",
                        major: "Business Administration",
                        currentCompany: "BRAC Bank Limited",
                        currentPosition: "Assistant Vice President",
                        location: "Dhaka, Bangladesh",
                        isVerified: true,
                        role: "ALUMNI",
                    },
                }),
                prisma.user.create({
                    data: {
                        email: "sadia.islam@gmail.com",
                        password: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789",
                        firstName: "Sadia",
                        lastName: "Islam",
                        graduationYear: 2019,
                        degree: "Bachelor's",
                        major: "Computer Science and Engineering",
                        currentCompany: "Grameenphone Ltd",
                        currentPosition: "Product Manager",
                        location: "Dhaka, Bangladesh",
                        isVerified: true,
                        role: "ALUMNI",
                    },
                }),
                prisma.user.create({
                    data: {
                        email: "karim.hassan@gmail.com",
                        password: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789",
                        firstName: "Karim",
                        lastName: "Hassan",
                        graduationYear: 2017,
                        degree: "Bachelor's",
                        major: "Computer Science and Engineering",
                        currentCompany: "Brain Station 23",
                        currentPosition: "Design Lead",
                        location: "Dhaka, Bangladesh",
                        isVerified: true,
                        role: "ALUMNI",
                    },
                }),
            ]);

            verifiedUsers.push(...newUsers);
        }

        console.log(
            `Found ${verifiedUsers.length} verified users to post jobs`
        );

        // Create job posts
        for (let i = 0; i < jobPosts.length; i++) {
            const jobData = jobPosts[i];
            const poster = verifiedUsers[i % verifiedUsers.length];

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + jobData.durationDays);

            await prisma.job.create({
                data: {
                    title: jobData.title,
                    company: jobData.company,
                    location: jobData.location,
                    type: jobData.type,
                    remote: jobData.remote,
                    description: jobData.description,
                    requirements: jobData.requirements,
                    salary: jobData.salary,
                    postedById: poster.id,
                    expiresAt: expiresAt,
                },
            });

            console.log(`Created job: ${jobData.title} at ${jobData.company}`);
        }

        console.log(`Successfully created ${jobPosts.length} job posts!`);
    } catch (error) {
        console.error("Error creating job posts:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createJobPosts();
