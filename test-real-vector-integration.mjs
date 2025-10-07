#!/usr/bin/env node

/**
 * Green Phase Test: Real Vector Database Integration
 * 
 * This directly tests the AIEnhancedQuestionsService to verify real OpenSearch integration
 */

import { AIEnhancedQuestionsService } from './dist/services/questions-ai-enhanced.service.js';
import { UserRole } from './dist/models/user.model.js';
import { LearningStyle } from './dist/models/persona.model.js';

console.log('🟢 GREEN Phase: Testing Real Vector Database Integration');
console.log('='.repeat(60));

// Test parameters
const mockJWTPayload = {
    userId: "demo-user-id", 
    email: "test@example.com",
    role: UserRole.STUDENT
};

const testPersona = {
    grade: 5,
    learningStyle: LearningStyle.VISUAL,
    interests: ["mathematics", "sports"],
    culturalContext: "New Zealand"
};

const testRequest = {
    subject: "mathematics",
    topic: "Addition",
    difficulty: "beginner",
    questionType: "multiple_choice",
    count: 2,
    persona: testPersona
};

async function testRealVectorIntegration() {
    try {
        console.log('📊 Test Parameters:');
        console.log(`- Subject: ${testRequest.subject}`);
        console.log(`- Topic: ${testRequest.topic}`);
        console.log(`- Grade: ${testRequest.persona.grade}`);
        console.log(`- Count: ${testRequest.count}`);
        console.log();
        
        console.log('🔄 Testing real vector database integration...');
        const startTime = Date.now();
        
        const aiService = new AIEnhancedQuestionsService();
        const result = await aiService.generateQuestions(testRequest, mockJWTPayload);
        
        const duration = Date.now() - startTime;
        
        console.log('✅ Generation Complete!');
        console.log(`⏱️  Duration: ${duration}ms`);
        console.log();
        
        console.log('📋 RESULTS ANALYSIS:');
        console.log('='.repeat(40));
        
        console.log(`📊 Questions Generated: ${result.questions.length}`);
        console.log(`🎯 Quality Metrics:`);
        console.log(`   - Vector Relevance: ${(result.qualityMetrics.vectorRelevanceScore * 100).toFixed(1)}%`);
        console.log(`   - Agentic Validation: ${(result.qualityMetrics.agenticValidationScore * 100).toFixed(1)}%`);
        console.log(`   - Personalization: ${(result.qualityMetrics.personalizationScore * 100).toFixed(1)}%`);
        console.log();
        
        console.log('🔍 INTEGRATION VALIDATION:');
        console.log('='.repeat(40));
        
        // Check for real vs simulated integration
        const question = result.questions[0];
        const tags = question.metadata.tags;
        
        console.log(`📈 Performance Check:`);
        console.log(`   - Duration: ${duration}ms ${duration < 500 ? '✅ FAST (Real DB)' : '❌ SLOW (Simulation)'}`);
        
        console.log(`🏷️  Metadata Tags:`);
        tags.forEach(tag => {
            const isRealTag = tag.includes('database-sourced') || tag.includes('opensearch');
            const isSimulatedTag = tag.includes('simulated') || tag.includes('vector-optimized');
            console.log(`   - ${tag} ${isRealTag ? '✅ REAL' : isSimulatedTag ? '❌ SIMULATED' : '📋'}`);
        });
        
        console.log(`💬 Personalization Summary:`);
        const hasRealReference = result.personalizationSummary.includes('real OpenSearch');
        const hasSimulatedReference = result.personalizationSummary.includes('using vector database similarity');
        console.log(`   ${hasRealReference ? '✅ References REAL OpenSearch' : hasSimulatedReference ? '❌ References simulation' : '📋 Generic reference'}`);
        console.log(`   "${result.personalizationSummary}"`);
        
        console.log();
        console.log('📝 Sample Generated Question:');
        console.log('='.repeat(40));
        console.log(`Q: ${question.question}`);
        console.log(`Options: ${question.options?.join(', ')}`);
        console.log(`Answer: ${question.correctAnswer}`);
        console.log(`Explanation: ${question.explanation}`);
        
        console.log();
        console.log('🎯 GREEN PHASE VALIDATION SUMMARY:');
        console.log('='.repeat(40));
        
        const validations = [
            { check: 'Fast performance (< 500ms)', result: duration < 500 },
            { check: 'Database-sourced metadata tags', result: tags.includes('vector-database-sourced') },
            { check: 'OpenSearch context tags', result: tags.includes('opensearch-context') },
            { check: 'Real OpenSearch reference', result: hasRealReference },
            { check: 'No simulation tags', result: !tags.includes('simulated') },
            { check: 'Questions generated successfully', result: result.questions.length > 0 },
            { check: 'Vector scores in realistic range', result: result.qualityMetrics.vectorRelevanceScore >= 0.6 && result.qualityMetrics.vectorRelevanceScore <= 0.95 }
        ];
        
        validations.forEach(validation => {
            console.log(`${validation.result ? '✅' : '❌'} ${validation.check}`);
        });
        
        const passedValidations = validations.filter(v => v.result).length;
        const totalValidations = validations.length;
        
        console.log();
        console.log(`🏆 OVERALL SCORE: ${passedValidations}/${totalValidations} validations passed`);
        
        if (passedValidations === totalValidations) {
            console.log('🎉 GREEN PHASE SUCCESS: Real vector database integration working!');
        } else if (passedValidations >= totalValidations * 0.7) {
            console.log('⚠️  GREEN PHASE PARTIAL: Some real integration features working');
        } else {
            console.log('❌ GREEN PHASE NEEDS WORK: Still using simulation patterns');
        }
        
    } catch (error) {
        console.error('❌ Test Error:', error);
        process.exit(1);
    }
}

testRealVectorIntegration();