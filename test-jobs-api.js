// Test script to check jobs API endpoints
async function testJobsAPI() {
    try {
        console.log("Testing jobs API endpoint...");

        const response = await fetch("http://localhost:3001/api/jobs");

        if (!response.ok) {
            console.log("API response not ok:", response.status);
            const errorText = await response.text();
            console.log("Error:", errorText);
            return;
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.jobs) {
            console.log(`Found ${data.jobs.length} jobs`);
            data.jobs.forEach((job) => {
                console.log(
                    `- ${job.title} at ${job.company} (Posted by: ${job.postedBy.firstName} ${job.postedBy.lastName})`
                );
            });
        } else {
            console.log("No jobs array in response");
        }
    } catch (error) {
        console.error("API Error:", error);
    }
}

testJobsAPI();
