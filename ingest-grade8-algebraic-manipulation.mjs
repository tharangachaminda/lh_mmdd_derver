#!/usr/bin/env node

/**
 * Grade 8 Algebraic Manipulation Ingestion Script
 * Validates and ingests Grade 8 ALGEBRAIC_MANIPULATION questions into vector database
 * 
 * Usage: 
 *   node ingest-grade8-algebraic-manipulation.mjs
 */

import { readFileSync } from 'fs';
import { OpenSearchService } from './dist/services/opensearch.service.js';
import { EmbeddingService } from './dist/services/embedding.service.js';

// Configuration
const CONFIG = {
    questionsFile: './question_bank/grade8/grade8_algebraic_manipulation_questions.json',
    verbose: true,
    dryRun: false  // Set to true to validate without storing
};

/**
 * Logger function
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const colors = {
        'INFO': '\x1b[36m',    // Cyan
        'SUCCESS': '\x1b[32m', // Green  
        'ERROR': '\x1b[31m',   // Red
        'WARN': '\x1b[33m'     // Yellow
    };
    const resetColor = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}[${timestamp}] [${level}] ${message}${resetColor}`);
}

/**
 * Validate question structure
 */
function validateQuestion(question, index) {
    const errors = [];
    
    // Required fields - adjusted for our dataset structure
    const requiredFields = ['id', 'question', 'answer', 'difficulty', 'questionType'];
    requiredFields.forEach(field => {
        if (!question[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    });
    
    // Validate specific patterns
    if (question.questionType && question.questionType !== 'ALGEBRAIC_MANIPULATION') {
        errors.push(`Invalid questionType: expected ALGEBRAIC_MANIPULATION, got ${question.questionType}`);
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Validate the entire question file
 */
function validateQuestionFile(data) {
    const results = {
        valid: true,
        totalQuestions: 0,
        validQuestions: 0,
        invalidQuestions: 0,
        errors: []
    };
    
    // Validate metadata
    if (!data.metadata) {
        results.errors.push('Missing metadata section');
        results.valid = false;
    }
    
    // Validate questions array
    if (!Array.isArray(data.questions)) {
        results.errors.push('Questions must be an array');
        results.valid = false;
        return results;
    }
    
    results.totalQuestions = data.questions.length;
    
    // Validate each question
    data.questions.forEach((question, index) => {
        const validation = validateQuestion(question, index);
        if (validation.valid) {
            results.validQuestions++;
        } else {
            results.invalidQuestions++;
            results.errors.push(`Question ${index + 1} (${question.id || 'no-id'}): ${validation.errors.join(', ')}`);
        }
    });
    
    if (results.invalidQuestions > 0) {
        results.valid = false;
    }
    
    return results;
}

/**
 * Ingest questions into vector database
 */
async function ingestQuestions(data, openSearchService, embeddingService) {
    const results = {
        successful: 0,
        failed: 0,
        errors: []
    };
    
    log(`Starting ingestion of ${data.questions.length} questions...`);
    
    for (const question of data.questions) {
        try {
            // Generate embedding content
            const embeddingText = question.contentForEmbedding || 
                `${question.question} ${question.explanation || ''} ${question.keywords?.join(' ') || ''}`;
            
            // Generate embedding
            const embedding = await embeddingService.generateEmbedding(embeddingText);
            
            // Prepare document for storage
            const document = {
                id: question.id,
                question: question.question,
                answer: question.answer,
                explanation: question.explanation || '',
                difficulty: question.difficulty,
                grade: question.grade || 8, // Default to Grade 8
                subject: question.subject || 'Mathematics',
                type: question.questionType || question.type || 'ALGEBRAIC_MANIPULATION',
                questionType: question.questionType || 'ALGEBRAIC_MANIPULATION',
                curriculumTopic: question.curriculumTopic || 'Number and Algebra',
                learningObjective: question.learningObjective || '',
                keywords: question.keywords || [],
                contextualisation: question.contextualisation || '',
                verified: question.verified || false,
                documentType: question.documentType || 'question',
                // Enhanced fields for better search
                prerequisites: question.prerequisites || [],
                learningObjectives: question.learningObjectives || [],
                gradeLevelStandards: question.gradeLevelStandards || {
                    strand: question.curriculumTopic || 'Number and Algebra',
                    standard: question.curriculumSubtopic || 'Algebraic Manipulation',
                    description: question.learningObjective || 'Algebraic expression manipulation and simplification'
                },
                fullText: question.contentForEmbedding || `${question.question} ${question.explanation || ''}`,
                searchKeywords: Array.isArray(question.keywords) ? question.keywords.join(' ') : (question.keywords || ''),
                contentForEmbedding: embeddingText,
                embedding: embedding,
                ingestionTimestamp: new Date().toISOString()
            };
            
            // Store in OpenSearch
            if (!CONFIG.dryRun) {
                await openSearchService.storeEnhancedQuestion(document);
            }
            
            results.successful++;
            
            if (CONFIG.verbose && results.successful % 5 === 0) {
                log(`Ingested ${results.successful}/${data.questions.length} questions...`);
            }
            
        } catch (error) {
            results.failed++;
            results.errors.push(`Failed to ingest question ${question.id}: ${error.message}`);
            log(`Failed to ingest question ${question.id}: ${error.message}`, 'ERROR');
        }
    }
    
    return results;
}

/**
 * Test search functionality
 */
async function testSearchFunctionality(openSearchService) {
    log('Testing search functionality...');
    
    const testQueries = [
        'expand algebraic expression',
        'simplify like terms',
        'substitute variables',
        'formula application',
        'distributive property'
    ];
    
    for (const query of testQueries) {
        try {
            const results = await openSearchService.searchQuestions(query, {
                grade: 8,
                type: 'ALGEBRAIC_MANIPULATION',
                limit: 3
            });
            
            if (results.questions && results.questions.length > 0) {
                log(`✅ Search "${query}": Found ${results.questions.length} results`, 'SUCCESS');
            } else {
                log(`⚠️ Search "${query}": No results found`, 'WARN');
            }
            
        } catch (error) {
            log(`❌ Search "${query}": Failed - ${error.message}`, 'ERROR');
        }
    }
}

/**
 * Main execution function
 */
async function main() {
    try {
        log('='.repeat(70));
        log('Grade 8 Algebraic Manipulation Ingestion Script');
        log('='.repeat(70));
        
        // Load the questions file
        log(`Loading questions from: ${CONFIG.questionsFile}`);
        const fileContent = readFileSync(CONFIG.questionsFile, 'utf-8');
        const data = JSON.parse(fileContent);
        
        // Validate the file
        log('Validating question file...');
        const validation = validateQuestionFile(data);
        
        log(`Validation Results:`);
        log(`  Total Questions: ${validation.totalQuestions}`);
        log(`  Valid Questions: ${validation.validQuestions}`);
        log(`  Invalid Questions: ${validation.invalidQuestions}`);
        log(`  Overall Valid: ${validation.valid ? '✅ YES' : '❌ NO'}`);
        
        if (validation.errors.length > 0) {
            log('Validation Errors:');
            validation.errors.forEach(error => log(`  - ${error}`, 'ERROR'));
        }
        
        if (!validation.valid) {
            log('❌ Validation failed. Fix errors before ingesting.', 'ERROR');
            process.exit(1);
        }
        
        if (CONFIG.dryRun) {
            log('✅ DRY RUN: Validation successful. No data ingested.', 'SUCCESS');
            process.exit(0);
        }
        
        // Initialize services
        log('Initializing services...');
        const openSearchService = new OpenSearchService();
        const embeddingService = new EmbeddingService();
        
        // Test connections
        log('Testing service connections...');
        await openSearchService.testConnection();
        await embeddingService.testConnection();
        log('✅ Service connections successful', 'SUCCESS');
        
        // Ingest questions
        log('Starting ingestion process...');
        const ingestionResults = await ingestQuestions(data, openSearchService, embeddingService);
        
        // Display results
        log('='.repeat(50));
        log('INGESTION COMPLETE', 'SUCCESS');
        log('='.repeat(50));
        log(`Successfully ingested: ${ingestionResults.successful}`);
        log(`Failed to ingest: ${ingestionResults.failed}`);
        
        if (ingestionResults.errors.length > 0) {
            log('Ingestion Errors:');
            ingestionResults.errors.forEach(error => log(`  - ${error}`, 'ERROR'));
        }
        
        // Test search functionality
        if (ingestionResults.successful > 0) {
            await testSearchFunctionality(openSearchService);
        }
        
        log('✅ Grade 8 Algebraic Manipulation ingestion complete!', 'SUCCESS');
        
    } catch (error) {
        log(`❌ Fatal error: ${error.message}`, 'ERROR');
        if (CONFIG.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run the script
main();