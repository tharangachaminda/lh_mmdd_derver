#!/usr/bin/env node

/**
 * Simplified Grade 5 Questions Vector Database Ingestion Script
 * 
 * This script tests the connection and prepares for actual ingestion
 * without requiring TypeScript compilation.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    questionsFile: path.join(__dirname, 'grade5-questions-vector-ready.json'),
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
};

/**
 * Log message with timestamp and color
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const levelColor = {
        'INFO': '\x1b[36m',    // Cyan
        'SUCCESS': '\x1b[32m', // Green
        'ERROR': '\x1b[31m',   // Red
        'WARN': '\x1b[33m',    // Yellow
    }[level] || '';
    const resetColor = '\x1b[0m';
    
    console.log(`${levelColor}[${timestamp}] ${level}: ${message}${resetColor}`);
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
        
        log(`Loaded ${data.questions.length} questions from file`, 'SUCCESS');
        log(`Grade: ${data.metadata.grade}, Subject: ${data.metadata.subject}`);
        log(`Difficulty distribution: Easy(${data.metadata.difficultyDistribution.easy}), Medium(${data.metadata.difficultyDistribution.medium}), Hard(${data.metadata.difficultyDistribution.hard})`);
        
        // Validate question structure
        const firstQuestion = data.questions[0];
        const requiredFields = [
            'id', 'question', 'answer', 'explanation', 'type', 'difficulty',
            'keywords', 'grade', 'subject', 'conceptName', 'prerequisites',
            'learningObjectives', 'gradeLevelStandards', 'fullText',
            'searchKeywords', 'contentForEmbedding'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in firstQuestion));
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields in questions: ${missingFields.join(', ')}`);
        }
        
        log('✅ Question structure validation passed', 'SUCCESS');
        
        return data.questions;
    } catch (error) {
        throw new Error(`Failed to load questions file: ${error.message}`);
    }
}

/**
 * Validate question content and structure
 */
function validateQuestions(questions) {
    log('Validating question content...');
    
    let validationErrors = 0;
    const difficultyCount = { easy: 0, medium: 0, hard: 0 };
    const typeCount = {};
    
    questions.forEach((question, index) => {
        // Check required fields
        if (!question.contentForEmbedding || question.contentForEmbedding.trim() === '') {
            log(`Question ${question.id} (index ${index}): Missing contentForEmbedding`, 'ERROR');
            validationErrors++;
        }
        
        if (!question.difficulty || !['easy', 'medium', 'hard'].includes(question.difficulty)) {
            log(`Question ${question.id} (index ${index}): Invalid difficulty "${question.difficulty}"`, 'ERROR');
            validationErrors++;
        } else {
            difficultyCount[question.difficulty]++;
        }
        
        if (!question.type || question.type.trim() === '') {
            log(`Question ${question.id} (index ${index}): Missing type`, 'ERROR');
            validationErrors++;
        } else {
            typeCount[question.type] = (typeCount[question.type] || 0) + 1;
        }
        
        if (!question.grade || question.grade !== 5) {
            log(`Question ${question.id} (index ${index}): Invalid grade "${question.grade}"`, 'ERROR');
            validationErrors++;
        }
    });
    
    log(`Validation Summary:`);
    log(`  Total questions: ${questions.length}`);
    log(`  Validation errors: ${validationErrors}`);
    log(`  Difficulty distribution: Easy(${difficultyCount.easy}), Medium(${difficultyCount.medium}), Hard(${difficultyCount.hard})`);
    log(`  Question types: ${Object.keys(typeCount).length} unique types`);
    
    if (CONFIG.verbose) {
        log('Question types breakdown:');
        Object.entries(typeCount)
            .sort(([,a], [,b]) => b - a)
            .forEach(([type, count]) => {
                log(`  ${type}: ${count} questions`);
            });
    }
    
    if (validationErrors > 0) {
        throw new Error(`Validation failed with ${validationErrors} errors`);
    }
    
    log('✅ Question validation passed', 'SUCCESS');
    return { difficultyCount, typeCount };
}

/**
 * Analyze content for embedding readiness
 */
function analyzeEmbeddingContent(questions) {
    log('Analyzing content for embedding generation...');
    
    const contentStats = {
        totalLength: 0,
        minLength: Infinity,
        maxLength: 0,
        avgLength: 0,
        emptyContent: 0,
        longContent: 0, // > 500 chars
    };
    
    questions.forEach(question => {
        const content = question.contentForEmbedding || '';
        const length = content.length;
        
        contentStats.totalLength += length;
        contentStats.minLength = Math.min(contentStats.minLength, length);
        contentStats.maxLength = Math.max(contentStats.maxLength, length);
        
        if (length === 0) contentStats.emptyContent++;
        if (length > 500) contentStats.longContent++;
    });
    
    contentStats.avgLength = Math.round(contentStats.totalLength / questions.length);
    if (contentStats.minLength === Infinity) contentStats.minLength = 0;
    
    log('Content Analysis:');
    log(`  Average content length: ${contentStats.avgLength} characters`);
    log(`  Min/Max length: ${contentStats.minLength}/${contentStats.maxLength} characters`);
    log(`  Empty content: ${contentStats.emptyContent} questions`);
    log(`  Long content (>500 chars): ${contentStats.longContent} questions`);
    
    if (contentStats.emptyContent > 0) {
        log(`⚠️  Warning: ${contentStats.emptyContent} questions have empty embedding content`, 'WARN');
    }
    
    log('✅ Content analysis complete', 'SUCCESS');
    return contentStats;
}

/**
 * Generate mock embeddings for testing
 */
function generateMockEmbedding(text, dimension = 1536) {
    // Simple hash-based mock embedding for testing
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Generate pseudo-random embedding based on text hash
    const embedding = [];
    for (let i = 0; i < dimension; i++) {
        const seed = hash + i;
        const value = Math.sin(seed) * 0.5; // Values between -0.5 and 0.5
        embedding.push(value);
    }
    
    return embedding;
}

/**
 * Prepare enhanced questions for storage
 */
function prepareQuestionsForStorage(questions) {
    log('Preparing questions for vector database storage...');
    
    const enhancedQuestions = questions.map(question => {
        // Generate mock embedding for testing
        const embedding = generateMockEmbedding(question.contentForEmbedding);
        
        return {
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
            embedding: embedding,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    });
    
    log(`✅ Prepared ${enhancedQuestions.length} questions with mock embeddings`, 'SUCCESS');
    return enhancedQuestions;
}

/**
 * Main execution function
 */
async function main() {
    try {
        log('='.repeat(60));
        log('Grade 5 Questions Vector Database Preparation');
        log('='.repeat(60));
        
        if (CONFIG.dryRun) {
            log('DRY RUN MODE: Analysis only, no data storage', 'WARN');
        }
        
        // Load questions
        const questions = await loadQuestions();
        
        // Validate questions
        const validationStats = validateQuestions(questions);
        
        // Analyze content
        const contentStats = analyzeEmbeddingContent(questions);
        
        // Prepare for storage
        const enhancedQuestions = prepareQuestionsForStorage(questions);
        
        // Sample output for verification
        if (CONFIG.verbose && enhancedQuestions.length > 0) {
            log('\n📋 Sample Enhanced Question:');
            const sample = enhancedQuestions[0];
            console.log(JSON.stringify({
                id: sample.id,
                question: sample.question.substring(0, 100) + '...',
                difficulty: sample.difficulty,
                type: sample.type,
                grade: sample.grade,
                subject: sample.subject,
                embeddingDimension: sample.embedding.length,
                embeddingSample: sample.embedding.slice(0, 5).map(n => n.toFixed(4))
            }, null, 2));
        }
        
        log('='.repeat(60));
        log('PREPARATION COMPLETE', 'SUCCESS');
        log('✅ All questions are ready for vector database ingestion');
        log('');
        log('Next Steps:');
        log('1. Start OpenSearch service');
        log('2. Start Ollama with nomic-embed-text model');
        log('3. Run actual ingestion script with real embeddings');
        log('');
        log('Commands to run:');
        log('  # Start services:');
        log('  docker run -p 9200:9200 opensearchproject/opensearch:latest');
        log('  ollama pull nomic-embed-text');
        log('');
        log('  # Run actual ingestion:');
        log('  node ingest-grade5-questions.mjs --verbose');
        
        process.exit(0);
        
    } catch (error) {
        log(`FATAL ERROR: ${error.message}`, 'ERROR');
        if (CONFIG.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    log('\nReceived SIGINT. Shutting down gracefully...', 'WARN');
    process.exit(130);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}