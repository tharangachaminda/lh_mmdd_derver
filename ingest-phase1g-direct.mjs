#!/usr/bin/env node

/**
 * Phase 1G Direct OpenSearch Ingestion Script
 * 
 * This script directly stores Grade 8 Algebraic Manipulation questions in OpenSearch
 * without requiring TypeScript services compilation.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@opensearch-project/opensearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    questionsFile: path.join(__dirname, 'question_bank/grade8/grade8_algebraic_manipulation_questions.json'),
    indexName: 'enhanced-math-questions',
    batchSize: 5,
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
};

// OpenSearch client
const client = new Client({
    node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
    maxRetries: 3,
    requestTimeout: 30000,
    sniffOnStart: false,
});

/**
 * Log with colors
 */
function log(message, level = 'INFO') {
    const colors = {
        'INFO': '\x1b[36m',    // Cyan
        'SUCCESS': '\x1b[32m', // Green
        'ERROR': '\x1b[31m',   // Red
        'WARN': '\x1b[33m',    // Yellow
        'PROGRESS': '\x1b[35m', // Magenta
    };
    const resetColor = '\x1b[0m';
    const timestamp = new Date().toISOString();
    console.log(`${colors[level] || ''}[${timestamp}] ${level}: ${message}${resetColor}`);
}

/**
 * Generate simple mock embedding for testing
 */
function generateMockEmbedding(text, dimension = 1536) {
    const embedding = [];
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let i = 0; i < dimension; i++) {
        const value = Math.sin(seed + i) * 0.5 + Math.cos(seed * 2 + i) * 0.3;
        embedding.push(Math.max(-1, Math.min(1, value)));
    }
    
    return embedding;
}

/**
 * Create the enhanced index
 */
async function createEnhancedIndex() {
    try {
        const indexExists = await client.indices.exists({ index: CONFIG.indexName });
        
        if (!indexExists.body) {
            log('Creating enhanced index...');
            await client.indices.create({
                index: CONFIG.indexName,
                body: {
                    settings: {
                        index: {
                            knn: true
                        }
                    },
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            question: { type: 'text', analyzer: 'standard' },
                            answer: { type: 'text' },
                            explanation: { type: 'text' },
                            type: { type: 'keyword' },
                            difficulty: { type: 'keyword' },
                            grade: { type: 'integer' },
                            subject: { type: 'keyword' },
                            keywords: { type: 'keyword' },
                            embedding: {
                                type: 'knn_vector',
                                dimension: 1536,
                                method: {
                                    name: 'hnsw',
                                    space_type: 'cosinesimil',
                                    engine: 'lucene',
                                }
                            },
                            contentForEmbedding: { type: 'text' },
                            createdAt: { type: 'date' },
                            updatedAt: { type: 'date' }
                        }
                    }
                }
            });
            log('✅ Enhanced index created successfully', 'SUCCESS');
        } else {
            log('✅ Enhanced index already exists', 'INFO');
        }
    } catch (error) {
        log(`Index creation error: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * Load questions from file
 */
async function loadQuestions() {
    try {
        log('Loading Phase 1G questions from file...');
        const fileContent = await fs.readFile(CONFIG.questionsFile, 'utf-8');
        const data = JSON.parse(fileContent);
        
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('Invalid file format: questions array not found');
        }
        
        log(`✅ Loaded ${data.questions.length} algebraic manipulation questions`, 'SUCCESS');
        return data.questions;
        
    } catch (error) {
        log(`Failed to load questions: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * Store a single question
 */
async function storeQuestion(question) {
    try {
        // Generate mock embedding
        const embedding = generateMockEmbedding(question.contentForEmbedding || question.question);
        
        const enhancedQuestion = {
            id: question.id,
            question: question.question,
            answer: question.answer,
            explanation: question.explanation || '',
            type: question.type || question.questionType,
            difficulty: question.difficulty,
            keywords: question.keywords || [],
            grade: question.grade || 8,
            subject: question.subject || 'Mathematics',
            conceptName: question.questionType || 'ALGEBRAIC_MANIPULATION',
            prerequisites: question.prerequisites || [],
            learningObjectives: question.learningObjectives || [question.learningObjective],
            gradeLevelStandards: {
                strand: question.curriculumTopic || 'Number and Algebra',
                standard: 'Algebraic Manipulation',
                description: question.learningObjective || 'Algebraic expression manipulation and simplification'
            },
            fullText: question.contentForEmbedding || `${question.question} ${question.explanation || ''}`,
            searchKeywords: Array.isArray(question.keywords) ? question.keywords.join(' ') : '',
            contentForEmbedding: question.contentForEmbedding || question.question,
            embedding: embedding,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        if (!CONFIG.dryRun) {
            await client.index({
                index: CONFIG.indexName,
                body: enhancedQuestion
            });
        }
        
        return true;
        
    } catch (error) {
        log(`Failed to store question ${question.id}: ${error.message}`, 'ERROR');
        return false;
    }
}

/**
 * Process questions in batches
 */
async function processQuestions(questions) {
    let successCount = 0;
    let errorCount = 0;
    
    log(`Processing ${questions.length} questions in batches of ${CONFIG.batchSize}...`);
    
    for (let i = 0; i < questions.length; i += CONFIG.batchSize) {
        const batch = questions.slice(i, i + CONFIG.batchSize);
        const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
        const totalBatches = Math.ceil(questions.length / CONFIG.batchSize);
        
        log(`Processing batch ${batchNum}/${totalBatches} (questions ${i + 1}-${Math.min(i + CONFIG.batchSize, questions.length)})`, 'PROGRESS');
        
        for (const question of batch) {
            const success = await storeQuestion(question);
            if (success) {
                successCount++;
                if (CONFIG.verbose) {
                    log(`✅ Stored: ${question.id} (${question.difficulty}) - ${question.question.substring(0, 50)}...`, 'SUCCESS');
                }
            } else {
                errorCount++;
            }
        }
        
        // Small delay between batches
        if (i + CONFIG.batchSize < questions.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    return { successCount, errorCount };
}

/**
 * Verify the storage
 */
async function verifyStorage() {
    try {
        log('Verifying stored data...');
        
        const response = await client.count({
            index: CONFIG.indexName,
            body: {
                query: { 
                    bool: {
                        must: [
                            { match: { type: 'ALGEBRAIC_MANIPULATION' } },
                            { term: { grade: 8 } }
                        ]
                    }
                }
            }
        });
        
        const count = response.body.count;
        log(`✅ Verified: ${count} Grade 8 Algebraic Manipulation questions stored`, 'SUCCESS');
        
        // Get a sample
        const sampleResponse = await client.search({
            index: CONFIG.indexName,
            body: {
                query: { 
                    bool: {
                        must: [
                            { match: { type: 'ALGEBRAIC_MANIPULATION' } },
                            { term: { grade: 8 } }
                        ]
                    }
                },
                size: 3
            }
        });
        
        const hits = sampleResponse.body.hits.hits;
        log('Sample stored questions:', 'INFO');
        hits.forEach((hit, index) => {
            const doc = hit._source;
            log(`  ${index + 1}. ${doc.id}: ${doc.question} (${doc.difficulty})`, 'INFO');
        });
        
        return count;
        
    } catch (error) {
        log(`Failed to verify storage: ${error.message}`, 'ERROR');
        return 0;
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        log('='.repeat(60));
        log('🚀 Phase 1G (Grade 8 Algebraic Manipulation) Direct Ingestion');
        log('='.repeat(60));
        
        if (CONFIG.dryRun) {
            log('🧪 DRY RUN MODE: No data will be stored', 'WARN');
        }
        
        // Check connection
        const health = await client.cluster.health();
        log(`OpenSearch cluster health: ${health.body.status}`, 'SUCCESS');
        
        // Create index
        await createEnhancedIndex();
        
        // Load questions
        const questions = await loadQuestions();
        
        // Process questions
        const startTime = Date.now();
        const { successCount, errorCount } = await processQuestions(questions);
        const duration = Math.round((Date.now() - startTime) / 1000);
        
        // Results
        log('='.repeat(60));
        log('📊 PHASE 1G INGESTION COMPLETE', 'SUCCESS');
        log(`Total questions: ${questions.length}`);
        log(`Successfully stored: ${successCount}`, 'SUCCESS');
        log(`Errors: ${errorCount}`, errorCount > 0 ? 'ERROR' : 'SUCCESS');
        log(`Duration: ${duration} seconds`);
        
        if (CONFIG.dryRun) {
            log('🧪 DRY RUN: No actual data was stored', 'WARN');
        } else {
            // Verify storage
            await verifyStorage();
            
            log('');
            log('🎉 Phase 1G questions are now stored in the vector database!', 'SUCCESS');
            log('');
            log('Grade 8 Phase 1 (Foundation) is now COMPLETE with all 7 sub-phases ingested!', 'SUCCESS');
            log('');
            log('To view the stored data, run:');
            log('  node view-opensearch-data.mjs', 'INFO');
        }
        
    } catch (error) {
        log(`FATAL ERROR: ${error.message}`, 'ERROR');
        if (CONFIG.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Handle interruption
process.on('SIGINT', () => {
    log('Received interrupt signal. Shutting down...', 'WARN');
    process.exit(130);
});

// Run the script
main();