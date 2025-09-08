const { PrismaClient } = require("@prisma/client");

async function manageCampaignProposals() {
    const prisma = new PrismaClient();

    try {
        console.log("Managing campaign proposals...\n");

        // Get admin user
        const adminUser = await prisma.user.findFirst({
            where: {
                role: "ADMIN",
            },
        });

        if (!adminUser) {
            console.log(
                "❌ No admin user found. Please create an admin user first."
            );
            return;
        }

        console.log("👤 Admin:", adminUser.firstName, adminUser.lastName);

        // Get all pending proposals
        const pendingProposals = await prisma.fundraisingCampaign.findMany({
            where: {
                status: "PENDING",
            },
            include: {
                organizer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (pendingProposals.length === 0) {
            console.log("📝 No pending proposals found.");
            console.log(
                "💡 Create some test proposals first using: node create-test-campaign-proposals.js"
            );
            return;
        }

        console.log(
            `📋 Found ${pendingProposals.length} pending proposal(s):\n`
        );

        // Display pending proposals
        pendingProposals.forEach((proposal, index) => {
            console.log(`${index + 1}. ${proposal.title}`);
            console.log(
                `   Goal: $${(proposal.goalAmountCents / 100).toLocaleString()}`
            );
            console.log(
                `   Organizer: ${proposal.organizer.firstName} ${proposal.organizer.lastName}`
            );
            console.log(
                `   Created: ${proposal.createdAt.toLocaleDateString()}`
            );
            console.log("");
        });

        // Auto-approve the first proposal
        if (pendingProposals.length > 0) {
            const firstProposal = pendingProposals[0];

            console.log("✅ Auto-approving first proposal...");
            const approvedProposal = await prisma.fundraisingCampaign.update({
                where: { id: firstProposal.id },
                data: {
                    status: "APPROVED",
                    approvedBy: adminUser.id,
                    approvedAt: new Date(),
                    isActive: true,
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

            console.log(`🎉 Approved: ${approvedProposal.title}`);
            console.log(`   Status: ${approvedProposal.status}`);
            console.log(
                `   Approved by: ${adminUser.firstName} ${adminUser.lastName}`
            );
            console.log(`   Active: ${approvedProposal.isActive}`);
        }

        // Auto-reject the second proposal (if exists)
        if (pendingProposals.length > 1) {
            const secondProposal = pendingProposals[1];

            console.log("\n❌ Auto-rejecting second proposal...");
            const rejectionReason =
                "Proposal needs more specific details about fund allocation and impact measurement.";

            const rejectedProposal = await prisma.fundraisingCampaign.update({
                where: { id: secondProposal.id },
                data: {
                    status: "REJECTED",
                    approvedBy: adminUser.id,
                    approvedAt: new Date(),
                    rejectionReason: rejectionReason,
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

            console.log(`🚫 Rejected: ${rejectedProposal.title}`);
            console.log(`   Status: ${rejectedProposal.status}`);
            console.log(`   Reason: ${rejectedProposal.rejectionReason}`);
        }

        // Show final status summary
        console.log("\n📊 Final Status Summary:");

        const allProposals = await prisma.fundraisingCampaign.findMany({
            where: {
                status: {
                    in: ["PENDING", "APPROVED", "REJECTED"],
                },
            },
            select: {
                status: true,
            },
        });

        const statusCounts = allProposals.reduce((acc, proposal) => {
            acc[proposal.status] = (acc[proposal.status] || 0) + 1;
            return acc;
        }, {});

        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`   ${status}: ${count} proposal(s)`);
        });

        console.log("\n🔗 Next Steps:");
        console.log("   • Visit /donations to see approved campaigns");
        console.log(
            "   • Visit /admin/donations to review remaining pending proposals"
        );
        console.log(
            "   • Use the web interface to manually approve/reject proposals"
        );
    } catch (error) {
        console.error("❌ Error managing campaign proposals:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

manageCampaignProposals();
