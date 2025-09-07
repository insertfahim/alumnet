// Quick test to verify mentorship data
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testMentorshipData() {
    console.log("🧪 Testing mentorship data...");

    try {
        // Test mentor profiles
        const mentors = await prisma.mentorProfile.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        currentPosition: true,
                        currentCompany: true,
                    },
                },
            },
        });

        console.log(`✅ Found ${mentors.length} mentor profiles:`);
        mentors.forEach((mentor, index) => {
            console.log(
                `   ${index + 1}. ${mentor.user.firstName} ${
                    mentor.user.lastName
                } - ${mentor.user.currentPosition} at ${
                    mentor.user.currentCompany
                }`
            );
            console.log(
                `      Skills: ${mentor.skills.slice(0, 3).join(", ")}${
                    mentor.skills.length > 3 ? "..." : ""
                }`
            );
            console.log(`      Rate: $${mentor.hourlyRate}/hour`);
        });

        // Test mentorship pairs
        const mentorships = await prisma.mentorshipPair.findMany({
            include: {
                mentor: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                mentee: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                sessions: true,
            },
        });

        console.log(`\n✅ Found ${mentorships.length} mentorship pairs:`);
        mentorships.forEach((pair, index) => {
            console.log(
                `   ${index + 1}. ${pair.mentee.firstName} ${
                    pair.mentee.lastName
                } ↔ ${pair.mentor.firstName} ${pair.mentor.lastName}`
            );
            console.log(`      Status: ${pair.status}`);
            console.log(`      Sessions: ${pair.sessions.length}`);
        });

        // Test sessions
        const sessions = await prisma.mentorshipSession.findMany({
            include: {
                pair: {
                    include: {
                        mentor: { select: { firstName: true, lastName: true } },
                        mentee: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });

        console.log(`\n✅ Found ${sessions.length} sessions:`);
        sessions.forEach((session, index) => {
            console.log(
                `   ${index + 1}. "${session.title}" - ${session.status}`
            );
            console.log(
                `      With: ${session.pair.mentee.firstName} ${session.pair.mentee.lastName} & ${session.pair.mentor.firstName} ${session.pair.mentor.lastName}`
            );
            console.log(
                `      Scheduled: ${session.scheduledAt.toLocaleDateString()}`
            );
        });

        console.log("\n🎉 All mentorship data verified successfully!");
    } catch (error) {
        console.error("❌ Error testing mentorship data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testMentorshipData();
