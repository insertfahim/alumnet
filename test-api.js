// Test the alumni API endpoint
async function testAlumniAPI() {
    try {
        console.log("Testing alumni API...");
        const response = await fetch("http://localhost:3001/api/alumni");

        if (!response.ok) {
            console.log("API response not ok:", response.status);
            return;
        }

        const data = await response.json();
        console.log("API Response:");
        console.log("Number of alumni:", data.length);

        if (data.length > 0) {
            console.log("First alumni:", data[0]);
        } else {
            console.log("No alumni found in database");
        }
    } catch (error) {
        console.error("Error testing API:", error);
    }
}

testAlumniAPI();
