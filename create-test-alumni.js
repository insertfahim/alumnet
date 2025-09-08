const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function createTestAlumni() {
    const prisma = new PrismaClient();

    try {
        console.log("Creating test alumni users...");

        const hashedPassword = await bcrypt.hash("password123", 12);

        const alumni = [
            {
                email: "fahima.rahman@bracu.ac.bd",
                firstName: "Fahima",
                lastName: "Rahman",
                graduationYear: 2020,
                degree: "Bachelor's",
                major: "Computer Science and Engineering",
                currentCompany: "Samsung R&D Institute Bangladesh",
                currentPosition: "Software Engineer",
                location: "Dhaka, Bangladesh",
                bio: "BRACU CSE graduate passionate about mobile app development and AI. Currently working on innovative tech solutions in Bangladesh.",
                isVerified: true,
                role: "ALUMNI",
            },
            {
                email: "rafiq.ahmed@bracu.ac.bd",
                firstName: "Rafiq",
                lastName: "Ahmed",
                graduationYear: 2018,
                degree: "Master's",
                major: "Business Administration",
                currentCompany: "BRAC Bank Limited",
                currentPosition: "Assistant Vice President",
                location: "Dhaka, Bangladesh",
                bio: "BRAC Business School graduate with expertise in financial services and digital banking solutions.",
                isVerified: true,
                role: "ALUMNI",
            },
            {
                email: "sadia.akter@bracu.ac.bd",
                firstName: "Sadia",
                lastName: "Akter",
                graduationYear: 2019,
                degree: "Master's",
                major: "Public Health",
                currentCompany: "World Health Organization",
                currentPosition: "Public Health Consultant",
                location: "Geneva, Switzerland",
                bio: "BRACU JPGSPH graduate working on global health initiatives. Specializing in epidemiology and health policy.",
                isVerified: true,
                role: "ALUMNI",
            },
            {
                email: "arif.hassan@bracu.ac.bd",
                firstName: "Arif",
                lastName: "Hassan",
                graduationYear: 2017,
                degree: "Bachelor's",
                major: "Architecture",
                currentCompany: "Shatotto Architecture",
                currentPosition: "Senior Architect",
                location: "Dhaka, Bangladesh",
                bio: "BRACU School of Architecture graduate passionate about sustainable design and urban planning in Bangladesh.",
                isVerified: true,
                role: "ALUMNI",
            },
            {
                email: "maria.islam@bracu.ac.bd",
                firstName: "Maria",
                lastName: "Islam",
                graduationYear: 2021,
                degree: "Bachelor's",
                major: "English and Humanities",
                currentCompany: "The Daily Star",
                currentPosition: "Staff Reporter",
                location: "Dhaka, Bangladesh",
                bio: "BRACU English graduate working in journalism. Covering social issues and development stories in Bangladesh.",
                isVerified: true,
                role: "ALUMNI",
            },
        ];

        for (const userData of alumni) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email },
            });

            if (!existingUser) {
                const user = await prisma.user.create({
                    data: {
                        ...userData,
                        password: hashedPassword,
                    },
                });
                console.log(`Created user: ${user.firstName} ${user.lastName}`);
            } else {
                console.log(
                    `User already exists: ${userData.firstName} ${userData.lastName}`
                );
            }
        }

        // Count total alumni
        const totalAlumni = await prisma.user.count({
            where: { role: "ALUMNI" },
        });

        console.log(`\nTotal alumni in database: ${totalAlumni}`);
    } catch (error) {
        console.error("Error creating test alumni:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestAlumni();
