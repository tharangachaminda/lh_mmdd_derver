/**
 * Curriculum Integration Test Server
 *
 * Test server to verify the curriculum-data package integration
 * with the core-api package.
 *
 * @fileoverview Integration test server for curriculum features
 * @version 1.0.0
 */

import { app } from './dist/app.js';
import { config } from "dotenv";

// Load environment variables
config();

/**
 * Test curriculum integration endpoints
 */
async function testCurriculumIntegration() {
    console.log('🧪 Starting Curriculum Integration Tests...');
    console.log('');

    const port = process.env.PORT || 3000;

    const server = app.listen(port, () => {
        console.log(`✅ Server running on port ${port}`);
        console.log(`📚 Curriculum API base URL: http://localhost:${port}/api/curriculum`);
        console.log(`📋 API Documentation: http://localhost:${port}/api/v1/docs`);
        console.log('');
        
        // Test curriculum endpoints
        testEndpoints();
    });

    /**
     * Test basic endpoint connectivity
     */
    async function testEndpoints() {
        console.log('🔍 Testing Curriculum API Endpoints...');
        console.log('');

        try {
            // Test health endpoint
            console.log('1. Testing health endpoint...');
            const healthResponse = await fetch(`http://localhost:${port}/api/curriculum/admin/health`);
            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                console.log(`   ✅ Health check: ${healthData.data?.openSearchStatus || 'unknown'}`);
                console.log(`   📊 Questions in DB: ${healthData.data?.totalQuestions || 0}`);
                console.log(`   🎯 Curriculum objectives: ${healthData.data?.totalCurriculumObjectives || 0}`);
                
                if (healthData.data?.recommendations?.length > 0) {
                    console.log(`   💡 Recommendations:`);
                    healthData.data.recommendations.forEach((rec, i) => {
                        console.log(`      ${i + 1}. ${rec}`);
                    });
                }
            } else {
                console.log(`   ❌ Health check failed: ${healthResponse.status}`);
            }
            console.log('');

            // Test question search
            console.log('2. Testing question search...');
            const searchResponse = await fetch(
                `http://localhost:${port}/api/curriculum/questions/search?q=algebra&limit=5`
            );
            if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                console.log(`   ✅ Search successful: ${searchData.data?.stats?.returned || 0} results found`);
                console.log(`   📝 Total questions available: ${searchData.data?.stats?.total || 0}`);
            } else {
                console.log(`   ❌ Search failed: ${searchResponse.status}`);
                if (searchResponse.status === 500) {
                    const errorData = await searchResponse.json();
                    console.log(`   🔍 Error: ${errorData.error}`);
                }
            }
            console.log('');

            // Test similar questions
            console.log('3. Testing similar questions...');
            const similarResponse = await fetch(
                `http://localhost:${port}/api/curriculum/questions/similar`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        questionText: 'What is 2 + 2?',
                        k: 3
                    })
                }
            );
            if (similarResponse.ok) {
                const similarData = await similarResponse.json();
                console.log(`   ✅ Similarity search: ${similarData.data?.similarQuestions?.length || 0} similar questions found`);
                if (similarData.data?.stats?.averageSimilarity) {
                    console.log(`   📊 Average similarity: ${(similarData.data.stats.averageSimilarity * 100).toFixed(1)}%`);
                }
            } else {
                console.log(`   ❌ Similar questions failed: ${similarResponse.status}`);
                if (similarResponse.status === 500) {
                    const errorData = await similarResponse.json();
                    console.log(`   🔍 Error: ${errorData.error}`);
                }
            }
            console.log('');

            // Test recommendations
            console.log('4. Testing content recommendations...');
            const recsResponse = await fetch(
                `http://localhost:${port}/api/curriculum/recommendations`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        answeredQuestionIds: [],
                        maxResults: 5
                    })
                }
            );
            if (recsResponse.ok) {
                const recsData = await recsResponse.json();
                console.log(`   ✅ Recommendations: ${recsData.data?.recommendations?.length || 0} suggested questions`);
                console.log(`   🎯 Strategy: ${recsData.data?.strategy || 'unknown'}`);
            } else {
                console.log(`   ❌ Recommendations failed: ${recsResponse.status}`);
                if (recsResponse.status === 500) {
                    const errorData = await recsResponse.json();
                    console.log(`   🔍 Error: ${errorData.error}`);
                }
            }
            console.log('');

            // Test curriculum alignment
            console.log('5. Testing curriculum alignment...');
            const alignResponse = await fetch(
                `http://localhost:${port}/api/curriculum/alignment`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        questionText: 'Solve for x: 2x + 5 = 15',
                        subject: 'Mathematics',
                        grade: 8
                    })
                }
            );
            if (alignResponse.ok) {
                const alignData = await alignResponse.json();
                console.log(`   ✅ Alignment: ${alignData.data?.alignments?.length || 0} curriculum matches found`);
                if (alignData.data?.stats?.averageScore) {
                    console.log(`   📊 Average alignment score: ${(alignData.data.stats.averageScore * 100).toFixed(1)}%`);
                }
            } else {
                console.log(`   ❌ Alignment failed: ${alignResponse.status}`);
                if (alignResponse.status === 500) {
                    const errorData = await alignResponse.json();
                    console.log(`   🔍 Error: ${errorData.error}`);
                }
            }
            console.log('');

            // Test ingestion stats
            console.log('6. Testing ingestion statistics...');
            const statsResponse = await fetch(`http://localhost:${port}/api/curriculum/admin/stats`);
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                console.log(`   ✅ Stats retrieved successfully`);
                console.log(`   📊 Questions ingested: ${statsData.data?.questionsIngested || 0}`);
                console.log(`   📂 Files processed: ${statsData.data?.filesProcessed || 0}`);
                if (statsData.data?.recommendedActions?.length > 0) {
                    console.log(`   💡 Recommended actions:`);
                    statsData.data.recommendedActions.forEach((action, i) => {
                        console.log(`      ${i + 1}. ${action}`);
                    });
                }
            } else {
                console.log(`   ❌ Stats failed: ${statsResponse.status}`);
            }
            console.log('');

            console.log('🎉 Integration tests completed!');
            console.log('');
            console.log('📋 API Endpoints Available:');
            console.log(`   GET  ${port}/api/curriculum/admin/health - System health status`);
            console.log(`   GET  ${port}/api/curriculum/questions/search - Search questions`);
            console.log(`   POST ${port}/api/curriculum/questions/similar - Find similar questions`);
            console.log(`   POST ${port}/api/curriculum/recommendations - Get recommendations`);
            console.log(`   POST ${port}/api/curriculum/alignment - Align to curriculum`);
            console.log(`   POST ${port}/api/curriculum/admin/ingest - Bulk ingest data`);
            console.log(`   GET  ${port}/api/curriculum/admin/stats - Ingestion statistics`);
            console.log('');
            console.log('🌐 For interactive testing, visit:');
            console.log(`   http://localhost:${port}/api/v1/docs`);
            console.log('');
            console.log('⚡ Server will continue running for manual testing...');

        } catch (error) {
            console.error('❌ Test failed:', error);
        }
    }

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 Received SIGTERM signal, shutting down gracefully...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('\\n🛑 Received SIGINT signal, shutting down gracefully...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
}

// Start integration test
testCurriculumIntegration().catch(console.error);