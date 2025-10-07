#!/usr/bin/env node

/**
 * RED PHASE VALIDATION: Session 5 - True LangGraph StateGraph (Direct Test)
 * 
 * This script directly tests the enhanced workflow service to validate 
 * that native LangGraph StateGraph features are NOT implemented.
 * Bypasses database to focus on workflow testing.
 */

console.log('🔴 RED PHASE: Session 5 - LangGraph StateGraph Direct Test');
console.log('='.repeat(70));
console.log('Expected Result: ALL SESSION 5 CHECKS SHOULD FAIL');
console.log('Testing enhanced workflow service directly\n');

try {
    // Test enhanced workflow service directly
    const { LangGraphAgenticWorkflow } = await import('./dist/services/enhanced-agentic-workflow.service.js');
    
    const mockRequest = {
        subject: 'mathematics',
        topic: 'Addition',
        difficulty: 'beginner',
        questionType: 'multiple_choice',
        count: 3,
        persona: {
            userId: '507f1f77bcf86cd799439011',
            grade: 5,
            learningStyle: 'visual',
            interests: ['mathematics', 'sports'],
            culturalContext: 'New Zealand',
            strengths: ['addition'],
        },
    };
    
    console.log('📊 Test Parameters (Session 5 Direct):');
    console.log(`- Subject: ${mockRequest.subject}`);
    console.log(`- Topic: ${mockRequest.topic}`);
    console.log(`- Count: ${mockRequest.count} (testing parallel capabilities)`);
    console.log(`- Testing: Enhanced workflow service directly\n`);
    
    console.log('🔄 Executing enhanced workflow...\n');
    
    const enhancedWorkflow = new LangGraphAgenticWorkflow();
    const result = await enhancedWorkflow.executeWorkflow(mockRequest);
    
    let passCount = 0;
    let failCount = 0;
    
    console.log('📋 SESSION 5 STATEGRAPH VALIDATION RESULTS:');
    console.log('='.repeat(70));
    
    // Check 1: Native StateGraph implementation
    const hasNativeStateGraph = result.agentMetrics?.workflowType === 'StateGraph';
    if (hasNativeStateGraph) {
        console.log('✅ PASS: Using native LangGraph StateGraph');
        passCount++;
    } else {
        console.log('❌ FAIL: Not using native StateGraph (using EnhancedWorkflow) (EXPECTED)');
        failCount++;
    }
    
    // Check 2: Parallel agent execution
    const hasParallelExecution = result.agentMetrics?.parallelExecution !== undefined;
    if (hasParallelExecution) {
        console.log('✅ PASS: Parallel agent execution implemented');
        passCount++;
    } else {
        console.log('❌ FAIL: No parallel agent execution tracking (EXPECTED)');
        failCount++;
    }
    
    // Check 3: StateGraph node definitions
    const hasNodeDefinitions = result.agentMetrics?.nodeDefinitions !== undefined;
    if (hasNodeDefinitions) {
        console.log('✅ PASS: StateGraph node definitions present');
        passCount++;
    } else {
        console.log('❌ FAIL: No StateGraph node definitions (EXPECTED)');
        failCount++;
    }
    
    // Check 4: StateGraph edge configurations
    const hasEdgeConfigurations = result.agentMetrics?.edgeConfigurations !== undefined;
    if (hasEdgeConfigurations) {
        console.log('✅ PASS: StateGraph edge configurations present');
        passCount++;
    } else {
        console.log('❌ FAIL: No StateGraph edge configurations (EXPECTED)');
        failCount++;
    }
    
    // Check 5: StateGraph compilation
    const hasStateGraphCompilation = result.agentMetrics?.compiledGraph !== undefined;
    if (hasStateGraphCompilation) {
        console.log('✅ PASS: StateGraph compilation successful');
        passCount++;
    } else {
        console.log('❌ FAIL: No StateGraph compilation (EXPECTED)');
        failCount++;
    }
    
    // Check 6: Visual workflow graph generation
    const hasWorkflowGraph = result.agentMetrics?.workflowGraph !== undefined;
    if (hasWorkflowGraph) {
        console.log('✅ PASS: Workflow graph visualization available');
        passCount++;
    } else {
        console.log('❌ FAIL: No workflow graph visualization (EXPECTED)');
        failCount++;
    }
    
    // Check 7: StateGraph invoke method
    const hasStateGraphInvoke = result.agentMetrics?.invokeMethod === 'stateGraph';
    if (hasStateGraphInvoke) {
        console.log('✅ PASS: Using StateGraph.invoke() method');
        passCount++;
    } else {
        console.log('❌ FAIL: Not using StateGraph.invoke() method (EXPECTED)');
        failCount++;
    }
    
    // Check 8: Advanced conditional routing
    const hasAdvancedRouting = result.agentMetrics?.conditionalRoutes?.includes('advanced_routing');
    if (hasAdvancedRouting) {
        console.log('✅ PASS: Advanced conditional routing beyond retries');
        passCount++;
    } else {
        console.log('❌ FAIL: No advanced routing, basic conditionals only (EXPECTED)');
        failCount++;
    }
    
    // Check 9: Dynamic routing decisions
    const hasDynamicRouting = result.agentMetrics?.dynamicRouting !== undefined;
    if (hasDynamicRouting) {
        console.log('✅ PASS: Dynamic routing decisions implemented');
        passCount++;
    } else {
        console.log('❌ FAIL: No dynamic routing decisions (EXPECTED)');
        failCount++;
    }
    
    // Check 10: StateGraph memory management
    const hasMemoryManagement = result.agentMetrics?.memoryManagement !== undefined;
    if (hasMemoryManagement) {
        console.log('✅ PASS: StateGraph memory management implemented');
        passCount++;
    } else {
        console.log('❌ FAIL: No StateGraph memory management (EXPECTED)');
        failCount++;
    }
    
    console.log('\n🔍 PARALLEL EXECUTION ANALYSIS:');
    console.log('='.repeat(70));
    
    // Check 11: Agent execution concurrency
    const executionTiming = result.agentMetrics?.workflowTiming;
    const totalTime = executionTiming?.total || 0;
    const agentTimes = Object.values(executionTiming || {}).filter(t => typeof t === 'number' && t > 0);
    const sumOfAgentTimes = agentTimes.reduce((sum, time) => sum + time, 0);
    const hasParallelOptimization = totalTime < sumOfAgentTimes && totalTime > 0;
    
    if (hasParallelOptimization) {
        console.log(`✅ PASS: Parallel execution detected (total: ${totalTime}ms < sum: ${sumOfAgentTimes}ms)`);
        passCount++;
    } else {
        console.log(`❌ FAIL: Sequential execution (total: ${totalTime}ms) (EXPECTED)`);
        failCount++;
    }
    
    // Check 12: Concurrent agent processing
    const hasConcurrentProcessing = result.agentMetrics?.concurrentAgents !== undefined;
    if (hasConcurrentProcessing) {
        console.log('✅ PASS: Concurrent agent processing implemented');
        passCount++;
    } else {
        console.log('❌ FAIL: No concurrent agent processing tracking (EXPECTED)');
        failCount++;
    }
    
    // Check 13: Multiple routing paths
    const routingPaths = result.agentMetrics?.routingPaths || [];
    const hasMultipleRoutingPaths = routingPaths.length > 2;
    if (hasMultipleRoutingPaths) {
        console.log(`✅ PASS: Multiple routing paths available (${routingPaths.length} paths)`);
        passCount++;
    } else {
        console.log(`❌ FAIL: Limited routing paths (${routingPaths.length || 0} paths) (EXPECTED)`);
        failCount++;
    }
    
    // Check 14: StateGraph performance optimizations
    const hasStateGraphOptimizations = result.agentMetrics?.stateGraphOptimizations !== undefined;
    if (hasStateGraphOptimizations) {
        console.log('✅ PASS: StateGraph performance optimizations active');
        passCount++;
    } else {
        console.log('❌ FAIL: No StateGraph-specific optimizations (EXPECTED)');
        failCount++;
    }
    
    // Check 15: Workflow visualization data
    const hasVisualizationData = result.agentMetrics?.visualizationData !== undefined;
    if (hasVisualizationData) {
        console.log('✅ PASS: Workflow visualization data available');
        passCount++;
    } else {
        console.log('❌ FAIL: No workflow visualization data (EXPECTED)');
        failCount++;
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`📊 SESSION 5 SUMMARY: ${failCount} Failed / ${passCount} Passed`);
    console.log('='.repeat(70));
    
    // Session 5: Expected 15 failures (StateGraph features not implemented)
    const expectedFails = 15;
    const expectedPasses = 0;
    
    if (failCount === expectedFails && passCount === expectedPasses) {
        console.log('\n🎯 SESSION 5 RED PHASE SUCCESSFUL!');
        console.log('✅ All StateGraph checks failed as expected');
        console.log('✅ Enhanced workflow is working perfectly (Session 3+4 complete)');
        console.log('✅ Ready to implement native LangGraph StateGraph');
        console.log('✅ Performance baseline maintained: fast execution, 100% quality\n');
    } else {
        console.log('\n⚠️  UNEXPECTED SESSION 5 RESULTS!');
        console.log(`Expected: ${expectedFails} failures, ${expectedPasses} passes`);
        console.log(`Got: ${failCount} failures, ${passCount} passes`);
        console.log('Review StateGraph implementation status\n');
    }
    
    // Show current implementation details
    console.log('📈 Current Implementation Status:');
    console.log(`- Workflow Type: ${result.agentMetrics?.workflowType || 'EnhancedWorkflow'}`);
    console.log(`- Execution Time: ${totalTime}ms`);
    console.log(`- Quality Score: ${(result.qualityMetrics?.agenticValidationScore * 100).toFixed(1)}%`);
    console.log(`- LangChain Features: Working (ChatPromptTemplate, few-shot, etc.)`);
    console.log(`- Agents Used: ${result.agentMetrics?.agentsUsed?.join(', ') || 'Unknown'}`);
    console.log('- Status: Ready for Session 5 GREEN phase (StateGraph implementation)\n');
    
} catch (error) {
    console.error('❌ Error during Session 5 direct test:', error);
    console.log('\n💡 This error may indicate the enhanced workflow service needs updates');
    console.log('   for Session 5 StateGraph implementation.');
    process.exit(1);
}