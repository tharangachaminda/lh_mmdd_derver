#!/usr/bin/env node

/**
 * Grade 5 Questions Vector Database Ingestion Script
 * 
 * This script loads the Grade 5 comprehensive questions into OpenSearch
 * with generated embeddings for semantic search capabilities.
 * 
 * Usage:
 *   node ingest-grade5-questions.mjs [options]
 * 
 * Options:
 *   --dry-run     : Test the process without actually storing data
 *   --batch-size  : Number of questions to process at once (default: 5)
 *   --skip-embeddings : Skip embedding generation (for testing schema only)
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
import { OpenSearchService } from './src/services/opensearch.service.js';
import { EmbeddingService } from './src/services/embedding.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    questionsFile: path.join(__dirname, 'grade5-questions-vector-ready.json'),
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
        log('Loading questions from file...');
        const fileContent = await fs.readFile(CONFIG.questionsFile, 'utf-8');
        const data = JSON.parse(fileContent);
        
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('Invalid file format: questions array not found');
        }
        
        log(`Loaded ${data.questions.length} questions from file`);
        log(`Grade: ${data.metadata.grade}, Subject: ${data.metadata.subject}`);
        log(`Difficulty distribution: Easy(${data.metadata.difficultyDistribution.easy}), Medium(${data.metadata.difficultyDistribution.medium}), Hard(${data.metadata.difficultyDistribution.hard})`);
        
        return data.questions;
    } catch (error) {
        throw new Error(`Failed to load questions file: ${error.message}`);
    }
}

/**
 * Initialize services and test connections
 */
async function initializeServices() {
    log('Initializing services...');
    
    const openSearchService = new OpenSearchService();
    const embeddingService = new EmbeddingService();
    
    // Test OpenSearch connection
    try {
        log('Testing OpenSearch connection...');
        const healthCheck = await openSearchService.testConnection();
        if (!healthCheck.status) {
            throw new Error(`OpenSearch connection failed: ${healthCheck.message}`);
        }
        log('OpenSearch connection successful', 'SUCCESS');
    } catch (error) {
        throw new Error(`OpenSearch initialization failed: ${error.message}`);
    }
    
    // Test embedding service connection (if not skipping embeddings)
    if (!CONFIG.skipEmbeddings) {
        try {
            log('Testing embedding service connection...');
            const embeddingConnected = await embeddingService.testConnection();
            if (!embeddingConnected) {
                throw new Error('Embedding service connection failed');
            }
            log('Embedding service connection successful', 'SUCCESS');
        } catch (error) {
            log(`Embedding service warning: ${error.message}`, 'WARN');
            log('Continuing without embeddings (--skip-embeddings mode)', 'WARN');
            CONFIG.skipEmbeddings = true;
        }
    }
    
    // Initialize enhanced index
    try {
        log('Initializing enhanced index schema...');
        await openSearchService.initializeEnhancedIndex();
        log('Enhanced index initialized successfully', 'SUCCESS');
    } catch (error) {
        throw new Error(`Index initialization failed: ${error.message}`);
    }
    
    return { openSearchService, embeddingService };
}

/**
 * Process a single question: generate embedding and prepare for storage
 */
async function processQuestion(question, embeddingService) {
    try {
        let embedding = null;
        
        if (!CONFIG.skipEmbeddings) {
            // Generate embedding from the optimized content
            embedding = await embeddingService.generateEmbedding(question.contentForEmbedding);
            
            if (CONFIG.verbose) {
                log(`Generated embedding for question ${question.id}: ${embedding.length} dimensions`);
            }
        }
        
        // Prepare enhanced question object
        const enhancedQuestion = {
            id: question.id,
            question: question.question,
            answer: question.answer,
            explanation: question.explanation,
            type: question.type,
            difficulty: question.difficulty,
            keywords: question.keywords,
            grade: question.grade,
            subject: question.subject,
            conceptName: question.conceptName,
            prerequisites: question.prerequisites,
            learningObjectives: question.learningObjectives,
            gradeLevelStandards: question.gradeLevelStandards,
            fullText: question.fullText,
            searchKeywords: question.searchKeywords,
            contentForEmbedding: question.contentForEmbedding,
            embedding: embedding
        };
        
        return enhancedQuestion;
    } catch (error) {
        throw new Error(`Failed to process question ${question.id}: ${error.message}`);
    }
}

/**
 * Process questions in batches
 */
async function processQuestionsBatch(questions, services, startIndex = 0) {
    const { openSearchService, embeddingService } = services;
    const endIndex = Math.min(startIndex + CONFIG.batchSize, questions.length);
    const batch = questions.slice(startIndex, endIndex);
    
    log(`Processing batch ${Math.floor(startIndex / CONFIG.batchSize) + 1}: questions ${startIndex + 1}-${endIndex}`);
    
    const batchResults = [];
    
    for (const question of batch) {
        try {
            displayProgress(processedCount + 1, questions.length, `Processing ${question.id}...`);
            
            const enhancedQuestion = await processQuestion(question, embeddingService);
            
            if (!CONFIG.dryRun) {
                await openSearchService.storeEnhancedQuestion(enhancedQuestion);
            }
            
            batchResults.push({ success: true, questionId: question.id });
            successCount++;
            
        } catch (error) {
            const errorInfo = {
                questionId: question.id,
                error: error.message,
                index: processedCount
            };
            errors.push(errorInfo);
            batchResults.push({ success: false, questionId: question.id, error: error.message });
            errorCount++;
            
            if (CONFIG.verbose) {
                log(`Failed to process question ${question.id}: ${error.message}`, 'ERROR');
            }
        }
        
        processedCount++;
    }
    
    return batchResults;
}

/**
 * Main execution function
 */
async function main() {
    try {
        log('='.repeat(60));
        log('Grade 5 Questions Vector Database Ingestion');
        log('='.repeat(60));
        
        if (CONFIG.dryRun) {
            log('DRY RUN MODE: No data will be stored', 'WARN');
        }
        
        if (CONFIG.skipEmbeddings) {
            log('SKIP EMBEDDINGS MODE: Questions will be stored without embeddings', 'WARN');
        }
        
        // Load questions
        const questions = await loadQuestions();
        
        // Initialize services
        const services = await initializeServices();
        
        // Process questions in batches
        log(`Starting batch processing with batch size: ${CONFIG.batchSize}`);
        log(`Total questions to process: ${questions.length}`);
        
        const startTime = Date.now();
        
        for (let i = 0; i < questions.length; i += CONFIG.batchSize) {
            await processQuestionsBatch(questions, services, i);
            
            // Small delay between batches to be respectful to services
            if (i + CONFIG.batchSize < questions.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        // Final results
        log('='.repeat(60));
        log('PROCESSING COMPLETE', 'SUCCESS');
        log(`Total processed: ${processedCount}`);
        log(`Successful: ${successCount}`, 'SUCCESS');
        log(`Failed: ${errorCount}`, errorCount > 0 ? 'ERROR' : 'INFO');
        log(`Duration: ${duration} seconds`);
        log(`Average: ${Math.round(questions.length / duration * 100) / 100} questions/second`);
        
        if (CONFIG.dryRun) {
            log('DRY RUN COMPLETE - No data was actually stored', 'WARN');
        }
        
        // Display errors if any
        if (errors.length > 0) {
            log('\nERRORS ENCOUNTERED:', 'ERROR');
            errors.forEach((error, index) => {
                log(`${index + 1}. Question ${error.questionId}: ${error.error}`, 'ERROR');
            });
        }
        
        // Success/failure exit codes
        if (errorCount === 0) {
            log('All questions processed successfully!', 'SUCCESS');
            process.exit(0);
        } else if (successCount > 0) {
            log(`Partial success: ${successCount}/${questions.length} questions processed`, 'WARN');
            process.exit(1);
        } else {
            log('All questions failed to process', 'ERROR');
            process.exit(2);
        }
        
    } catch (error) {
        log(`FATAL ERROR: ${error.message}`, 'ERROR');
        process.exit(3);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    log('\nReceived SIGINT. Shutting down gracefully...', 'WARN');
    log(`Processed ${successCount}/${processedCount} questions before shutdown`);
    process.exit(130);
});

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled rejection at: ${promise}, reason: ${reason}`, 'ERROR');
    process.exit(4);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}