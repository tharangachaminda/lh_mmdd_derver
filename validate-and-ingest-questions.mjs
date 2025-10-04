#!/usr/bin/env node

/**
 * Question Validator and Vector DB Ingestion Script
 * 
 * Validates question JSON files and ingests them into the vector database.
 * 
 * Usage: 
 *   node validate-and-ingest-questions.mjs --file <path-to-questions.json>
 *   node validate-and-ingest-questions.mjs --file grade3-questions.json
 */

import { readFileSync } from 'fs';
import { OpenSearchService } from './dist/services/opensearch.service.js';
import { EmbeddingService } from './dist/services/embedding.service.js';

// Configuration
const CONFIG = {
    verbose: true,
    dryRun: false  // Set to true to validate without storing
};

/**
 * Logger function
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
}

/**
 * Validate question structure
 */
function validateQuestion(question, index) {
    const errors = [];
    
    // Required fields
    const requiredFields = ['id', 'question', 'answer', 'type', 'difficulty', 'grade', 'subject'];
    for (const field of requiredFields) {
        if (!question[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    
    // Validate question content
    if (question.question && question.question.length < 10) {
        errors.push('Question text too short (minimum 10 characters)');
    }
    
    // Validate answer
    if (!question.answer || (typeof question.answer !== 'string' && typeof question.answer !== 'number')) {
        errors.push('Answer must be a string or number');
    }
    
    // Validate difficulty
    if (question.difficulty && !['easy', 'medium', 'hard'].includes(question.difficulty)) {
        errors.push('Difficulty must be easy, medium, or hard');
    }
    
    // Validate grade
    if (question.grade && (question.grade < 3 || question.grade > 8)) {
        errors.push('Grade must be between 3 and 8');
    }
    
    // Check for placeholder text
    const placeholderPatterns = [
        /lorem ipsum/i,
        /placeholder/i,
        /example text/i,
        /test question/i,
        /\[.*\]/,
        /question here/i,
        /answer here/i,
        /undefined/i,
        /null/i
    ];
    
    for (const pattern of placeholderPatterns) {
        if (pattern.test(question.question) || pattern.test(String(question.answer))) {
            errors.push('Contains placeholder or invalid text');
            break;
        }
    }
    
    // Validate mathematical content
    const mathIndicators = [
        /\d+/,  // Numbers
        /\+|\-|\*|\/|×|÷|=|plus|minus|times|divided|equals/i,  // Operations
        /fraction|decimal|percent|ratio/i,  // Math concepts
        /area|perimeter|volume|angle/i,  // Geometry
        /graph|chart|data|probability/i  // Statistics
    ];
    
    const hasMathContent = mathIndicators.some(pattern => pattern.test(question.question));
    if (!hasMathContent) {
        errors.push('Question lacks mathematical content');
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
    } else {
        const requiredMetaFields = ['datasetId', 'grade', 'subject', 'questionTypes'];
        for (const field of requiredMetaFields) {
            if (!data.metadata[field]) {
                results.errors.push(`Missing metadata field: ${field}`);
                results.valid = false;
            }
        }
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
    
    // Update metadata totals
    if (data.metadata) {
        data.metadata.totalQuestions = results.totalQuestions;
        
        // Calculate difficulty distribution
        const difficultyCount = { easy: 0, medium: 0, hard: 0 };
        data.questions.forEach(q => {
            if (q.difficulty && difficultyCount.hasOwnProperty(q.difficulty)) {
                difficultyCount[q.difficulty]++;
            }
        });
        data.metadata.difficultyDistribution = difficultyCount;
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
    
    for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        
        try {
            // Generate embedding for the question
            const embeddingText = question.contentForEmbedding || `${question.question} ${question.explanation || ''}`;
            const embedding = await embeddingService.generateEmbedding(embeddingText);
            
            // Prepare document for OpenSearch with required fields
            const document = {
                id: question.id,
                question: question.question,
                answer: question.answer,
                explanation: question.explanation || '',
                type: question.type,
                difficulty: question.difficulty,
                keywords: question.keywords || [],
                grade: question.grade,
                subject: question.subject,
                conceptName: question.conceptName || question.type.replace(/_/g, ' '),
                prerequisites: question.prerequisites || [],
                learningObjectives: question.learningObjectives || [],
                gradeLevelStandards: question.gradeLevelStandards || {
                    strand: question.curriculumTopic || 'Mathematics',
                    standard: question.curriculumSubtopic || 'General Mathematics',
                    description: question.curriculumSubtopic || 'General Mathematics concepts'
                },
                fullText: question.contentForEmbedding || `${question.question} ${question.explanation || ''}`,
                searchKeywords: Array.isArray(question.keywords) ? question.keywords.join(' ') : (question.keywords || ''),
                contentForEmbedding: embeddingText,
                embedding: embedding,
                ingestionTimestamp: new Date().toISOString()
            };
            
            // Store in OpenSearch
            await openSearchService.storeEnhancedQuestion(document);
            
            results.successful++;
            
            if (CONFIG.verbose && results.successful % 10 === 0) {
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
 * Main execution function
 */
async function main() {
    const args = process.argv.slice(2);
    const fileIndex = args.indexOf('--file');
    
    if (fileIndex === -1 || !args[fileIndex + 1]) {
        console.error('Usage: node validate-and-ingest-questions.mjs --file <path-to-questions.json>');
        process.exit(1);
    }
    
    const filePath = args[fileIndex + 1];
    
    try {
        log('='.repeat(70));
        log('Question Validation and Ingestion Script');
        log('='.repeat(70));
        log(`File: ${filePath}`);
        log(`Dry run: ${CONFIG.dryRun}`);
        log('');
        
        // Read and parse the questions file
        log('Reading questions file...');
        const fileContent = readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Validate the questions
        log('Validating questions...');
        const validation = validateQuestionFile(data);
        
        log(`Validation Results:`);
        log(`  Total questions: ${validation.totalQuestions}`);
        log(`  Valid questions: ${validation.validQuestions}`);
        log(`  Invalid questions: ${validation.invalidQuestions}`);
        log(`  Overall valid: ${validation.valid ? 'YES' : 'NO'}`);
        
        if (validation.errors.length > 0) {
            log('\\nValidation Errors:', 'WARN');
            validation.errors.forEach(error => log(`  - ${error}`, 'WARN'));
        }
        
        if (!validation.valid) {
            log('\\nValidation failed. Please fix errors before ingesting.', 'ERROR');
            process.exit(1);
        }
        
        if (CONFIG.dryRun) {
            log('\\nDry run mode - validation complete, skipping ingestion.', 'INFO');
            return;
        }
        
        // Initialize services for ingestion
        log('\\nInitializing services...');
        const openSearchService = new OpenSearchService();
        const embeddingService = new EmbeddingService();
        
        // Ingest the questions
        log('Starting ingestion...');
        const ingestionResults = await ingestQuestions(data, openSearchService, embeddingService);
        
        // Summary
        log('\\n' + '='.repeat(70));
        log('INGESTION COMPLETE');
        log('='.repeat(70));
        log(`Dataset: ${data.metadata.datasetId}`);
        log(`Grade: ${data.metadata.grade}`);
        log(`Successful ingestions: ${ingestionResults.successful}`);
        log(`Failed ingestions: ${ingestionResults.failed}`);
        
        if (ingestionResults.errors.length > 0) {
            log('\\nIngestion Errors:', 'WARN');
            ingestionResults.errors.forEach(error => log(`  - ${error}`, 'WARN'));
        }
        
        if (ingestionResults.failed > 0) {
            process.exit(1);
        }
        
    } catch (error) {
        log(`FATAL ERROR: ${error.message}`, 'ERROR');
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the script
main();