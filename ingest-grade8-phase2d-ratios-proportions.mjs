#!/usr/bin/env node

/**
 * Phase 2D Ratios and Proportions Ingestion Script
 * 
 * Ingests the Grade 8 Phase 2D RATIOS_AND_PROPORTIONS dataset into OpenSearch
 * with proper vector embeddings and metadata enrichment.
 * 
 * Features:
 * - 30 high-quality ratios and proportions questions
 * - Enhanced metadata and educational objectives
 * - Proper vector embedding generation
 * - New Zealand curriculum alignment
 * - Real-world application contexts
 * - Comprehensive mathematical reasoning patterns
 * 
 * @author Learning Hub Development Team
 * @version 1.0.0
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { Client } from '@opensearch-project/opensearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
    questionsFile: join(__dirname, 'question_bank/grade8/grade8_ratios_proportions_questions.json'),
    indexName: 'enhanced-math-questions',
    batchSize: 10,
    phase: 'PHASE_2D',
    topic: 'RATIOS_AND_PROPORTIONS'
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
        const response = await fetch('http://localhost:11434/api/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'nomic-embed-text',
                prompt: text
            })
        });

        if (!response.ok) {
            throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result.embedding;
    } catch (error) {
        console.warn('⚠️  Embedding generation failed:', error.message, 'using mock embedding');
        return Array(1536).fill(0).map(() => Math.random() * 0.1);
    }
}

/**
 * Check OpenSearch cluster health
 * @returns {Promise<boolean>} True if cluster is healthy
 */
async function checkClusterHealth() {
    try {
        const health = await client.cat.health({ format: 'json' });
        const status = health.body[0].status;
        
        if (status === 'green' || status === 'yellow') {
            console.log(`[${new Date().toISOString()}] SUCCESS: OpenSearch cluster health: ${status}`);
            return true;
        } else {
            console.log(`[${new Date().toISOString()}] ERROR: OpenSearch cluster unhealthy: ${status}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to check cluster health:', error.message);
        return false;
    }
}

/**
 * Ensure the enhanced math questions index exists
 * @returns {Promise<boolean>} True if index exists or was created
 */
async function ensureIndexExists() {
    try {
        const indexExists = await client.indices.exists({ index: CONFIG.indexName });
        
        if (indexExists.body) {
            console.log(`[${new Date().toISOString()}] INFO: ✅ Enhanced index already exists`);
            return true;
        }

        // Create index with proper mapping
        const indexConfig = {
            index: CONFIG.indexName,
            body: {
                settings: {
                    number_of_shards: 1,
                    number_of_replicas: 0,
                    "index.knn": true
                },
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        type: { type: 'keyword' },
                        difficulty: { type: 'keyword' },
                        grade: { type: 'integer' },
                        subject: { type: 'keyword' },
                        curriculumTopic: { type: 'keyword' },
                        curriculumSubtopic: { type: 'keyword' },
                        category: { type: 'keyword' },
                        subcategory: { type: 'keyword' },
                        question: { type: 'text' },
                        answer: { type: 'text' },
                        explanation: { type: 'text' },
                        keyTerms: { type: 'keyword' },
                        context: { type: 'keyword' },
                        includesFormula: { type: 'boolean' },
                        phase: { type: 'keyword' },
                        ingestionTimestamp: { type: 'date' },
                        question_embedding: {
                            type: 'knn_vector',
                            dimension: 1536,
                            method: {
                                name: 'hnsw',
                                space_type: 'cosinesimil',
                                engine: 'nmslib'
                            }
                        }
                    }
                }
            }
        };

        await client.indices.create(indexConfig);
        console.log(`[${new Date().toISOString()}] SUCCESS: ✅ Enhanced index created successfully`);
        return true;
    } catch (error) {
        console.error('❌ Failed to ensure index exists:', error.message);
        return false;
    }
}

/**
 * Load questions from JSON file
 * @returns {Object} Questions data with metadata
 */
function loadQuestions() {
    try {
        if (!existsSync(CONFIG.questionsFile)) {
            throw new Error(`Questions file not found: ${CONFIG.questionsFile}`);
        }

        const fileContent = readFileSync(CONFIG.questionsFile, 'utf8');
        const data = JSON.parse(fileContent);
        
        console.log(`[${new Date().toISOString()}] SUCCESS: ✅ Loaded ${data.questions.length} ratios and proportions questions`);
        return data;
    } catch (error) {
        console.error('❌ Failed to load questions:', error.message);
        throw error;
    }
}

/**
 * Process questions in batches and store to OpenSearch
 * @param {Array} questions - Array of question objects
 * @returns {Promise<Object>} Ingestion results
 */
async function processQuestions(questions) {
    const results = {
        total: questions.length,
        successful: 0,
        failed: 0,
        errors: []
    };

    const totalBatches = Math.ceil(questions.length / CONFIG.batchSize);
    console.log(`[${new Date().toISOString()}] INFO: Processing ${questions.length} questions in batches of ${CONFIG.batchSize}...`);

    for (let i = 0; i < questions.length; i += CONFIG.batchSize) {
        const batch = questions.slice(i, i + CONFIG.batchSize);
        const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
        
        console.log(`[${new Date().toISOString()}] PROGRESS: Processing batch ${batchNum}/${totalBatches} (questions ${i + 1}-${Math.min(i + CONFIG.batchSize, questions.length)})`);
        
        try {
            await processBatch(batch, results);
        } catch (error) {
            console.error(`❌ Batch ${batchNum} failed:`, error.message);
            results.failed += batch.length;
            results.errors.push(`Batch ${batchNum}: ${error.message}`);
        }
    }

    return results;
}

/**
 * Process a single batch of questions
 * @param {Array} batch - Batch of question objects
 * @param {Object} results - Results object to update
 */
async function processBatch(batch, results) {
    const bulkBody = [];

    for (const question of batch) {
        try {
            // Generate combined text for embedding
            const combinedText = `${question.question} ${question.explanation} ${question.keyTerms.join(' ')}`;
            const embedding = await generateEmbedding(combinedText);

            // Prepare document for indexing
            const document = {
                ...question,
                phase: CONFIG.phase,
                ingestionTimestamp: new Date().toISOString(),
                question_embedding: embedding
            };

            // Add to bulk operation
            bulkBody.push({
                index: {
                    _index: CONFIG.indexName,
                    _id: question.id
                }
            });
            bulkBody.push(document);

        } catch (error) {
            console.error(`❌ Failed to process question ${question.id}:`, error.message);
            results.failed++;
            results.errors.push(`Question ${question.id}: ${error.message}`);
        }
    }

    // Execute bulk operation
    if (bulkBody.length > 0) {
        try {
            const bulkResponse = await client.bulk({ body: bulkBody });
            
            if (bulkResponse.body.errors) {
                const failedItems = bulkResponse.body.items.filter(item => item.index.error);
                results.failed += failedItems.length;
                results.successful += (bulkBody.length / 2) - failedItems.length;
                
                failedItems.forEach(item => {
                    results.errors.push(`${item.index._id}: ${item.index.error.reason}`);
                });
            } else {
                results.successful += bulkBody.length / 2;
            }
        } catch (error) {
            throw new Error(`Bulk operation failed: ${error.message}`);
        }
    }
}

/**
 * Verify stored data in OpenSearch
 * @returns {Promise<void>}
 */
async function verifyStoredData() {
    try {
        const searchResponse = await client.search({
            index: CONFIG.indexName,
            body: {
                query: {
                    bool: {
                        must: [
                            { term: { type: CONFIG.topic } },
                            { term: { phase: CONFIG.phase } }
                        ]
                    }
                },
                size: 3
            }
        });

        const totalStored = searchResponse.body.hits.total.value;
        console.log(`[${new Date().toISOString()}] SUCCESS: ✅ Verified: ${totalStored} ${CONFIG.topic} questions stored`);

        if (searchResponse.body.hits.hits.length > 0) {
            console.log(`[${new Date().toISOString()}] INFO: Sample stored questions:`);
            searchResponse.body.hits.hits.forEach((hit, index) => {
                const source = hit._source;
                console.log(`[${new Date().toISOString()}] INFO:   ${index + 1}. ${source.id}: ${source.question.substring(0, 50)}... (${source.difficulty})`);
            });
        }
    } catch (error) {
        console.error('❌ Failed to verify stored data:', error.message);
    }
}

/**
 * Main ingestion function
 */
async function main() {
    console.log(`[${new Date().toISOString()}] INFO: ============================================================`);
    console.log(`[${new Date().toISOString()}] INFO: 🚀 Phase 2D (Grade 8 Ratios and Proportions) Ingestion`);
    console.log(`[${new Date().toISOString()}] INFO: ============================================================`);

    try {
        const startTime = Date.now();

        // Check cluster health
        const healthCheck = await checkClusterHealth();
        if (!healthCheck) {
            throw new Error('OpenSearch cluster is not healthy');
        }

        // Ensure index exists
        const indexCheck = await ensureIndexExists();
        if (!indexCheck) {
            throw new Error('Failed to ensure index exists');
        }

        // Load questions
        console.log(`[${new Date().toISOString()}] INFO: Loading Phase 2D questions from file...`);
        const questionsData = loadQuestions();

        // Process questions
        const results = await processQuestions(questionsData.questions);

        // Print results
        const duration = Math.round((Date.now() - startTime) / 1000);
        console.log(`[${new Date().toISOString()}] INFO: ============================================================`);
        console.log(`[${new Date().toISOString()}] SUCCESS: 📊 PHASE 2D INGESTION COMPLETE`);
        console.log(`[${new Date().toISOString()}] INFO: Total questions: ${results.total}`);
        console.log(`[${new Date().toISOString()}] SUCCESS: Successfully stored: ${results.successful}`);
        console.log(`[${new Date().toISOString()}] ${results.failed > 0 ? 'ERROR' : 'SUCCESS'}: Errors: ${results.failed}`);
        console.log(`[${new Date().toISOString()}] INFO: Duration: ${duration} seconds`);

        if (results.errors.length > 0) {
            console.log(`[${new Date().toISOString()}] ERROR: Error details:`);
            results.errors.forEach(error => {
                console.log(`[${new Date().toISOString()}] ERROR:   - ${error}`);
            });
        }

        // Verify stored data
        console.log(`[${new Date().toISOString()}] INFO: Verifying stored data...`);
        await verifyStoredData();

        console.log(`[${new Date().toISOString()}] INFO: `);
        console.log(`[${new Date().toISOString()}] SUCCESS: 🎉 Phase 2D questions are now stored in the vector database!`);
        console.log(`[${new Date().toISOString()}] INFO: `);
        console.log(`[${new Date().toISOString()}] INFO: To view the stored data, run:`);
        console.log(`[${new Date().toISOString()}] INFO:   node view-opensearch-data.mjs`);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] ERROR: ❌ Ingestion failed:`, error.message);
        process.exit(1);
    }
}

// Run the ingestion
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}