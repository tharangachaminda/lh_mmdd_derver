#!/usr/bin/env node

/**
 * Grade 8 Number Patterns Vector Database Ingestion Script
 * 
 * This script loads the Grade 8 Phase 1E NUMBER_PATTERNS questions into OpenSearch
 * with generated embeddings for semantic search capabilities.
 * 
 * Usage:
 *   node ingest-grade8-patterns.mjs [options]
 * 
 * Options:
 *   --dry-run     : Test the process without actually storing data
 *   --batch-size  : Number of questions to process at once (default: 5)
 *   --skip-embeddings : Skip embedding generation (for testing schema only)
 *   --verbose     : Enable detailed logging
 * 
 * Prerequisites:
 *   - OpenSearch running on localhost:9200 (or configured endpoint)
 *   - Ollama running with nomic-embed-text model (or configured embedding service)
 * 
 * Environment Variables:
 *   OPENSEARCH_NODE     : OpenSearch endpoint (default: https://localhost:9200)
 *   OPENSEARCH_USERNAME : Username for OpenSearch (default: admin)
 *   OPENSEARCH_PASSWORD : Password for OpenSearch
 *   OLLAMA_ENDPOINT     : Ollama endpoint (default: http://localhost:11434)
 *   EMBEDDING_MODEL     : Embedding model name (default: nomic-embed-text)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenSearchService } from './dist/services/opensearch.service.js';
import { EmbeddingService } from './dist/services/embedding.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    questionsFile: path.join(__dirname, 'question_bank/grade8/grade8_number_patterns_questions.json'),
    indexName: 'learning-hub-grade8-patterns',
    batchSize: parseInt(process.env.BATCH_SIZE) || 5,
    dryRun: process.argv.includes('--dry-run'),
    skipEmbeddings: process.argv.includes('--skip-embeddings'),
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
};

// Progress tracking
let processedCount = 0;
let successCount = 0;
let errorCount = 0;
const errors = [];

/**
 * Log message with timestamp
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const levelColor = {
        'INFO': '\x1b[36m',  // Cyan
        'SUCCESS': '\x1b[32m', // Green
        'ERROR': '\x1b[31m',   // Red
        'WARN': '\x1b[33m',    // Yellow
    }[level] || '';
    const resetColor = '\x1b[0m';
    
    console.log(`${levelColor}[${timestamp}] ${level}: ${message}${resetColor}`);
}

/**
 * Display progress information
 */
function displayProgress(current, total, status = '') {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
    
    process.stdout.write(`\r[${progressBar}] ${percentage}% (${current}/${total}) ${status}`);
    if (current === total) {
        console.log(); // New line when complete
    }
}

/**
 * Load and validate questions data
 */
async function loadQuestions() {
    try {
        log('Loading Grade 8 Number Patterns questions...');
        const fileContent = await fs.readFile(CONFIG.questionsFile, 'utf-8');
        const data = JSON.parse(fileContent);
        
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('Invalid file format: questions array not found');
        }
        
        log(`Loaded ${data.questions.length} questions from file`);
        log(`Grade: ${data.metadata.grade}, Subject: ${data.metadata.subject}`);
        log(`Topic: ${data.metadata.curriculumTopic} - ${data.metadata.curriculumSubtopic}`);
        log(`Difficulty distribution: Easy(${data.metadata.difficultyDistribution.easy}), Medium(${data.metadata.difficultyDistribution.medium}), Hard(${data.metadata.difficultyDistribution.hard})`);
        
        if (data.metadata.patternTypes) {
            log(`Pattern types: ${data.metadata.patternTypes.join(', ')}`);
        }
        
        return data.questions;
    } catch (error) {
        log(`Error loading questions: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * Process questions in batches
 */
async function processQuestionsBatch(questions, batchIndex, embeddingService, openSearchService) {
    const startIdx = batchIndex * CONFIG.batchSize;
    const endIdx = Math.min(startIdx + CONFIG.batchSize, questions.length);
    const batch = questions.slice(startIdx, endIdx);
    
    log(`Processing batch ${batchIndex + 1} (questions ${startIdx + 1}-${endIdx})...`);
    
    const processedQuestions = [];
    
    for (const question of batch) {
        try {
            processedCount++;
            
            // Generate embedding if not skipped
            let embedding = null;
            if (!CONFIG.skipEmbeddings) {
                const contentToEmbed = question.contentForEmbedding || 
                    `${question.question} ${question.explanation} ${question.keywords?.join(' ') || ''}`;
                
                if (CONFIG.verbose) {
                    log(`Generating embedding for question ${question.id}...`);
                }
                
                embedding = await embeddingService.generateEmbedding(contentToEmbed);
            }
            
            // Prepare document for OpenSearch
            const document = {
                ...question,
                embedding: embedding,
                indexedAt: new Date().toISOString(),
                vectorVersion: '1.1',
                patternType: question.questionType || 'NUMBER_PATTERNS'
            };
            
            processedQuestions.push(document);
            successCount++;
            
            displayProgress(processedCount, questions.length, `Processing ${question.id}`);
            
        } catch (error) {
            errorCount++;
            const errorMsg = `Failed to process question ${question.id}: ${error.message}`;
            errors.push(errorMsg);
            log(errorMsg, 'ERROR');
            
            displayProgress(processedCount, questions.length, `Error: ${question.id}`);
        }
    }
    
    // Store batch in OpenSearch if not dry run
    if (!CONFIG.dryRun && processedQuestions.length > 0) {
        try {
            log(`Storing batch ${batchIndex + 1} in OpenSearch...`);
            await openSearchService.bulkIndexDocuments(CONFIG.indexName, processedQuestions);
            log(`Successfully stored ${processedQuestions.length} questions`, 'SUCCESS');
        } catch (error) {
            log(`Error storing batch ${batchIndex + 1}: ${error.message}`, 'ERROR');
            throw error;
        }
    }
    
    return processedQuestions.length;
}

/**
 * Setup OpenSearch index with proper mappings
 */
async function setupIndex(openSearchService) {
    try {
        log('Setting up OpenSearch index...');
        
        const indexMapping = {
            mappings: {
                properties: {
                    id: { type: 'keyword' },
                    grade: { type: 'integer' },
                    subject: { type: 'keyword' },
                    questionType: { type: 'keyword' },
                    patternType: { type: 'keyword' },
                    difficulty: { type: 'keyword' },
                    curriculumTopic: { type: 'text' },
                    learningObjective: { type: 'text' },
                    question: { 
                        type: 'text',
                        analyzer: 'standard'
                    },
                    answer: { type: 'text' },
                    explanation: { 
                        type: 'text',
                        analyzer: 'standard'
                    },
                    keywords: { 
                        type: 'keyword',
                        fields: {
                            text: {
                                type: 'text',
                                analyzer: 'standard'
                            }
                        }
                    },
                    contentForEmbedding: { 
                        type: 'text',
                        analyzer: 'standard'
                    },
                    contextualisation: { type: 'text' },
                    embedding: {
                        type: 'dense_vector',
                        dims: 768,
                        index: true,
                        similarity: 'cosine'
                    },
                    indexedAt: { type: 'date' },
                    vectorVersion: { type: 'keyword' },
                    verified: { type: 'boolean' },
                    documentType: { type: 'keyword' }
                }
            },
            settings: {
                number_of_shards: 1,
                number_of_replicas: 0,
                'index.knn': true
            }
        };
        
        // Check if index exists
        const exists = await openSearchService.indexExists(CONFIG.indexName);
        
        if (exists && !CONFIG.dryRun) {
            log(`Index ${CONFIG.indexName} already exists. Deleting and recreating...`, 'WARN');
            await openSearchService.deleteIndex(CONFIG.indexName);
        }
        
        if (!CONFIG.dryRun) {
            await openSearchService.createIndex(CONFIG.indexName, indexMapping);
            log(`Created index ${CONFIG.indexName}`, 'SUCCESS');
        } else {
            log(`[DRY RUN] Would create index ${CONFIG.indexName}`, 'INFO');
        }
        
    } catch (error) {
        log(`Error setting up index: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * Test search functionality with sample queries
 */
async function testSearchFunctionality(openSearchService) {
    log('Testing search functionality...');
    
    const testQueries = [
        {
            name: 'Arithmetic Sequence Search',
            query: 'arithmetic sequence constant difference pattern',
            description: 'Testing search for arithmetic patterns'
        },
        {
            name: 'Geometric Pattern Search', 
            query: 'geometric sequence multiplication ratio doubling',
            description: 'Testing search for geometric patterns'
        },
        {
            name: 'Triangular Numbers Search',
            query: 'triangular numbers second order differences',
            description: 'Testing search for triangular number patterns'
        },
        {
            name: 'Real-world Application Search',
            query: 'restaurant tables business growth practical application',
            description: 'Testing search for real-world contexts'
        },
        {
            name: 'Algebraic Expression Search',
            query: 'algebraic expression nth term formula symbolic representation',
            description: 'Testing search for algebraic concepts'
        }
    ];
    
    for (const testQuery of testQueries) {
        try {
            log(`Testing: ${testQuery.name}...`);
            
            const searchRequest = {
                query: {
                    multi_match: {
                        query: testQuery.query,
                        fields: [
                            'question^2',
                            'explanation^1.5', 
                            'keywords.text^2',
                            'contentForEmbedding^1.5',
                            'learningObjective'
                        ],
                        type: 'best_fields',
                        fuzziness: 'AUTO'
                    }
                },
                size: 3,
                _source: ['id', 'question', 'difficulty', 'questionType']
            };
            
            const results = await openSearchService.search(CONFIG.indexName, searchRequest);
            
            if (results.hits.hits.length > 0) {
                log(`✅ ${testQuery.name}: Found ${results.hits.hits.length} results`, 'SUCCESS');
                if (CONFIG.verbose) {
                    results.hits.hits.forEach((hit, index) => {
                        log(`  ${index + 1}. ${hit._source.id} (${hit._source.difficulty}): ${hit._source.question.substring(0, 80)}...`);
                    });
                }
            } else {
                log(`⚠️  ${testQuery.name}: No results found`, 'WARN');
            }
            
        } catch (error) {
            log(`❌ ${testQuery.name}: Search failed - ${error.message}`, 'ERROR');
        }
    }
}

/**
 * Display final statistics
 */
function displayFinalStats(totalQuestions, startTime) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n' + '='.repeat(80));
    log('INGESTION COMPLETE', 'SUCCESS');
    console.log('='.repeat(80));
    
    log(`Total questions processed: ${totalQuestions}`);
    log(`Successfully processed: ${successCount}`);
    log(`Errors encountered: ${errorCount}`);
    log(`Processing time: ${duration.toFixed(2)} seconds`);
    log(`Average time per question: ${(duration / totalQuestions).toFixed(3)} seconds`);
    
    if (CONFIG.dryRun) {
        log('This was a DRY RUN - no data was actually stored', 'WARN');
    }
    
    if (errors.length > 0) {
        log(`\nErrors encountered:`, 'ERROR');
        errors.forEach(error => log(`  - ${error}`, 'ERROR'));
    }
    
    console.log('='.repeat(80));
}

/**
 * Main execution function
 */
async function main() {
    const startTime = Date.now();
    
    log('🚀 Grade 8 Number Patterns Vector Database Ingestion', 'INFO');
    log(`Configuration: Index=${CONFIG.indexName}, BatchSize=${CONFIG.batchSize}, DryRun=${CONFIG.dryRun}`);
    
    try {
        // Initialize services
        const embeddingService = new EmbeddingService();
        const openSearchService = new OpenSearchService();
        
        // Test connections
        log('Testing service connections...');
        if (!CONFIG.skipEmbeddings) {
            await embeddingService.testConnection();
        }
        await openSearchService.testConnection();
        
        // Load questions
        const questions = await loadQuestions();
        
        // Setup index
        await setupIndex(openSearchService);
        
        // Process questions in batches
        const totalBatches = Math.ceil(questions.length / CONFIG.batchSize);
        log(`Processing ${questions.length} questions in ${totalBatches} batches...`);
        
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            await processQuestionsBatch(questions, batchIndex, embeddingService, openSearchService);
        }
        
        // Test search functionality if not dry run
        if (!CONFIG.dryRun) {
            await testSearchFunctionality(openSearchService);
        }
        
        // Display final statistics
        displayFinalStats(questions.length, startTime);
        
        process.exit(0);
        
    } catch (error) {
        log(`Fatal error: ${error.message}`, 'ERROR');
        if (CONFIG.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run the main function
main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});