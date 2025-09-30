#!/usr/bin/env node

/**
 * Test script for the new simplified question API
 * Tests the new streamlined interface with 5 main types
 */

import { readFileSync } from 'fs';

const API_BASE = 'http://localhost:3000/api/questions';

/**
 * Test configuration
 */
const testConfig = {
    endpoint: `${API_BASE}/generate/simplified`,
    typesEndpoint: `${API_BASE}/types`,
    testRequests: [
        {
            name: "Simple Addition Questions",
            request: {
                types: ["addition"],
                grade: 5,
                count: 3,
                difficulty: "easy",
                context: "Practice basic addition skills"
            }
        },
        {
            name: "Mixed Math Types",
            request: {
                types: ["addition", "subtraction", "multiplication"],
                grade: 6,
                count: 5,
                difficulty: "medium"
            }
        },
        {
            name: "Pattern Recognition",
            request: {
                types: ["pattern_recognition"],
                grade: 4,
                count: 2,
                difficulty: "easy",
                context: "Number sequences and patterns"
            }
        }
    ]
};

/**
 * Make HTTP request
 */
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        
        return {
            success: response.ok,
            status: response.status,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Test available types endpoint
 */
async function testAvailableTypes() {
    console.log('\n🔍 Testing Available Types Endpoint...');
    
    const result = await makeRequest(`${testConfig.typesEndpoint}?grade=5`);
    
    if (result.success) {
        console.log('✅ Available types retrieved successfully');
        console.log('📊 Available Types for Grade 5:');
        
        result.data.availableTypes?.forEach(type => {
            console.log(`  • ${type.mainType}: ${type.description}`);
            console.log(`    Sub-types: ${type.subTypes.length} available`);
        });
    } else {
        console.log('❌ Failed to get available types:', result.error || result.data);
    }
    
    return result.success;
}

/**
 * Test simplified question generation
 */
async function testQuestionGeneration() {
    console.log('\n🚀 Testing Simplified Question Generation...');
    
    let allTestsPassed = true;
    
    for (const test of testConfig.testRequests) {
        console.log(`\n📝 Test: ${test.name}`);
        console.log('Request:', JSON.stringify(test.request, null, 2));
        
        const result = await makeRequest(testConfig.endpoint, {
            method: 'POST',
            body: JSON.stringify(test.request)
        });
        
        if (result.success) {
            console.log('✅ Questions generated successfully');
            console.log(`📊 Generated ${result.data.questions?.length || 0} questions`);
            
            // Show sample questions
            result.data.questions?.slice(0, 2).forEach((q, index) => {
                console.log(`\n  Question ${index + 1}:`);
                console.log(`    ${q.question}`);
                console.log(`    Answer: ${q.answer}`);
                console.log(`    Sub-type: ${q.subType}`);
                console.log(`    Difficulty: ${q.difficulty}`);
            });
            
            if (result.data.questions?.length > 2) {
                console.log(`    ... and ${result.data.questions.length - 2} more questions`);
            }
            
            // Show metadata
            if (result.data.metadata) {
                console.log(`\n  📈 Metadata:`);
                console.log(`    Sub-types used: ${result.data.metadata.subTypesUsed?.join(', ')}`);
                console.log(`    Generation time: ${result.data.metadata.generationTime}ms`);
                console.log(`    API version: ${result.data.apiVersion}`);
            }
            
        } else {
            console.log('❌ Test failed:', result.error || result.data);
            allTestsPassed = false;
        }
    }
    
    return allTestsPassed;
}

/**
 * Test error handling
 */
async function testErrorHandling() {
    console.log('\n🛡️ Testing Error Handling...');
    
    const invalidRequest = {
        types: ["invalid_type"],
        grade: 999,  // Invalid grade
        count: 0     // Invalid count
    };
    
    const result = await makeRequest(testConfig.endpoint, {
        method: 'POST',
        body: JSON.stringify(invalidRequest)
    });
    
    if (!result.success && result.status === 400) {
        console.log('✅ Error handling works correctly');
        console.log('📋 Error response:', result.data);
        return true;
    } else {
        console.log('❌ Error handling failed - should have returned 400');
        return false;
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log('🧪 SIMPLIFIED QUESTION API TEST SUITE');
    console.log('=====================================');
    
    // Check if server is running
    console.log('\n🌐 Checking server status...');
    const healthCheck = await makeRequest(`${API_BASE}/debug-env`);
    
    if (!healthCheck.success) {
        console.log('❌ Server not running. Please start the server first:');
        console.log('   npm run dev');
        process.exit(1);
    }
    
    console.log('✅ Server is running');
    
    let testResults = [];
    
    // Run all tests
    testResults.push(await testAvailableTypes());
    testResults.push(await testQuestionGeneration());
    testResults.push(await testErrorHandling());
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    
    const passed = testResults.filter(r => r).length;
    const total = testResults.length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('\n🎉 All tests passed! Simplified API is working correctly.');
        process.exit(0);
    } else {
        console.log('\n⚠️ Some tests failed. Check the output above for details.');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
});