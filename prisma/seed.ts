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

    // Create mentor profiles
    const mentor1 = await prisma.mentorProfile.create({
        data: {
            userId: user1.id,
            skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python"],
            expertise: [
                "Software Development",
                "Web Development",
                "Career Development",
            ],
            bio: "Experienced software engineer passionate about mentoring junior developers. I love helping others grow in their tech careers and sharing my knowledge of modern web development.",
            experience:
                "5+ years as a full-stack developer at Tech Corp, previously at StartupXYZ. Led a team of 8 developers and mentored 15+ junior engineers.",
            availability: "Weekdays 9AM-5PM",
            hourlyRate: 75,
        },
    });

    const mentor2 = await prisma.mentorProfile.create({
        data: {
            userId: user2.id,
            skills: [
                "Business Strategy",
                "Product Management",
                "Data Analysis",
                "Leadership",
            ],
            expertise: [
                "Career Development",
                "Entrepreneurship",
                "Product Management",
            ],
            bio: "Strategic business consultant with a passion for helping professionals navigate their career paths. I specialize in career transitions and leadership development.",
            experience:
                "8+ years in consulting and product management. Founded two successful startups and advised numerous companies on digital transformation.",
            availability: "Evenings after 5PM",
            hourlyRate: 100,
        },
    });

    // Create additional users for mentorship
    const mentee1 = await prisma.user.create({
        data: {
            email: "sarah.wilson@example.com",
            password: hashedPassword,
            firstName: "Sarah",
            lastName: "Wilson",
            graduationYear: 2022,
            degree: "Bachelor's",
            major: "Computer Science",
            currentCompany: "StartupXYZ",
            currentPosition: "Junior Developer",
            location: "Austin, TX",
            bio: "Recent graduate looking to grow my skills in web development and find mentorship opportunities.",
            isVerified: true,
        },
    });

    const mentee2 = await prisma.user.create({
        data: {
            email: "alex.chen@example.com",
            password: hashedPassword,
            firstName: "Alex",
            lastName: "Chen",
            graduationYear: 2021,
            degree: "Bachelor's",
            major: "Information Technology",
            currentCompany: "Tech Solutions Inc.",
            currentPosition: "Software Developer",
            location: "Seattle, WA",
            bio: "Mid-level developer interested in advancing my career and learning from experienced mentors.",
            isVerified: true,
        },
    });

    const mentee3 = await prisma.user.create({
        data: {
            email: "lisa.brown@example.com",
            password: hashedPassword,
            firstName: "Lisa",
            lastName: "Brown",
            graduationYear: 2023,
            degree: "Bachelor's",
            major: "Business Information Systems",
            currentCompany: "Consulting Firm",
            currentPosition: "Business Analyst",
            location: "Chicago, IL",
            bio: "Recent graduate transitioning from business to tech. Looking for guidance on career development.",
            isVerified: true,
        },
    });

    // Create mentorship pairs
    const mentorship1 = await prisma.mentorshipPair.create({
        data: {
            mentorId: user1.id,
            menteeId: mentee1.id,
            status: "ACCEPTED",
            message:
                "Hi John! I'm a recent graduate working as a junior developer. I'd love to get your guidance on advancing my web development skills and career growth.",
            acceptedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
    });

    const mentorship2 = await prisma.mentorshipPair.create({
        data: {
            mentorId: user2.id,
            menteeId: mentee3.id,
            status: "ACCEPTED",
            message:
                "Hello Jane! I'm transitioning from business to tech and would appreciate your guidance on career development and product management.",
            acceptedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        },
    });

    const mentorship3 = await prisma.mentorshipPair.create({
        data: {
            mentorId: user1.id,
            menteeId: mentee2.id,
            status: "PENDING",
            message:
                "Hi John! I've been working as a developer for a couple of years and would like to discuss advanced topics and career progression.",
        },
    });

    // Create sessions for accepted mentorships
    await prisma.session.create({
        data: {
            pairId: mentorship1.id,
            title: "Introduction and Goal Setting",
            description:
                "First session to discuss career goals and set expectations for the mentorship.",
            scheduledAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
            duration: 60,
            status: "COMPLETED",
            completedAt: new Date(
                Date.now() - 25 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
            ),
        },
    });

    await prisma.session.create({
        data: {
            pairId: mentorship1.id,
            title: "React Best Practices",
            description:
                "Discussing React patterns, hooks, and modern development practices.",
            scheduledAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
            duration: 60,
            status: "COMPLETED",
            completedAt: new Date(
                Date.now() - 18 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
            ),
        },
    });

    await prisma.session.create({
        data: {
            pairId: mentorship1.id,
            title: "Career Development Discussion",
            description:
                "Planning next steps and discussing job opportunities.",
            scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            duration: 60,
            status: "SCHEDULED",
        },
    });

    await prisma.session.create({
        data: {
            pairId: mentorship2.id,
            title: "Career Transition Planning",
            description:
                "Discussing strategies for transitioning from business to tech roles.",
            scheduledAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            duration: 60,
            status: "COMPLETED",
            completedAt: new Date(
                Date.now() - 10 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
            ),
        },
    });

    await prisma.session.create({
        data: {
            pairId: mentorship2.id,
            title: "Product Management Fundamentals",
            description:
                "Introduction to product management concepts and methodologies.",
            scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            duration: 60,
            status: "SCHEDULED",
        },
    });

    // Create additional mentor profiles
    const mentor3 = await prisma.mentorProfile.create({
        data: {
            userId: user3.id,
            skills: [
                "Digital Marketing",
                "Content Strategy",
                "SEO",
                "Social Media",
                "Analytics",
            ],
            expertise: [
                "Career Development",
                "Entrepreneurship",
                "Startup Advice",
            ],
            bio: "Marketing professional with a passion for helping others build their personal brand and navigate career transitions. I love sharing insights about digital marketing and entrepreneurship.",
            experience:
                "7+ years in digital marketing and brand strategy. Founded a successful marketing agency and mentored numerous professionals in career development.",
            availability: "Weekends",
            hourlyRate: 65,
        },
    });

    // Create more users for diverse mentorship scenarios
    const mentee4 = await prisma.user.create({
        data: {
            email: "david.kim@example.com",
            password: hashedPassword,
            firstName: "David",
            lastName: "Kim",
            graduationYear: 2020,
            degree: "Master's",
            major: "Data Science",
            currentCompany: "DataTech Solutions",
            currentPosition: "Data Analyst",
            location: "Boston, MA",
            bio: "Data professional looking to advance into data science leadership roles and learn from experienced mentors.",
            isVerified: true,
        },
    });

    const mentee5 = await prisma.user.create({
        data: {
            email: "emma.davis@example.com",
            password: hashedPassword,
            firstName: "Emma",
            lastName: "Davis",
            graduationYear: 2024,
            degree: "Bachelor's",
            major: "Computer Engineering",
            currentCompany: "InnovateLabs",
            currentPosition: "Software Engineering Intern",
            location: "Denver, CO",
            bio: "Recent graduate starting my software engineering career. Excited to learn from experienced professionals and grow my skills.",
            isVerified: true,
        },
    });

    // Create more mentorship pairs with different scenarios
    const mentorship4 = await prisma.mentorshipPair.create({
        data: {
            mentorId: user3.id,
            menteeId: mentee4.id,
            status: "ACCEPTED",
            message:
                "Hi Mike! I'm looking to transition from data analysis to data science leadership. Your experience in entrepreneurship would be invaluable.",
            acceptedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        },
    });

    const mentorship5 = await prisma.mentorshipPair.create({
        data: {
            mentorId: user1.id,
            menteeId: mentee5.id,
            status: "ACCEPTED",
            message:
                "Hello John! I'm a recent graduate working as an intern and would love guidance on starting my software engineering career.",
            acceptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
    });

    // Create more sessions
    await prisma.session.create({
        data: {
            pairId: mentorship4.id,
            title: "Entrepreneurship and Leadership",
            description:
                "Discussing leadership skills and entrepreneurial mindset for data professionals.",
            scheduledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            duration: 60,
            status: "COMPLETED",
            completedAt: new Date(
                Date.now() - 15 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
            ),
        },
    });

    await prisma.session.create({
        data: {
            pairId: mentorship5.id,
            title: "Software Engineering Career Path",
            description:
                "Planning career development and discussing best practices for new engineers.",
            scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            duration: 60,
            status: "SCHEDULED",
        },
    });

    // Create feedback for completed sessions
    const completedSession1 = await prisma.session.findFirst({
        where: { pairId: mentorship1.id, status: "COMPLETED" },
    });

    if (completedSession1) {
        await prisma.feedback.create({
            data: {
                sessionId: completedSession1.id,
                authorId: mentee1.id,
                rating: 5,
                comments:
                    "John was incredibly helpful! He shared great insights about React best practices and gave me actionable feedback on my code. Looking forward to our next session!",
                isPublic: true,
            },
        });
    }

    const completedSession2 = await prisma.session.findFirst({
        where: { pairId: mentorship2.id, status: "COMPLETED" },
    });

    if (completedSession2) {
        await prisma.feedback.create({
            data: {
                sessionId: completedSession2.id,
                authorId: mentee3.id,
                rating: 5,
                comments:
                    "Jane provided excellent guidance on career transitions. Her insights about product management were very valuable and helped me understand the field better.",
                isPublic: true,
            },
        });
    }

    console.log("✅ Database seeded successfully!");
    console.log("📧 Sample users created with email/password:");
    console.log(
        "   john.doe@example.com / password123 (Mentor - Software Engineer)"
    );
    console.log(
        "   jane.smith@example.com / password123 (Mentor - Business Consultant)"
    );
    console.log(
        "   mike.johnson@example.com / password123 (Mentor - Marketing Director)"
    );
    console.log(
        "   sarah.wilson@example.com / password123 (Mentee - Junior Developer)"
    );
    console.log(
        "   alex.chen@example.com / password123 (Mentee - Software Developer)"
    );
    console.log(
        "   lisa.brown@example.com / password123 (Mentee - Business Analyst)"
    );
    console.log(
        "   david.kim@example.com / password123 (Mentee - Data Analyst)"
    );
    console.log("   emma.davis@example.com / password123 (Mentee - Intern)");
    console.log("🎯 Mentorship data created:");
    console.log("   - 3 Active mentor profiles");
    console.log("   - 4 Accepted mentorship pairs");
    console.log("   - 1 Pending mentorship request");
    console.log("   - 7 Scheduled/completed sessions");
    console.log("   - 2 Feedback reviews");
    console.log(
        "🚀 Visit http://localhost:3001/mentorship to explore the mentorship system!"
    );
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
