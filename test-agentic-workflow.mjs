#!/usr/bin/env node

/**
 * Simple test script for the Agentic Question Generation Workflow
 * 
 * This tests the basic functionality without running the full server
 */

import { QuestionType, DifficultyLevel } from './dist/models/question.js';

console.log('🚀 Testing Agentic Question Generation Workflow');
console.log('='.repeat(50));

// Test parameters
const testParams = {
    type: QuestionType.ADDITION,
    difficulty: DifficultyLevel.EASY,  
    grade: 3,
    count: 2
};

console.log('Test Parameters:');
console.log(`- Type: ${testParams.type}`);
console.log(`- Difficulty: ${testParams.difficulty}`);
console.log(`- Grade: ${testParams.grade}`);
console.log(`- Count: ${testParams.count}`);
console.log();

try {
    // Import and test the agentic service
    const { AgenticQuestionService } = await import('./dist/services/agentic-question.service.js');
    
    console.log('✅ Successfully imported AgenticQuestionService');
    
    const agenticService = new AgenticQuestionService();
    console.log('✅ Successfully instantiated agentic service');
    
    // Get workflow info
    const workflowInfo = agenticService.getWorkflowInfo();
    console.log('\n📊 Workflow Information:');
    console.log('Agents:', workflowInfo.agents.join(', '));
    console.log('Vector DB Integration:', workflowInfo.vectorDatabaseIntegration);
    console.log('Capabilities:', workflowInfo.capabilities.length, 'total');
    
    console.log('\n🔄 Generating questions using agentic workflow...');
    
    const startTime = Date.now();
    const result = await agenticService.generateQuestions(testParams);
    const totalTime = Date.now() - startTime;
    
    console.log(`⏱️  Generation completed in ${totalTime}ms`);
    console.log();
    
    // Display results
    console.log('📋 RESULTS:');
    console.log('='.repeat(30));
    
    if (result.questions.length > 0) {
        console.log(`✅ Generated ${result.questions.length} questions successfully`);
        
        result.questions.forEach((q, index) => {
            console.log(`\nQuestion ${index + 1}:`);
            console.log(`  Text: "${q.question}"`);
            console.log(`  Answer: ${q.answer}`);
            console.log(`  Explanation: ${q.explanation}`);
            console.log(`  Model Used: ${q.metadata?.modelUsed || 'Unknown'}`);
            console.log(`  Generation Time: ${q.metadata?.generationTime || 0}ms`);
            console.log(`  Vector Context: ${q.metadata?.vectorContext ? '✅' : '❌'}`);
        });
        
        // Display workflow metadata
        console.log('\n🔍 Workflow Analysis:');
        console.log('Quality Checks:');
        console.log(`  - Mathematical Accuracy: ${result.metadata.qualityChecks.mathematicalAccuracy ? '✅' : '❌'}`);
        console.log(`  - Age Appropriateness: ${result.metadata.qualityChecks.ageAppropriateness ? '✅' : '❌'}`);
        console.log(`  - Pedagogical Soundness: ${result.metadata.qualityChecks.pedagogicalSoundness ? '✅' : '❌'}`);
        console.log(`  - Diversity Score: ${(result.metadata.qualityChecks.diversityScore * 100).toFixed(1)}%`);
        
        console.log('\nVector Database:');
        console.log(`  - Context Used: ${result.metadata.vectorContext.used ? '✅' : '❌'}`);
        console.log(`  - Similar Questions Found: ${result.metadata.vectorContext.similarQuestionsFound}`);
        console.log(`  - Curriculum Alignment: ${result.metadata.vectorContext.curriculumAlignment ? '✅' : '❌'}`);
        
        if (result.metadata.workflow.agentPerformance) {
            console.log('\nAgent Performance:');
            Object.entries(result.metadata.workflow.agentPerformance).forEach(([agent, percentage]) => {
                console.log(`  - ${agent}: ${percentage.toFixed(1)}% of total time`);
            });
        }
        
        if (result.metadata.workflow.errors.length > 0) {
            console.log('\n⚠️  Workflow Errors:');
            result.metadata.workflow.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        if (result.metadata.workflow.warnings.length > 0) {
            console.log('\n⚠️  Workflow Warnings:');
            result.metadata.workflow.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        if (result.metadata.enhancedQuestions && result.metadata.enhancedQuestions.length > 0) {
            console.log('\n🎨 Enhanced Questions:');
            result.metadata.enhancedQuestions.forEach((eq, index) => {
                console.log(`  Question ${index + 1}:`);
                console.log(`    Original: "${eq.originalText}"`);
                console.log(`    Enhanced: "${eq.enhancedText}"`);
                console.log(`    Context Type: ${eq.contextType}`);
                console.log(`    Engagement Score: ${(eq.engagementScore * 100).toFixed(1)}%`);
            });
        }
        
    } else {
        console.log('❌ No questions generated');
        
        if (result.metadata.workflow.errors.length > 0) {
            console.log('\nErrors:');
            result.metadata.workflow.errors.forEach(error => console.log(`  - ${error}`));
        }
    }
    
    console.log('\n🎉 Agentic workflow test completed successfully!');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}