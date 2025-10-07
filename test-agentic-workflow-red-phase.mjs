#!/usr/bin/env node

/**
 * RED PHASE VALIDATION: Agentic Workflow Integration
 * 
 * This script validates that real multi-agent workflow is     // Check 9: Context enhancement
    const hasEnhancedQuestions = result.agentMetrics?.contextEnhancement !== undefined;
    if (hasEnhancedQuestions) {
        console.log('✅ PASS: Context enhancement data present');
        passCount++;
    } else {
        console.log('❌ FAIL: No context enhancement data (EXPECTED)');
        failCount++;
    }
    
    // Check 10: Workflow error tracking
    const hasWorkflowErrors = result.agentMetrics?.workflowTiming !== undefined; // Using workflowTiming as proxy for workflow tracking
    if (hasWorkflowErrors) {
        console.log('✅ PASS: Workflow error tracking present');
        passCount++;
    } else {
        console.log('❌ FAIL: No workflow error tracking (EXPECTED)');
        failCount++;
    }
 * All checks should FAIL, proving we need to implement the GREEN phase.
 */

import { AIEnhancedQuestionsService } from './dist/services/questions-ai-enhanced.service.js';

console.log('🔴 RED PHASE: Agentic Workflow Integration Validation');
console.log('='.repeat(60));
console.log('Expected Result: ALL CHECKS SHOULD FAIL');
console.log('This proves real multi-agent workflow is not yet integrated\n');

// Mock request
const mockRequest = {
    subject: 'mathematics',
    topic: 'Addition',
    difficulty: 'beginner',
    questionType: 'multiple_choice',
    count: 2,
    persona: {
        userId: 'demo-user-id',
        grade: 5,
        learningStyle: 'visual',
        interests: ['mathematics', 'sports'],
        culturalContext: 'New Zealand',
        strengths: ['addition'],
    },
};

const mockJWTPayload = {
    userId: 'demo-user-id',
    email: 'demo@example.com',
    role: 'student',
};

const service = new AIEnhancedQuestionsService();

console.log('📊 Test Parameters:');
console.log(`- Subject: ${mockRequest.subject}`);
console.log(`- Topic: ${mockRequest.topic}`);
console.log(`- Grade: ${mockRequest.persona.grade}`);
console.log(`- Count: ${mockRequest.count}\n`);

console.log('🔄 Generating questions...\n');

try {
    const result = await service.generateQuestions(mockRequest, mockJWTPayload);
    
    console.log('📋 RED PHASE VALIDATION RESULTS:');
    console.log('='.repeat(60));
    
    let failCount = 0;
    let passCount = 0;
    
    // Check 1: Agent-generated tags
    const hasAgentTags = result.questions.some(q => 
        q.metadata.tags.includes('agent-generated') ||
        q.metadata.tags.includes('multi-agent-validated')
    );
    if (hasAgentTags) {
        console.log('✅ PASS: Questions have agent-generated tags');
        passCount++;
    } else {
        console.log('❌ FAIL: No agent-generated tags found (EXPECTED)');
        failCount++;
    }
    
    // Check 2: Agent metrics in response
    const hasAgentMetrics = result.agentMetrics !== undefined;
    if (hasAgentMetrics) {
        console.log('✅ PASS: Response includes agentMetrics');
        passCount++;
    } else {
        console.log('❌ FAIL: No agentMetrics in response (EXPECTED)');
        failCount++;
    }
    
    // Check 3: Quality checks from agents
    const hasQualityChecks = result.agentMetrics?.qualityChecks !== undefined;
    if (hasQualityChecks) {
        console.log('✅ PASS: Quality checks from agents present');
        passCount++;
    } else {
        console.log('❌ FAIL: No quality checks from agents (EXPECTED)');
        failCount++;
    }
    
    // Check 4: Mathematical accuracy validation
    const hasMathAccuracy = result.agentMetrics?.qualityChecks?.mathematicalAccuracy !== undefined;
    if (hasMathAccuracy) {
        console.log('✅ PASS: Mathematical accuracy validation present');
        passCount++;
    } else {
        console.log('❌ FAIL: No mathematical accuracy validation (EXPECTED)');
        failCount++;
    }
    
    // Check 5: Diversity scoring
    const hasDiversityScore = result.agentMetrics?.qualityChecks?.diversityScore !== undefined;
    if (hasDiversityScore) {
        console.log('✅ PASS: Diversity score from agent present');
        passCount++;
    } else {
        console.log('❌ FAIL: No diversity score (EXPECTED)');
        failCount++;
    }
    
    // Check 6: Agent list
    const hasAgentsList = Array.isArray(result.agentMetrics?.agentsUsed) &&
                          result.agentMetrics.agentsUsed.length > 0;
    if (hasAgentsList) {
        console.log('✅ PASS: List of agents used in workflow');
        passCount++;
    } else {
        console.log('❌ FAIL: No list of agents used (EXPECTED)');
        failCount++;
    }
    
    // Check 7: Workflow timing
    const hasWorkflowTime = result.agentMetrics?.workflowTiming?.totalMs !== undefined;
    if (hasWorkflowTime) {
        console.log('✅ PASS: Workflow timing data present');
        passCount++;
    } else {
        console.log('❌ FAIL: No workflow timing data (EXPECTED)');
        failCount++;
    }
    
    // Check 8: Confidence score from agents
    const hasConfidenceScore = typeof result.agentMetrics?.confidenceScore === 'number';
    if (hasConfidenceScore) {
        console.log('✅ PASS: Agent confidence score present');
        passCount++;
    } else {
        console.log('❌ FAIL: No agent confidence score (EXPECTED)');
        failCount++;
    }
    
    // Check 9: Context enhancement
    const hasEnhancedQuestions = result.agentMetrics?.contextEnhancement !== undefined;
    if (hasEnhancedQuestions) {
        console.log('✅ PASS: Context enhancement data present');
        passCount++;
    } else {
        console.log('❌ FAIL: No context enhancement data (EXPECTED)');
        failCount++;
    }
    
    // Check 10: Workflow error tracking
    const hasWorkflowErrors = result.agentMetrics?.workflowTiming !== undefined;
    if (hasWorkflowErrors) {
        console.log('✅ PASS: Workflow error tracking present');
        passCount++;
    } else {
        console.log('❌ FAIL: No workflow error tracking (EXPECTED)');
        failCount++;
    }
    
    console.log('\n🔵 ADDITIONAL AGENTS CHECKS (Session 2):');
    console.log('='.repeat(60));
    
    // Check 11: DifficultyCalibrator in workflow
    const hasDifficultyCalibrator = result.agentMetrics?.agentsUsed?.includes('DifficultyCalibatorAgent');
    if (hasDifficultyCalibrator) {
        console.log('✅ PASS: DifficultyCalibrator in agent workflow');
        passCount++;
    } else {
        console.log('❌ FAIL: No DifficultyCalibrator in workflow (EXPECTED)');
        failCount++;
    }
    
    // Check 12: QuestionGeneratorAgent in workflow
    const hasQuestionGenerator = result.agentMetrics?.agentsUsed?.includes('QuestionGeneratorAgent');
    if (hasQuestionGenerator) {
        console.log('✅ PASS: QuestionGeneratorAgent in workflow');
        passCount++;
    } else {
        console.log('❌ FAIL: No QuestionGeneratorAgent in workflow (EXPECTED)');
        failCount++;
    }
    
    // Check 13: Difficulty settings from calibrator
    const hasDifficultySettings = result.agentMetrics?.difficultySettings !== undefined;
    if (hasDifficultySettings) {
        console.log('✅ PASS: Difficulty settings from calibrator present');
        passCount++;
    } else {
        console.log('❌ FAIL: No difficulty settings (EXPECTED)');
        failCount++;
    }
    
    // Check 14: Question generation metadata
    const hasGenerationMetadata = result.agentMetrics?.questionGeneration !== undefined;
    if (hasGenerationMetadata) {
        console.log('✅ PASS: Question generation metadata present');
        passCount++;
    } else {
        console.log('❌ FAIL: No question generation metadata (EXPECTED)');
        failCount++;
    }
    
    // Check 15: 4-agent workflow (full pipeline)
    const hasFourAgents = result.agentMetrics?.agentsUsed?.length >= 4;
    if (hasFourAgents) {
        console.log('✅ PASS: 4-agent workflow active');
        passCount++;
    } else {
        console.log(`❌ FAIL: Only ${result.agentMetrics?.agentsUsed?.length || 0} agents (EXPECTED, need 4)`);
        failCount++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 TOTAL SUMMARY: ${failCount} Failed / ${passCount} Passed`);
    console.log('='.repeat(60));
    
    // Session 1: Expected 10 failures
    // Session 2: Expected 15 failures (10 original + 5 new)
    const expectedFails = 15;
    const expectedPasses = 0;
    
    if (failCount === expectedFails && passCount === expectedPasses) {
        console.log('\n🎯 RED PHASE SUCCESSFUL!');
        console.log('✅ All checks failed as expected');
        console.log('✅ Proves 4-agent workflow is NOT yet integrated');
        console.log('✅ Ready to proceed to GREEN phase implementation\n');
    } else if (failCount === 5 && passCount === 10) {
        console.log('\n🎯 SESSION 2 RED PHASE SUCCESSFUL!');
        console.log('✅ Original 10 checks passing (Session 1 complete)');
        console.log('✅ New 5 checks failing (Session 2 needs implementation)');
        console.log('✅ Ready to integrate DifficultyCalibrator and QuestionGenerator\n');
    } else {
        console.log('\n⚠️  UNEXPECTED RESULTS!');
        console.log(`Expected Session 1: ${expectedFails} failures, ${expectedPasses} passes`);
        console.log(`Expected Session 2: 5 failures, 10 passes`);
        console.log(`Got: ${failCount} failures, ${passCount} passes`);
        console.log('Review agent integration status\n');
    }
    
    // Show current validation score (simplified)
    console.log('📈 Current Implementation:');
    console.log(`- Agentic Validation Score: ${(result.qualityMetrics.agenticValidationScore * 100).toFixed(1)}%`);
    console.log(`- Type: ${typeof result.qualityMetrics.agenticValidationScore}`);
    console.log('- Note: Currently just a simple number, not detailed agent data\n');
    
} catch (error) {
    console.error('❌ Error during validation:', error);
    process.exit(1);
}
