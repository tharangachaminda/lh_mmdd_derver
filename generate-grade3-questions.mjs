#!/usr/bin/env node

/**
 * Grade 3 Question Generation Script
 * 
 * Generates comprehensive question sets for Grade 3 using New Zealand Curriculum standards.
 * Focuses on: whole number operations, basic fractions, measurement, 2D shapes, data collection
 * 
 * Usage: node generate-grade3-questions.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import our services
import { QuestionGenerationService } from './dist/services/questionGeneration.service.js';
import { DifficultyLevel, QuestionType } from './dist/models/question.js';

// Configuration
const CONFIG = {
    questionsPerType: 30,
    outputDir: './generated',
    verbose: true
};

// Grade 3 question types based on NZ Curriculum
const GRADE3_QUESTION_TYPES = [
    QuestionType.ADDITION,                  // Basic addition with regrouping
    QuestionType.SUBTRACTION,               // Basic subtraction with regrouping
    QuestionType.MULTIPLICATION,            // Simple multiplication facts
    QuestionType.WHOLE_NUMBER_DIVISION,     // Simple division
    QuestionType.FRACTION_BASICS,           // Halves, quarters, eighths
    QuestionType.SHAPE_IDENTIFICATION,      // 2D shapes and properties
    QuestionType.AREA_CALCULATION,          // Simple area concepts
    QuestionType.PERIMETER_CALCULATION,     // Simple perimeter
    QuestionType.TIME_CALCULATION,          // Time to nearest minute
    QuestionType.MONEY_CALCULATION,         // Money calculations
    QuestionType.PATTERN_RECOGNITION        // Number and shape patterns
];

// Difficulty distribution for Grade 3
const DIFFICULTY_DISTRIBUTION = {
    easy: 0.4,    // 40% easy
    medium: 0.4,  // 40% medium
    hard: 0.2     // 20% hard
};

/**
 * Logger function
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
}

/**
 * Verify that a generated question and answer are valid
 */
function verifyQuestion(question, answer, questionType) {
    // Basic validation checks
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return { valid: false, reason: 'Question is empty or invalid' };
    }

    if (!answer || (typeof answer !== 'string' && typeof answer !== 'number')) {
        return { valid: false, reason: 'Answer is empty or invalid' };
    }

    // Check for minimum length requirements
    if (question.trim().length < 10) {
        return { valid: false, reason: 'Question too short' };
    }

    // Check for placeholder text that might indicate generation failure
    const invalidPatterns = [
        /lorem ipsum/i,
        /placeholder/i,
        /example text/i,
        /test question/i,
        /\[.*\]/,  // Square brackets often indicate placeholders
        /question here/i,
        /answer here/i,
        /undefined/i,
        /null/i
    ];

    for (const pattern of invalidPatterns) {
        if (pattern.test(question) || pattern.test(String(answer))) {
            return { valid: false, reason: 'Contains placeholder or invalid text' };
        }
    }

    // Grade 3 specific validation - should contain appropriate mathematical content
    const mathIndicators = [
        /\d+/,  // Numbers
        /\+|\-|\*|\/|×|÷|=|plus|minus|times|divided|equals/i,  // Operations
        /fraction|half|quarter|eighth/i,  // Fractions for Grade 3
        /shape|circle|square|triangle|rectangle/i,  // Shapes
        /cents?|dollars?|\$/i,  // Money
        /time|clock|hour|minute/i,  // Time
        /pattern|sequence/i  // Patterns
    ];

    const hasMathContent = mathIndicators.some(pattern => pattern.test(question));
    if (!hasMathContent) {
        return { valid: false, reason: 'Question lacks mathematical content' };
    }

    // Type-specific validation
    switch (questionType) {
        case QuestionType.ADDITION:
        case QuestionType.SUBTRACTION:
        case QuestionType.MULTIPLICATION:
        case QuestionType.WHOLE_NUMBER_DIVISION:
            // Should contain numbers and operation symbols
            if (!/\d+.*[\+\-\*\/×÷]/.test(question)) {
                return { valid: false, reason: 'Arithmetic question missing numbers or operation' };
            }
            break;
        case QuestionType.FRACTION_BASICS:
            // Should contain fraction terminology
            if (!/fraction|half|quarter|eighth|part/i.test(question)) {
                return { valid: false, reason: 'Fraction question missing fraction terminology' };
            }
            break;
        case QuestionType.SHAPE_IDENTIFICATION:
            // Should contain shape names
            if (!/shape|circle|square|triangle|rectangle|sides?|corners?/i.test(question)) {
                return { valid: false, reason: 'Shape question missing shape terminology' };
            }
            break;
        case QuestionType.MONEY_CALCULATION:
            // Should contain money terminology
            if (!/cents?|dollars?|\$|money|cost|price/i.test(question)) {
                return { valid: false, reason: 'Money question missing money terminology' };
            }
            break;
    }

    return { valid: true };
}

/**
 * Generate questions for a specific type and difficulty
 */
async function generateQuestionsForType(questionType, questionService) {
    const questions = [];
    const counts = {
        [DifficultyLevel.EASY]: Math.round(CONFIG.questionsPerType * DIFFICULTY_DISTRIBUTION.easy),
        [DifficultyLevel.MEDIUM]: Math.round(CONFIG.questionsPerType * DIFFICULTY_DISTRIBUTION.medium),
        [DifficultyLevel.HARD]: CONFIG.questionsPerType - Math.round(CONFIG.questionsPerType * DIFFICULTY_DISTRIBUTION.easy) - Math.round(CONFIG.questionsPerType * DIFFICULTY_DISTRIBUTION.medium)
    };

    log(`Generating ${CONFIG.questionsPerType} questions for ${questionType}:`);
    log(`  Easy: ${counts[DifficultyLevel.EASY]}, Medium: ${counts[DifficultyLevel.MEDIUM]}, Hard: ${counts[DifficultyLevel.HARD]}`);

    for (const [difficulty, count] of Object.entries(counts)) {
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            const maxAttempts = 5;
            
            while (attempts < maxAttempts) {
                try {
                    const questionData = await questionService.generateQuestion(questionType, difficulty, 3);
                    
                    // Verify the question and answer
                    const verification = verifyQuestion(questionData.question, questionData.answer, questionType);
                    if (!verification.valid) {
                        log(`  Attempt ${attempts + 1}: Invalid question - ${verification.reason}`, 'WARN');
                        attempts++;
                        continue;
                    }

                    // Create enhanced question with metadata
                    const enhancedQuestion = {
                        id: `g3-${questionType}-${difficulty}-${questions.length + 1}`,
                        question: questionData.question,
                        answer: questionData.answer,
                        explanation: questionData.explanation || '',
                        type: questionType,
                        difficulty: difficulty,
                        grade: 3,
                        subject: 'Mathematics',
                        curriculumTopic: 'Number and Algebra, Measurement and Geometry',
                        curriculumSubtopic: 'Whole number operations, basic fractions, measurement, 2D shapes, data collection',
                        keywords: generateKeywords(questionType, difficulty),
                        createdAt: new Date().toISOString(),
                        version: '1.0',
                        verified: true,
                        documentType: 'question',
                        contentForEmbedding: `${questionData.question} ${questionData.explanation || ''}`
                    };

                    questions.push(enhancedQuestion);
                    
                    if (CONFIG.verbose) {
                        log(`  ✓ Generated: ${enhancedQuestion.id}`);
                    }
                    break;

                } catch (error) {
                    log(`  Attempt ${attempts + 1}: Generation failed - ${error.message}`, 'ERROR');
                    attempts++;
                }
            }

            if (attempts >= maxAttempts) {
                log(`  ✗ Failed to generate valid question after ${maxAttempts} attempts`, 'ERROR');
            }
        }
    }

    return questions;
}

/**
 * Generate keywords for a question
 */
function generateKeywords(questionType, difficulty) {
    const baseKeywords = [questionType.replace(/_/g, ' '), difficulty, 'grade 3', 'mathematics'];

    // Add type-specific keywords
    switch (questionType) {
        case QuestionType.ADDITION:
            baseKeywords.push('addition', 'sum', 'plus', 'add');
            break;
        case QuestionType.SUBTRACTION:
            baseKeywords.push('subtraction', 'difference', 'minus', 'subtract');
            break;
        case QuestionType.MULTIPLICATION:
            baseKeywords.push('multiplication', 'product', 'times', 'multiply');
            break;
        case QuestionType.WHOLE_NUMBER_DIVISION:
            baseKeywords.push('division', 'divide', 'quotient');
            break;
        case QuestionType.FRACTION_BASICS:
            baseKeywords.push('fractions', 'half', 'quarter', 'eighth', 'parts');
            break;
        case QuestionType.SHAPE_IDENTIFICATION:
            baseKeywords.push('shapes', 'geometry', 'circle', 'square', 'triangle', 'rectangle');
            break;
        case QuestionType.AREA_CALCULATION:
            baseKeywords.push('area', 'measurement', 'square units');
            break;
        case QuestionType.PERIMETER_CALCULATION:
            baseKeywords.push('perimeter', 'measurement', 'around', 'border');
            break;
        case QuestionType.TIME_CALCULATION:
            baseKeywords.push('time', 'clock', 'hours', 'minutes');
            break;
        case QuestionType.MONEY_CALCULATION:
            baseKeywords.push('money', 'cents', 'dollars', 'cost', 'price');
            break;
        case QuestionType.PATTERN_RECOGNITION:
            baseKeywords.push('patterns', 'sequence', 'next', 'continue');
            break;
    }

    return baseKeywords;
}

/**
 * Save questions to files
 */
function saveQuestions(allQuestions) {
    // Create output directory
    mkdirSync(CONFIG.outputDir, { recursive: true });

    // Group questions by type for analysis
    const questionsByType = {};
    allQuestions.forEach(q => {
        if (!questionsByType[q.type]) {
            questionsByType[q.type] = [];
        }
        questionsByType[q.type].push(q);
    });

    // Create comprehensive curriculum structure
    const curriculumData = {
        id: 'grade3-comprehensive-2025',
        grade: 3,
        subject: 'Mathematics',
        topic: 'Number and Algebra, Measurement and Geometry',
        subtopic: 'Whole number operations, basic fractions, measurement, 2D shapes, data collection',
        concept: {
            id: 'grade3-all-concepts',
            name: 'Grade 3 Comprehensive Mathematics Concepts',
            description: 'Complete coverage of Grade 3 mathematics concepts aligned with NZ Curriculum',
            keywords: ['mathematics', 'grade 3', 'comprehensive', 'curriculum aligned']
        },
        questionTypes: GRADE3_QUESTION_TYPES,
        totalQuestions: allQuestions.length,
        questionsByType: Object.keys(questionsByType).reduce((acc, type) => {
            acc[type] = questionsByType[type].length;
            return acc;
        }, {}),
        difficultyDistribution: allQuestions.reduce((acc, q) => {
            acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
            return acc;
        }, {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        sampleQuestions: allQuestions
    };

    // Save comprehensive questions file
    const comprehensiveFile = join(CONFIG.outputDir, 'grade3-comprehensive-questions.json');
    writeFileSync(comprehensiveFile, JSON.stringify(curriculumData, null, 2));
    log(`Saved comprehensive questions to: ${comprehensiveFile}`);

    // Create vector-ready format
    const vectorReadyData = {
        metadata: {
            datasetId: 'grade3-comprehensive-2025',
            datasetName: 'Grade 3 Comprehensive Mathematics Questions',
            grade: 3,
            subject: 'Mathematics',
            totalQuestions: allQuestions.length,
            difficultyDistribution: curriculumData.difficultyDistribution,
            questionTypes: [...new Set(allQuestions.map(q => q.type))],
            verified: true,
            curriculumAligned: true
        },
        questions: allQuestions
    };

    // Save vector-ready file
    const vectorReadyFile = join(CONFIG.outputDir, 'grade3-questions-vector-ready.json');
    writeFileSync(vectorReadyFile, JSON.stringify(vectorReadyData, null, 2));
    log(`Saved vector-ready questions to: ${vectorReadyFile}`);

    return { comprehensiveFile, vectorReadyFile, questionsByType };
}

/**
 * Main execution function
 */
async function main() {
    try {
        log('='.repeat(70));
        log('Grade 3 Question Generation Script');
        log('='.repeat(70));
        log(`Configuration:`);
        log(`  Questions per type: ${CONFIG.questionsPerType}`);
        log(`  Question types: ${GRADE3_QUESTION_TYPES.length}`);
        log(`  Total questions target: ${CONFIG.questionsPerType * GRADE3_QUESTION_TYPES.length}`);
        log(`  Output directory: ${CONFIG.outputDir}`);
        log('');

        // Initialize question generation service
        const questionService = new QuestionGenerationService();
        const allQuestions = [];

        // Generate questions for each type
        for (const questionType of GRADE3_QUESTION_TYPES) {
            log(`\n--- Processing ${questionType} ---`);
            const startTime = Date.now();
            
            const questions = await generateQuestionsForType(questionType, questionService);
            allQuestions.push(...questions);
            
            const endTime = Date.now();
            log(`✓ Generated ${questions.length} questions for ${questionType} in ${(endTime - startTime) / 1000}s`);
        }

        // Save all questions
        log(`\n--- Saving Questions ---`);
        const results = saveQuestions(allQuestions);

        // Summary
        log('\n' + '='.repeat(70));
        log('GENERATION COMPLETE');
        log('='.repeat(70));
        log(`Total questions generated: ${allQuestions.length}`);
        log(`Target was: ${CONFIG.questionsPerType * GRADE3_QUESTION_TYPES.length}`);
        log('');
        log('Questions by type:');
        Object.entries(results.questionsByType).forEach(([type, count]) => {
            log(`  ${type}: ${count} questions`);
        });
        log('');
        log('Generated files:');
        log(`  Comprehensive: ${results.comprehensiveFile}`);
        log(`  Vector-ready: ${results.vectorReadyFile}`);
        log('');
        log('Next steps:');
        log('1. Review generated questions for quality');
        log('2. Clear existing Grade 3 data from vector DB if needed');
        log('3. Ingest new questions:');
        log(`   npx tsx ingest-grade-questions.mjs --file ${results.vectorReadyFile}`);

    } catch (error) {
        log(`FATAL ERROR: ${error.message}`, 'ERROR');
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the script
main();