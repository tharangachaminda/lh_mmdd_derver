#!/usr/bin/env node

/**
 * Phase 1F Linear Equations Ingestion Script
 * 
 * Ingests the Grade 8 Phase 1F LINEAR_EQUATIONS dataset into OpenSearch
 * with proper vector embeddings and metadata enrichment.
 * 
 * Features:
 * - 25 high-quality linear equation questions
 * - Progressive difficulty: easy → medium → hard
 * - Comprehensive algebraic reasoning patterns
 * - New Zealand curriculum Level 4 alignment
 * - Real-world application contexts
 * - Step-by-step solution methodologies
 * - Eight equation types: one-step operations, two-step processes, variable substitution, real-world modeling
 * 
 * @author Learning Hub Development Team
 * @version 1.0.0
 * @phase PHASE_1F
 * @topic LINEAR_EQUATIONS
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { Client } from '@opensearch-project/opensearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
    questionsFile: join(__dirname, 'question_bank/grade8/grade8_linear_equations_questions.json'),
    indexName: 'enhanced-math-questions',
    batchSize: 10,
    phase: 'PHASE_1F',
    topic: 'LINEAR_EQUATIONS'
};

// OpenSearch client
const client = new Client({
    node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
    maxRetries: 3,
    requestTimeout: 30000,
    sniffOnStart: false,
});

/**
 * Generate embeddings for text content
 * @param {string} text - Text to generate embeddings for
 * @returns {Promise<number[]>} Vector embedding array
 */
async function generateEmbedding(text) {
    try {
        // Simple text-based embedding generation (production would use proper ML model)
        const tokens = text.toLowerCase().split(/\s+/);
        const embedding = new Array(1536).fill(0);
        
        // Generate deterministic embedding based on text content
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            for (let j = 0; j < token.length; j++) {
                const charCode = token.charCodeAt(j);
                const index = (charCode + i * 7 + j * 13) % 1536;
                embedding[index] += (charCode / 255) * (1 / Math.sqrt(tokens.length));
            }
        }
        
        // Normalize embedding
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
    } catch (error) {
        console.error(`Error generating embedding: ${error.message}`);
        return new Array(1536).fill(0);
    }
}

/**
 * Enrich question with metadata and embeddings
 * @param {Object} question - Question object
 * @param {Object} metadata - Dataset metadata
 * @returns {Promise<Object>} Enriched question
 */
async function enrichQuestion(question, metadata) {
    const combinedText = `${question.question} ${question.explanation} ${question.contentForEmbedding || ''}`;
    const embedding = await generateEmbedding(combinedText);
    
    return {
        ...question,
        // Enhanced metadata
        phase: CONFIG.phase,
        topic: CONFIG.topic,
        datasetId: metadata.datasetId,
        datasetVersion: metadata.version,
        ingestionDate: new Date().toISOString(),
        
        // Linear equations specific metadata
        algebraicCategory: question.questionType || 'LINEAR_EQUATIONS',
        algebraicSubcategory: determineAlgebraicSubcategory(question),
        hasStepByStepSolution: question.explanation?.includes('Step') || false,
        includesRealWorldContext: question.question.length > 50 || question.explanation?.includes('real') || false,
        
        // Vector embedding
        embedding: embedding,
        
        // Search optimization
        searchableText: combinedText,
        primaryCategory: 'algebraic-equations',
        
        // Quality metrics
        hasVariableSubstitution: /substitute|variable|let/i.test(question.explanation),
        vocabularyLevel: 'Grade 8',
        curriculumAlignment: {
            grade: metadata.grade,
            subject: metadata.subject,
            topic: metadata.curriculumTopic,
            subtopic: metadata.strand
        },
        
        // Enhanced reasoning validation
        hasEnhancedReasoning: /because|therefore|since|thus|hence|step/i.test(question.explanation),
        
        // Mathematical formatting validation
        properAlgebraicFormat: /x\s*=|solve.*x|equation/i.test(question.question),
        
        // Timestamp
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Determine algebraic subcategory based on question content
 * @param {Object} question - Question object
 * @returns {string} Algebraic subcategory
 */
function determineAlgebraicSubcategory(question) {
    const questionText = question.question.toLowerCase();
    const explanationText = (question.explanation || '').toLowerCase();
    
    if (questionText.includes('x +') || questionText.includes('+ x')) {
        return 'one-step-addition';
    } else if (questionText.includes('x -') || questionText.includes('- x')) {
        return 'one-step-subtraction';
    } else if (questionText.includes('x ×') || questionText.includes('* x') || /\d+x/.test(questionText)) {
        return 'one-step-multiplication';
    } else if (questionText.includes('x ÷') || questionText.includes('/ x') || questionText.includes('x/')) {
        return 'one-step-division';
    } else if (explanationText.includes('substitute') || explanationText.includes('when x')) {
        return 'variable-substitution';
    } else if (question.question.length > 60 || explanationText.includes('real') || explanationText.includes('scenario')) {
        return 'real-world-application';
    } else if (explanationText.includes('step 2') || explanationText.includes('then')) {
        return 'two-step-equation';
    } else {
        return 'equation-manipulation';
    }
}

/**
 * Create index if it doesn't exist
 */
async function ensureIndexExists() {
    try {
        const indexExists = await client.indices.exists({ index: CONFIG.indexName });
        
        if (!indexExists.body) {
            console.log(`Creating index: ${CONFIG.indexName}`);
            await client.indices.create({
                index: CONFIG.indexName,
                body: {
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 0,
                        'index.knn': true
                    },
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            type: { type: 'keyword' },
                            phase: { type: 'keyword' },
                            topic: { type: 'keyword' },
                            grade: { type: 'integer' },
                            difficulty: { type: 'keyword' },
                            question: { type: 'text', analyzer: 'standard' },
                            answer: { type: 'text' },
                            explanation: { type: 'text', analyzer: 'standard' },
                            embedding: {
                                type: 'knn_vector',
                                dimension: 1536,
                                method: {
                                    name: 'hnsw',
                                    space_type: 'cosinesimil'
                                }
                            },
                            searchableText: { type: 'text', analyzer: 'standard' },
                            algebraicCategory: { type: 'keyword' },
                            algebraicSubcategory: { type: 'keyword' },
                            hasStepByStepSolution: { type: 'boolean' },
                            includesRealWorldContext: { type: 'boolean' },
                            hasVariableSubstitution: { type: 'boolean' },
                            hasEnhancedReasoning: { type: 'boolean' },
                            properAlgebraicFormat: { type: 'boolean' },
                            ingestionDate: { type: 'date' },
                            lastUpdated: { type: 'date' }
                        }
                    }
                }
            });
            console.log('✅ Index created successfully');
        } else {
            console.log('✅ Index already exists');
        }
    } catch (error) {
        console.error(`❌ Error creating index: ${error.message}`);
        throw error;
    }
}

/**
 * Ingest questions in batches
 * @param {Array} questions - Array of questions to ingest
 * @param {Object} metadata - Dataset metadata
 */
async function ingestQuestions(questions, metadata) {
    console.log(`🚀 Starting ingestion of ${questions.length} questions...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < questions.length; i += CONFIG.batchSize) {
        const batch = questions.slice(i, i + CONFIG.batchSize);
        const operations = [];
        
        console.log(`📦 Processing batch ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(questions.length / CONFIG.batchSize)}`);
        
        for (const question of batch) {
            try {
                const enrichedQuestion = await enrichQuestion(question, metadata);
                
                // Index operation
                operations.push({
                    index: {
                        _index: CONFIG.indexName,
                        _id: `grade8_linear_equations_${enrichedQuestion.id}`
                    }
                });
                operations.push(enrichedQuestion);
                
            } catch (error) {
                console.error(`❌ Error processing question ${question.id}: ${error.message}`);
                errorCount++;
            }
        }
        
        if (operations.length > 0) {
            try {
                const response = await client.bulk({ body: operations });
                
                if (response.body.errors) {
                    const errorItems = response.body.items.filter(item => item.index?.error);
                    console.error(`⚠️  Batch errors: ${errorItems.length}`);
                    errorItems.forEach(item => {
                        console.error(`   - ${item.index.error.reason}`);
                    });
                    errorCount += errorItems.length;
                    successCount += (operations.length / 2) - errorItems.length;
                } else {
                    successCount += operations.length / 2;
                    console.log(`✅ Batch completed successfully`);
                }
            } catch (error) {
                console.error(`❌ Bulk operation failed: ${error.message}`);
                errorCount += operations.length / 2;
            }
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return { successCount, errorCount };
}

/**
 * Verify ingestion by searching for questions
 */
async function verifyIngestion() {
    try {
        // Wait for index refresh
        await client.indices.refresh({ index: CONFIG.indexName });
        
        // Search for Phase 1F questions
        const searchResponse = await client.search({
            index: CONFIG.indexName,
            body: {
                query: {
                    bool: {
                        must: [
                            { term: { 'phase.keyword': CONFIG.phase } },
                            { term: { 'topic.keyword': CONFIG.topic } }
                        ]
                    }
                },
                size: 0
            }
        });
        
        const count = searchResponse.body.hits.total.value;
        console.log(`🔍 Verification: Found ${count} Phase 1F Linear Equations questions in index`);
        
        // Test vector search
        if (count > 0) {
            const vectorSearchResponse = await client.search({
                index: CONFIG.indexName,
                body: {
                    query: {
                        bool: {
                            must: [
                                { term: { 'phase.keyword': CONFIG.phase } },
                                { term: { 'topic.keyword': CONFIG.topic } }
                            ]
                        }
                    },
                    size: 3
                }
            });
            
            console.log(`📊 Sample questions ingested:`);
            vectorSearchResponse.body.hits.hits.forEach((hit, index) => {
                console.log(`   ${index + 1}. ${hit._source.id}: ${hit._source.question.substring(0, 80)}...`);
            });
        }
        
        return count;
    } catch (error) {
        console.error(`❌ Verification failed: ${error.message}`);
        return 0;
    }
}

/**
 * Main ingestion function
 */
async function main() {
    const startTime = Date.now();
    
    console.log('🔢 INGESTION PHASE: Grade 8 Phase 1F Linear Equations');
    console.log('===================================================');
    console.log(`📁 Dataset: ${CONFIG.questionsFile}`);
    console.log(`🎯 Target: ${CONFIG.indexName}`);
    console.log(`📊 Phase: ${CONFIG.phase} - ${CONFIG.topic}`);
    console.log('');
    
    try {
        // Validate file exists
        if (!existsSync(CONFIG.questionsFile)) {
            throw new Error(`Questions file not found: ${CONFIG.questionsFile}`);
        }
        
        // Load dataset
        console.log('📖 Loading dataset...');
        const dataset = JSON.parse(readFileSync(CONFIG.questionsFile, 'utf8'));
        const { questions, metadata } = dataset;
        
        if (!questions || !Array.isArray(questions)) {
            throw new Error('Invalid dataset format: questions array not found');
        }
        
        console.log(`✅ Loaded ${questions.length} questions`);
        console.log(`📝 Dataset: ${metadata.title} v${metadata.version}`);
        console.log(`🎓 Grade: ${metadata.grade} | Subject: ${metadata.subject}`);
        console.log(`📚 Question Types: ${metadata.question_types.length}`);
        console.log('');
        
        // Ensure index exists
        await ensureIndexExists();
        
        // Ingest questions
        const results = await ingestQuestions(questions, metadata);
        
        // Verify ingestion
        const verifiedCount = await verifyIngestion();
        
        // Final report
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('');
        console.log('🎉 INGESTION COMPLETE');
        console.log('====================');
        console.log(`✅ Successfully ingested: ${results.successCount} questions`);
        console.log(`❌ Errors: ${results.errorCount}`);
        console.log(`🔍 Verified in index: ${verifiedCount}`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`📊 Success rate: ${((results.successCount / questions.length) * 100).toFixed(1)}%`);
        console.log('');
        
        if (results.successCount === questions.length && verifiedCount === questions.length) {
            console.log('🎯 MMDD-TDD INGESTION PHASE: ✅ COMPLETE');
            console.log('Phase 1F Linear Equations successfully deployed to production!');
        } else {
            console.log('⚠️  INGESTION INCOMPLETE - Please review errors above');
            process.exit(1);
        }
        
    } catch (error) {
        console.error(`❌ Ingestion failed: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run ingestion
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { main as ingestGrade8LinearEquations };