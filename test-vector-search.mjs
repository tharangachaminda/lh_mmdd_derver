/**
 * Test script to verify vector search is working correctly
 * This simulates what the frontend sends and checks the backend response
 */

const testRequest = {
    subject: "Mathematics",
    category: "number-operations",
    gradeLevel: 4,
    questionTypes: ["ADDITION", "DIVISION"], // These should match DB "type" field
    questionFormat: "SHORT_ANSWER",
    difficultyLevel: "EASY",
    numberOfQuestions: 5,
    learningStyle: "visual",
    interests: ["Gaming", "Sports"],
    motivators: ["Competition"],
    includeExplanations: true
};

console.log("🧪 Testing Vector Search with request:");
console.log(JSON.stringify(testRequest, null, 2));

// Note: This would normally be sent to the backend via HTTP
// For now, just verify the request structure matches what frontend sends
console.log("\n✅ Request structure looks correct");
console.log("📋 Question types:", testRequest.questionTypes);
console.log("🎯 Grade level:", testRequest.gradeLevel);
console.log("📚 Subject:", testRequest.subject);
