const fetch = require("node-fetch");

async function testCreateCampaign() {
    try {
        console.log("Testing campaign creation API...");

        const response = await fetch(
            "http://localhost:3001/api/admin/newsletter/campaigns",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Note: This would need a valid token in a real test
                    // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
                },
                body: JSON.stringify({
                    title: "Test Campaign from API",
                    subject: "Test Subject",
                    content:
                        "<h1>Test Content</h1><p>This is a test campaign.</p>",
                    category: "general",
                    scheduledFor: null,
                }),
            }
        );

        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testCreateCampaign();
