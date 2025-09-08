const { PrismaClient } = require("@prisma/client");

async function createMultipleCampaignProposals() {
    const prisma = new PrismaClient();

    try {
        console.log("Creating multiple test campaign proposals...");

        // Get test users
        const users = await prisma.user.findMany({
            where: {
                role: "ALUMNI",
            },
            take: 3,
        });

        if (users.length < 3) {
            console.log(
                "Need at least 3 users. Please create more test users first."
            );
            return;
        }

        // Get admin user for approvals
        const adminUser = await prisma.user.findFirst({
            where: {
                role: "ADMIN",
            },
        });

        const proposals = [
            {
                title: "BRACU Alumni Emergency Relief Fund",
                description:
                    "Supporting alumni facing financial hardships due to unexpected circumstances. This fund will provide immediate assistance for medical emergencies, natural disasters, and other urgent situations affecting our alumni community.",
                goalAmountCents: 2500000, // $25,000
                status: "PENDING",
                organizerId: users[0].id,
            },
            {
                title: "BRACU Career Development Workshop Series",
                description:
                    "A comprehensive series of workshops covering resume building, interview skills, networking strategies, and career transitions. Open to all alumni and current students to enhance professional development opportunities.",
                goalAmountCents: 1500000, // $15,000
                status: "APPROVED",
                organizerId: users[1].id,
                approvedBy: adminUser?.id,
                approvedAt: new Date(),
            },
            {
                title: "BRACU Alumni Mentorship Program Expansion",
                description:
                    "Expanding our successful mentorship program to connect more alumni with current students. This initiative will create structured mentorship opportunities across all departments and career levels.",
                goalAmountCents: 1000000, // $10,000
                status: "DRAFT",
                organizerId: users[2].id,
            },
            {
                title: "BRACU Alumni Sports Complex Renovation",
                description:
                    "Renovating the university sports facilities to provide better recreational opportunities for current students and alumni events. This includes updating equipment, improving facilities, and creating spaces for alumni gatherings.",
                goalAmountCents: 7500000, // $75,000
                status: "REJECTED",
                organizerId: users[0].id,
                approvedBy: adminUser?.id,
                approvedAt: new Date(),
                rejectionReason:
                    "Budget exceeds current fundraising capacity. Consider breaking into smaller, targeted campaigns.",
            },
            {
                title: "BRACU Alumni Research Grant Program",
                description:
                    "Supporting alumni pursuing advanced research and academic projects. This program will provide grants for research materials, conference attendance, and publication costs to help alumni advance their academic careers.",
                goalAmountCents: 3000000, // $30,000
                status: "PENDING",
                organizerId: users[1].id,
            },
        ];

        console.log("Creating campaign proposals...\n");

        for (let i = 0; i < proposals.length; i++) {
            const proposal = proposals[i];
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 3 + i); // Different end dates

            const createdProposal = await prisma.fundraisingCampaign.create({
                data: {
                    ...proposal,
                    currency: "USD",
                    endDate: endDate,
                    coverImage: `/images/campaigns/proposal-${i + 1}.jpg`,
                    isActive: proposal.status === "APPROVED",
                },
                include: {
                    organizer: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });

            console.log(`✅ Created: ${createdProposal.title}`);
            console.log(`   Status: ${createdProposal.status}`);
            console.log(
                `   Goal: $${(
                    createdProposal.goalAmountCents / 100
                ).toLocaleString()}`
            );
            console.log(
                `   Organizer: ${createdProposal.organizer.firstName} ${createdProposal.organizer.lastName}`
            );
            if (createdProposal.rejectionReason) {
                console.log(
                    `   Rejection Reason: ${createdProposal.rejectionReason}`
                );
            }
            console.log("");
        }

        console.log("🎉 All campaign proposals created successfully!");
        console.log("\n📊 Summary:");
        console.log("   • 2 PENDING proposals (awaiting admin review)");
        console.log("   • 1 APPROVED proposal (active and visible to donors)");
        console.log("   • 1 DRAFT proposal (saved but not submitted)");
        console.log("   • 1 REJECTED proposal (with feedback)");
        console.log("\n🔗 Test the system:");
        console.log("   1. Visit /donations to see approved campaigns");
        console.log("   2. Visit /admin/donations to manage pending proposals");
        console.log("   3. Visit /dashboard/proposals to see your proposals");
    } catch (error) {
        console.error("❌ Error creating campaign proposals:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createMultipleCampaignProposals();
