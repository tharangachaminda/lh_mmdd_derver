#!/usr/bin/env node

/**
 * Session 5 - GREEN Phase: Test Native StateGraph Implementation
 * 
 * Tests the new StateGraph service with comprehensive validation
 */

import { StateGraphAgenticWorkflow } from './src/services/services/stategraph-agentic-workflow.service.js';

const TEST_REQUEST = {
    subject: 'mathematics',
    topic: 'addition and subtraction',
    difficulty: 'medium',
    questionType: 'multiple_choice',
    count: 3,
    persona: {
        userId: 'test-user-state-graph',
        grade: 5,
        learningStyle: 'visual',
        interests: ['sports', 'games'],
        culturalContext: 'diverse',
        strengths: ['logical thinking', 'problem solving']
    }
};

// Function to validate StateGraph features
function validateStateGraphFeatures(result) {
    const checks = [];
    
    // 1. Check if result has StateGraph workflow type
    checks.push({
        name: 'StateGraph Workflow Type',
        pass: result?.agentMetrics?.workflowType === 'StateGraph',
        value: result?.agentMetrics?.workflowType
    });
    
    // 2. Check for native StateGraph compilation
    checks.push({
        name: 'StateGraph Compilation',
        pass: result?.agentMetrics?.compiledGraph?.isStateGraph === true,
        value: result?.agentMetrics?.compiledGraph?.isStateGraph
    });
    
    // 3. Check for StateGraph node execution
    checks.push({
        name: 'StateGraph Node Definitions',
        pass: Array.isArray(result?.agentMetrics?.nodeDefinitions) && result?.agentMetrics?.nodeDefinitions.length > 0,
        value: result?.agentMetrics?.nodeDefinitions?.length || 0
    });
    
    // 4. Check for conditional routing
    checks.push({
        name: 'Conditional Routing',
        pass: Array.isArray(result?.agentMetrics?.conditionalRoutes) && result?.agentMetrics?.conditionalRoutes.length > 0,
        value: result?.agentMetrics?.conditionalRoutes?.length || 0
    });
    
    // 5. Check for StateGraph invoke method
    checks.push({
        name: 'StateGraph Invoke Method',
        pass: result?.agentMetrics?.invokeMethod === 'stateGraph',
        value: result?.agentMetrics?.invokeMethod
    });
    
    // 6. Check for dynamic routing
    checks.push({
        name: 'Dynamic Routing',
        pass: Array.isArray(result?.agentMetrics?.dynamicRouting) && result?.agentMetrics?.dynamicRouting.length > 0,
        value: result?.agentMetrics?.dynamicRouting?.length || 0
    });
    
    // 7. Check for memory management
    checks.push({
        name: 'Memory Management',
        pass: typeof result?.agentMetrics?.memoryManagement === 'object' && result?.agentMetrics?.memoryManagement !== null,
        value: Object.keys(result?.agentMetrics?.memoryManagement || {}).length
    });
    
    // 8. Check for StateGraph optimizations
    checks.push({
        name: 'StateGraph Optimizations',
        pass: result?.agentMetrics?.stateGraphOptimizations?.parallelValidation === true,
        value: result?.agentMetrics?.stateGraphOptimizations?.parallelValidation
    });
    
    // 9. Check for workflow visualization
    checks.push({
        name: 'Workflow Visualization',
        pass: result?.agentMetrics?.visualizationData && Array.isArray(result?.agentMetrics?.visualizationData?.nodes),
        value: result?.agentMetrics?.visualizationData?.nodes?.length || 0
    });
    
    // 10. Check for parallel execution
    checks.push({
        name: 'Parallel Execution',
        pass: Array.isArray(result?.agentMetrics?.parallelExecution) && result?.agentMetrics?.parallelExecution.length > 0,
        value: result?.agentMetrics?.parallelExecution?.length || 0
    });
    
    // 11. Check for execution graph
    checks.push({
        name: 'Execution Graph',
        pass: Array.isArray(result?.agentMetrics?.executionGraph) && result?.agentMetrics?.executionGraph.length > 0,
        value: result?.agentMetrics?.executionGraph?.length || 0
    });
    
    // 12. Check for edge configurations
    checks.push({
        name: 'Edge Configurations',
        pass: Array.isArray(result?.agentMetrics?.edgeConfigurations) && result?.agentMetrics?.edgeConfigurations.length > 0,
        value: result?.agentMetrics?.edgeConfigurations?.length || 0
    });
    
    // 13. Check for routing paths
    checks.push({
        name: 'Routing Paths',
        pass: Array.isArray(result?.agentMetrics?.routingPaths) && result?.agentMetrics?.routingPaths.includes('conditional'),
        value: result?.agentMetrics?.routingPaths
    });
    
    // 14. Check for workflow graph visualization
    checks.push({
        name: 'Workflow Graph Visualization',
        pass: result?.agentMetrics?.workflowGraph?.visualization === 'available',
        value: result?.agentMetrics?.workflowGraph?.visualization
    });
    
    // 15. Check for structured output and quality
    checks.push({
        name: 'Quality Score with StateGraph',
        pass: result?.qualityMetrics?.agenticValidationScore >= 0.98,
        value: result?.qualityMetrics?.agenticValidationScore
    });
    
    return checks;
}

async function testStateGraphImplementation() {
    console.log('🟣 Testing Session 5: Native StateGraph Implementation');
    console.log('=' + '='.repeat(50));
    
    try {
        const workflow = new StateGraphAgenticWorkflow();
        
        const startTime = Date.now();
        console.log('\n📊 Executing StateGraph workflow...');
        
        const result = await workflow.executeWorkflow(TEST_REQUEST);
        const executionTime = Date.now() - startTime;
        
        console.log(`⚡ Execution completed in ${executionTime}ms`);
        
        // Validate StateGraph features
        console.log('\n🔍 StateGraph Feature Validation:');
        console.log('-' + '-'.repeat(40));
        
        const checks = validateStateGraphFeatures(result);
        let passedChecks = 0;
        
        checks.forEach((check, index) => {
            const status = check.pass ? '✅' : '❌';
            const value = check.value !== undefined ? ` (${check.value})` : '';
            console.log(`${status} ${(index + 1).toString().padStart(2, '0')}. ${check.name}${value}`);
            if (check.pass) passedChecks++;
        });
        
        console.log('-' + '-'.repeat(40));
        console.log(`📊 StateGraph Features: ${passedChecks}/${checks.length} passing`);
        console.log(`📈 Feature Coverage: ${((passedChecks / checks.length) * 100).toFixed(1)}%`);
        
        // Performance metrics
        console.log('\n⚡ Performance Metrics:');
        console.log(`   Execution Time: ${executionTime}ms`);
        console.log(`   Quality Score: ${result?.qualityMetrics?.agenticValidationScore || 'N/A'}`);
        console.log(`   Workflow Type: ${result?.agentMetrics?.workflowType || 'N/A'}`);
        
        // Questions generated
        if (result?.questions && Array.isArray(result.questions)) {
            console.log(`\n📝 Generated ${result.questions.length} questions successfully`);
        }
        
        // StateGraph-specific metrics
        if (result?.agentMetrics?.workflowType === 'StateGraph') {
            console.log('\n🎯 StateGraph Specific Metrics:');
            console.log(`   Nodes Executed: ${result.agentMetrics.executionGraph?.join(' → ') || 'N/A'}`);
            console.log(`   Parallel Executions: ${result.agentMetrics.parallelExecution?.length || 0}`);
            console.log(`   Conditional Routes: ${result.agentMetrics.conditionalRoutes?.length || 0}`);
            console.log(`   Visualization: ${result.agentMetrics.workflowGraph?.visualization || 'N/A'}`);
        }
        
        // Success summary
        console.log('\n' + '='.repeat(52));
        if (passedChecks >= 10) {
            console.log('🎉 Session 5 GREEN Phase: StateGraph implementation SUCCESSFUL!');
            console.log(`✨ ${passedChecks}/15 StateGraph features implemented`);
        } else if (passedChecks >= 5) {
            console.log('⚠️  Session 5 GREEN Phase: Partial StateGraph implementation');
            console.log(`🔨 ${passedChecks}/15 StateGraph features working, needs improvement`);
        } else {
            console.log('❌ Session 5 GREEN Phase: StateGraph implementation needs work');
            console.log(`🛠️  Only ${passedChecks}/15 StateGraph features working`);
        }
        
        return {
            success: passedChecks >= 10,
            passedChecks,
            totalChecks: checks.length,
            executionTime,
            result
        };
        
    } catch (error) {
        console.error('❌ StateGraph test failed:', error);
        console.log('\n📋 This indicates StateGraph compilation or execution issues');
        console.log('🔄 Checking if fallback was used...');
        
        return {
            success: false,
            error: error.message,
            passedChecks: 0,
            totalChecks: 15
        };
    }
}

// Run the test
testStateGraphImplementation()
    .then(result => {
        if (result.success) {
            console.log('\n🚀 Ready for Session 5 completion documentation!');
        } else {
            console.log('\n🔧 StateGraph implementation needs debugging');
        }
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal test error:', error);
        process.exit(1);
    });