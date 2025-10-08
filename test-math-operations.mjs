/**
 * Test script for mathematical operation question generation
 * Tests addition, subtraction, multiplication, and division
 */

import { AIEnhancedQuestionsService } from './dist/services/questions-ai-enhanced.service.js';

// Create service instance
const service = new AIEnhancedQuestionsService();

// Test persona
const testPersona = {
    userId: 'test-user',
    grade: 5,
    learningStyle: 'visual',
    interests: ['Sports', 'Animals'],
    culturalContext: 'New Zealand',
    strengths: ['mathematics']
};

// Mock JWT payload (use demo-user-id for testing without DB)
const mockJWT = {
    userId: 'demo-user-id',
    email: 'demo@example.com',
    role: 'student',
    grade: 5,
    country: 'New Zealand'
};

console.log('🧪 Testing Mathematical Operations Question Generation\n');
console.log('=' .repeat(60));

// Test each operation
const operations = [
    { subject: 'mathematics', topic: 'Addition', questionType: 'multiple_choice' },
    { subject: 'mathematics', topic: 'Subtraction', questionType: 'multiple_choice' },
    { subject: 'mathematics', topic: 'Multiplication', questionType: 'multiple_choice' },
    { subject: 'mathematics', topic: 'Division', questionType: 'multiple_choice' }
];

for (const operation of operations) {
    console.log(`\n📝 Testing: ${operation.topic}`);
    console.log('-'.repeat(60));
    
    try {
        const request = {
            subject: operation.subject,
            topic: operation.topic,
            difficulty: 'easy',
            questionType: operation.questionType,
            count: 3,
            persona: testPersona
        };

        const result = await service.generateQuestions(request, mockJWT);

        console.log(`✅ Generated ${result.questions.length} questions for ${operation.topic}`);
        
        // Display sample questions
        result.questions.forEach((q, idx) => {
            console.log(`\n  Question ${idx + 1}: ${q.question}`);
            console.log(`  Options: ${q.options?.join(', ') || 'N/A'}`);
            console.log(`  Correct Answer: ${q.correctAnswer}`);
            
            // Verify answer is in options
            if (q.options && !q.options.includes(q.correctAnswer)) {
                console.log(`  ⚠️  WARNING: Correct answer "${q.correctAnswer}" not in options!`);
            } else {
                console.log(`  ✓ Correct answer is in options`);
            }
        });

        console.log(`\n  Quality Metrics:`);
        console.log(`    - Vector Relevance: ${(result.qualityMetrics.vectorRelevanceScore * 100).toFixed(1)}%`);
        console.log(`    - Validation Score: ${(result.qualityMetrics.agenticValidationScore * 100).toFixed(1)}%`);
        console.log(`    - Personalization: ${(result.qualityMetrics.personalizationScore * 100).toFixed(1)}%`);

    } catch (error) {
        console.error(`❌ Error testing ${operation.topic}:`, error.message);
    }
}

console.log('\n' + '='.repeat(60));
console.log('🎉 Test Complete!');
console.log('\nExpected Results:');
console.log('  ✓ All questions should have mathematical expressions');
console.log('  ✓ Correct answers should be calculated from the question');
console.log('  ✓ Correct answers should be present in the options');
console.log('  ✓ No "Option A, Option B" fallback answers');
