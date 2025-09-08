// Test event creation to verify the fix
const testEventCreation = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // You'll need to add proper authentication headers here
                Authorization: "Bearer YOUR_JWT_TOKEN",
            },
            body: JSON.stringify({
                title: "Test Event",
                description: "Test Description",
                location: "Test Location",
                virtual: true,
                type: "workshop",
                startDate: "2025-09-09T02:15:00.000Z",
                endDate: "2025-09-10T13:00:00.000Z",
                maxAttendees: 55,
                price: 500,
            }),
        });

        const result = await response.json();
        console.log("Response status:", response.status);
        console.log("Response body:", result);
    } catch (error) {
        console.error("Test failed:", error);
    }
};

// Note: This test requires authentication
console.log(
    "Test script created. Run this after setting up proper authentication."
);
console.log('The main issue with "type" field should now be resolved.');
