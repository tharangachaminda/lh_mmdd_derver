// Mock for OpenSearch service
export default {
    searchEnhancedQuestions: jest.fn().mockImplementation(async () => [
        {
            id: "test-1",
            score: 0.95,
            question: "What is 12 + 8?",
            difficulty: "medium",
            grade: 5,
            type: "addition",
            subject: "mathematics",
        },
        {
            id: "test-2",
            score: 0.87,
            question: "Calculate 15 + 25",
            difficulty: "medium",
            grade: 5,
            type: "addition",
            subject: "mathematics",
        },
        {
            id: "test-3",
            score: 0.78,
            question: "Find the sum of 9 and 11",
            difficulty: "easy",
            grade: 5,
            type: "addition",
            subject: "mathematics",
        },
    ]),
};
