#!/usr/bin/env node

/**
 * Multi-Grade Question Generation Script
 *
 * Generates comprehensive question sets for multiple grades using the existing
 * question generation service and prepares them for vector database ingestion.
 *
 * Usage:
 *   node generate-multi-grade-questions.mjs [options]
 *
 * Options:
 *   --grades "3,4,6,7,8"    : Comma-separated list of grades to generate (default: 3,4,6,7,8)
 *   --questions-per-grade 30 : Number of questions per grade (default: 30)
 *   --output-dir ./generated : Output directory for generated files
 *   --verbose               : Enable verbose logging
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
    grades: (process.argv.find(arg => arg.startsWith('--grades='))?.split('=')[1] || '3,4,6,7,8').split(',').map(g => parseInt(g.trim())),
    questionsPerGrade: parseInt(process.argv.find(arg => arg.startsWith('--questions-per-grade='))?.split('=')[1] || '30'),
    outputDir: process.argv.find(arg => arg.startsWith('--output-dir='))?.split('=')[1] || './generated',
    verbose: process.argv.includes('--verbose')
};

// Question type distributions by grade level - aligned with NZ Curriculum
const GRADE_QUESTION_TYPES = {
    3: [
        // Grade 3: Numbers to 1000, basic operations, fractions (halves/quarters/eighths), money, patterns, measurement, geometry
        QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION,
        QuestionType.WHOLE_NUMBER_DIVISION, QuestionType.FRACTION_BASICS,
        QuestionType.SHAPE_IDENTIFICATION, QuestionType.AREA_CALCULATION,
        QuestionType.PERIMETER_CALCULATION, QuestionType.TIME_CALCULATION,
        QuestionType.MONEY_CALCULATION, QuestionType.PATTERN_RECOGNITION
    ],
    4: [
        // Grade 4: Numbers to 10,000, multiplication/division facts, decimals, fractions, money, patterns, measurement, geometry
        QuestionType.ADDITION, QuestionType.SUBTRACTION, QuestionType.MULTIPLICATION,
        QuestionType.DIVISION_WITH_REMAINDERS, QuestionType.FRACTION_ADDITION,
        QuestionType.FRACTION_SUBTRACTION, QuestionType.DECIMAL_ADDITION,
        QuestionType.DECIMAL_SUBTRACTION, QuestionType.ANGLE_MEASUREMENT,
        QuestionType.WORD_PROBLEM_ADDITION, QuestionType.WORD_PROBLEM_SUBTRACTION,
        QuestionType.MONEY_CALCULATION, QuestionType.PATTERN_RECOGNITION
    ],
    5: [
        // Grade 5: Larger numbers, multiplication/division, decimals, fractions, percentages, patterns, measurement, geometry
        QuestionType.WHOLE_NUMBER_ADDITION, QuestionType.WHOLE_NUMBER_SUBTRACTION,
        QuestionType.WHOLE_NUMBER_MULTIPLICATION, QuestionType.DIVISION_WITH_REMAINDERS,
        QuestionType.LONG_DIVISION, QuestionType.FRACTION_ADDITION, QuestionType.FRACTION_SUBTRACTION,
        QuestionType.FRACTION_MULTIPLICATION, QuestionType.DECIMAL_ADDITION,
        QuestionType.DECIMAL_MULTIPLICATION, QuestionType.DECIMAL_DIVISION,
        QuestionType.PERCENTAGE_CALCULATION, QuestionType.WORD_PROBLEM_MULTIPLICATION,
        QuestionType.WORD_PROBLEM_DIVISION, QuestionType.AREA_CALCULATION,
        QuestionType.VOLUME_CALCULATION, QuestionType.ANGLE_MEASUREMENT
    ],
    6: [
        // Grade 6: Factors, square numbers, decimals, fractions, percentages, equations, measurement, geometry
        QuestionType.INTEGER_ADDITION, QuestionType.INTEGER_SUBTRACTION,
        QuestionType.INTEGER_MULTIPLICATION, QuestionType.INTEGER_DIVISION,
        QuestionType.FRACTION_MULTIPLICATION, QuestionType.FRACTION_DIVISION,
        QuestionType.DECIMAL_MULTIPLICATION, QuestionType.DECIMAL_DIVISION,
        QuestionType.PERCENTAGE_CALCULATION, QuestionType.ALGEBRAIC_EXPRESSION,
        QuestionType.WORD_PROBLEM_FRACTION, QuestionType.AREA_CALCULATION,
        QuestionType.VOLUME_CALCULATION, QuestionType.ANGLE_MEASUREMENT
    ],
    7: [
        // Grade 7: Fractions, decimals, percentages, integers, equations, measurement, geometry
        QuestionType.FRACTION_MULTIPLICATION, QuestionType.FRACTION_DIVISION,
        QuestionType.DECIMAL_DIVISION, QuestionType.PERCENTAGE_INCREASE,
        QuestionType.PERCENTAGE_DECREASE, QuestionType.SOLVING_EQUATIONS,
        QuestionType.ALGEBRAIC_EXPRESSION, QuestionType.WORD_PROBLEM_FRACTION,
        QuestionType.WORD_PROBLEM_DECIMAL, QuestionType.AREA_CALCULATION,
        QuestionType.VOLUME_CALCULATION, QuestionType.ANGLE_MEASUREMENT
    ],
    8: [
        // Grade 8: Prime/composite numbers, negative numbers, fractions, decimals, percentages, equations, measurement, geometry
        QuestionType.SOLVING_EQUATIONS, QuestionType.ALGEBRAIC_EXPRESSION,
        QuestionType.LINEAR_EQUATIONS, QuestionType.FRACTION_MULTIPLICATION,
        QuestionType.FRACTION_DIVISION, QuestionType.DECIMAL_MULTIPLICATION,
        QuestionType.DECIMAL_DIVISION, QuestionType.PERCENTAGE_INCREASE,
        QuestionType.PERCENTAGE_DECREASE, QuestionType.AREA_CALCULATION,
        QuestionType.VOLUME_CALCULATION, QuestionType.ANGLE_MEASUREMENT,
        QuestionType.PYTHAGOREAN_THEOREM
    ]
};

// Difficulty distribution for each grade
const DIFFICULTY_DISTRIBUTION = {
    3: { easy: 0.6, medium: 0.3, hard: 0.1 },  // More easy questions for younger grades
    4: { easy: 0.5, medium: 0.4, hard: 0.1 },
    5: { easy: 0.4, medium: 0.4, hard: 0.2 },
    6: { easy: 0.3, medium: 0.5, hard: 0.2 },
    7: { easy: 0.2, medium: 0.5, hard: 0.3 },
    8: { easy: 0.1, medium: 0.4, hard: 0.5 }   // More challenging for older grades
};

/**
 * Log message with timestamp
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level}: ${message}`);
}

/**
 * Generate questions for a specific grade
 */
async function generateQuestionsForGrade(grade, questionService) {
    const questionTypes = GRADE_QUESTION_TYPES[grade];
    const difficultyDist = DIFFICULTY_DISTRIBUTION[grade];
    const questions = [];

    log(`Generating ${CONFIG.questionsPerGrade} questions for Grade ${grade}...`);

    // Calculate how many questions per difficulty
    const easyCount = Math.round(CONFIG.questionsPerGrade * difficultyDist.easy);
    const mediumCount = Math.round(CONFIG.questionsPerGrade * difficultyDist.medium);
    const hardCount = CONFIG.questionsPerGrade - easyCount - mediumCount;

    log(`Grade ${grade} distribution: ${easyCount} easy, ${mediumCount} medium, ${hardCount} hard`);

    // Generate questions for each difficulty
    for (const [difficulty, count] of [
        [DifficultyLevel.EASY, easyCount],
        [DifficultyLevel.MEDIUM, mediumCount],
        [DifficultyLevel.HARD, hardCount]
    ]) {
        for (let i = 0; i < count; i++) {
            // Select random question type for this grade
            const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

            try {
                const question = await questionService.generateQuestion(questionType, difficulty, grade);

                // Enhance question with additional metadata
                const enhancedQuestion = {
                    id: `g${grade}-${questionType}-${difficulty}-${i + 1}`,
                    question: question.question,
                    answer: question.answer,
                    explanation: question.explanation || '',
                    type: questionType,
                    difficulty: difficulty,
                    keywords: generateKeywords(questionType, difficulty, grade),
                    grade: grade,
                    subject: 'Mathematics',
                    curriculumId: `grade${grade}-comprehensive-2025`,
                    curriculumTopic: getCurriculumTopicForGrade(grade),
                    curriculumSubtopic: getCurriculumSubtopicForGrade(grade),
                    conceptId: `concept-${questionType}`,
                    conceptName: getConceptName(questionType),
                    conceptDescription: getConceptDescription(questionType),
                    prerequisites: getPrerequisitesForGrade(grade),
                    learningObjectives: getLearningObjectivesForGrade(grade),
                    gradeLevelStandards: getGradeLevelStandards(grade),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: '1.0',
                    fullText: `${question.question} ${question.explanation || ''}`,
                    searchKeywords: generateSearchKeywords(questionType, difficulty, grade),
                    documentType: 'question',
                    contentForEmbedding: `${question.question} ${question.explanation || ''}`
                };

                // Verify the question and answer before adding
                console.log('About to verify question');
                const verification = verifyQuestion(question.question, question.answer, questionType, grade);
                console.log('Verification result:', verification);
                if (!verification.valid) {
                    log(`Skipping invalid question: ${verification.reason}`, 'WARN');
                    continue; // Skip this question and try again
                }

                questions.push(enhancedQuestion);

                if (CONFIG.verbose) {
                    log(`Generated: ${enhancedQuestion.id} (${questionType}, ${difficulty})`);
                }

            } catch (error) {
                log(`Failed to generate question ${i + 1} for grade ${grade}: ${error.message}`, 'ERROR');
                // Continue with next question
            }
        }
    }

    return questions;
}

/**
 * Verify that a generated question and answer are valid
 */
function verifyQuestion(question, answer, questionType, grade) {
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
        /answer here/i
    ];

    for (const pattern of invalidPatterns) {
        if (pattern.test(question) || pattern.test(String(answer))) {
            return { valid: false, reason: 'Contains placeholder or invalid text' };
        }
    }

    // Grade-specific validation
    if (grade >= 3 && grade <= 8) {
        // Check if question contains appropriate mathematical content
        const mathIndicators = [
            /\d+/,  // Numbers
            /\+|\-|\*|\/|×|÷|=|plus|minus|times|divided|equals/i,  // Operations
            /fraction|decimal|percent|ratio/i,  // Advanced concepts for higher grades
            /area|perimeter|volume|angle/i,  // Measurement/geometry
            /graph|chart|data|probability/i  // Statistics
        ];

        const hasMathContent = mathIndicators.some(pattern => pattern.test(question));
        if (!hasMathContent) {
            return { valid: false, reason: 'Question lacks mathematical content' };
        }
    }

    // Type-specific validation
    switch (questionType) {
        case QuestionType.ADDITION:
        case QuestionType.SUBTRACTION:
        case QuestionType.MULTIPLICATION:
        case QuestionType.DIVISION:
            // Should contain numbers and operation symbols
            if (!/\d+.*[\+\-\*\/×÷]/.test(question)) {
                return { valid: false, reason: 'Arithmetic question missing numbers or operation' };
            }
            break;
        case QuestionType.FRACTION_ADDITION:
        case QuestionType.DECIMAL_ADDITION:
            // Should contain fractions or decimals
            if (!/\d+\/\d+|0\.\d+/.test(question)) {
                return { valid: false, reason: 'Fraction/decimal question missing appropriate numbers' };
            }
            break;
        case QuestionType.SOLVING_EQUATIONS:
            // Should contain equation-like structure
            if (!/=.*\?|\?/.test(question)) {
                return { valid: false, reason: 'Equation question missing variable or solve indicator' };
            }
            break;
    }

    return { valid: true };
}

/**
 * Generate keywords for a question
 */
function generateKeywords(questionType, difficulty, grade) {
    const baseKeywords = [questionType.replace(/_/g, ' '), difficulty, `grade ${grade}`];

    // Add type-specific keywords
    switch (questionType) {
        case QuestionType.ADDITION:
        case QuestionType.WHOLE_NUMBER_ADDITION:
            baseKeywords.push('addition', 'sum', 'plus');
            break;
        case QuestionType.SUBTRACTION:
        case QuestionType.WHOLE_NUMBER_SUBTRACTION:
            baseKeywords.push('subtraction', 'difference', 'minus');
            break;
        case QuestionType.MULTIPLICATION:
        case QuestionType.WHOLE_NUMBER_MULTIPLICATION:
            baseKeywords.push('multiplication', 'product', 'times');
            break;
        case QuestionType.DIVISION:
        case QuestionType.WHOLE_NUMBER_DIVISION:
        case QuestionType.DIVISION_WITH_REMAINDERS:
        case QuestionType.LONG_DIVISION:
            baseKeywords.push('division', 'quotient', 'divide');
            break;
        case QuestionType.FRACTION_ADDITION:
        case QuestionType.FRACTION_SUBTRACTION:
        case QuestionType.FRACTION_MULTIPLICATION:
        case QuestionType.FRACTION_DIVISION:
            baseKeywords.push('fractions', 'numerator', 'denominator');
            break;
        case QuestionType.DECIMAL_ADDITION:
        case QuestionType.DECIMAL_SUBTRACTION:
        case QuestionType.DECIMAL_MULTIPLICATION:
        case QuestionType.DECIMAL_DIVISION:
            baseKeywords.push('decimals', 'decimal point', 'place value');
            break;
        case QuestionType.SOLVING_EQUATIONS:
            baseKeywords.push('equations', 'variables', 'solve for x');
            break;
    }

    return baseKeywords;
}

/**
 * Generate search keywords string
 */
function generateSearchKeywords(questionType, difficulty, grade) {
    return [...generateKeywords(questionType, difficulty, grade), `grade-${grade}`].join(' ');
}

/**
 * Get curriculum topic for grade
 */
function getCurriculumTopicForGrade(grade) {
    const topics = {
        3: 'Number and Algebra, Measurement and Geometry',
        4: 'Number and Algebra, Measurement and Geometry',
        5: 'Number and Algebra, Measurement and Geometry, Statistics and Probability',
        6: 'Number and Algebra, Measurement and Geometry, Statistics and Probability',
        7: 'Number and Algebra, Measurement and Geometry, Statistics and Probability',
        8: 'Number and Algebra, Measurement and Geometry, Statistics and Probability'
    };
    return topics[grade] || 'Mathematics';
}

/**
 * Get curriculum subtopic for grade
 */
function getCurriculumSubtopicForGrade(grade) {
    const subtopics = {
        3: 'Whole number operations, basic fractions, measurement, 2D shapes, data collection',
        4: 'Place value to 10,000, basic fractions, decimals, measurement units, 3D shapes, simple data displays',
        5: 'Multiplication/division facts, fractions/decimals, ratios, perimeter/area/volume, angles, coordinate systems, data analysis',
        6: 'Integers, order of operations, ratios/rates, percentages, area/volume formulas, transformations, probability',
        7: 'Fractions/decimals/percentages, basic algebra, rates/ratios, surface area/volume, geometry theorems, statistical investigations',
        8: 'Number patterns, linear equations, scientific notation, Pythagoras theorem, trigonometry, bivariate data'
    };
    return subtopics[grade] || 'Comprehensive Mathematics';
}

/**
 * Get concept name for question type
 */
function getConceptName(questionType) {
    const names = {
        [QuestionType.ADDITION]: 'Addition',
        [QuestionType.SUBTRACTION]: 'Subtraction',
        [QuestionType.MULTIPLICATION]: 'Multiplication',
        [QuestionType.DIVISION]: 'Division',
        [QuestionType.FRACTION_ADDITION]: 'Fraction Addition',
        [QuestionType.DECIMAL_ADDITION]: 'Decimal Addition',
        [QuestionType.SOLVING_EQUATIONS]: 'Solving Equations'
    };
    return names[questionType] || questionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get concept description for question type
 */
function getConceptDescription(questionType) {
    const descriptions = {
        [QuestionType.ADDITION]: 'Understanding how to add numbers together to find the sum',
        [QuestionType.SUBTRACTION]: 'Understanding how to subtract one number from another to find the difference',
        [QuestionType.MULTIPLICATION]: 'Understanding multiplication as repeated addition and finding products',
        [QuestionType.DIVISION]: 'Understanding division as splitting numbers into equal parts',
        [QuestionType.FRACTION_ADDITION]: 'Adding fractions with common denominators',
        [QuestionType.DECIMAL_ADDITION]: 'Adding decimal numbers with proper place value alignment',
        [QuestionType.SOLVING_EQUATIONS]: 'Solving algebraic equations to find unknown values'
    };
    return descriptions[questionType] || `Understanding and applying ${questionType.replace(/_/g, ' ')}`;
}

/**
 * Get prerequisites for grade
 */
function getPrerequisitesForGrade(grade) {
    const prereqs = {
        3: ['Basic counting', 'Number recognition 1-100', 'Simple shapes'],
        4: ['Basic addition and subtraction', 'Multiplication tables', 'Simple fractions'],
        5: ['All four operations with whole numbers', 'Basic fractions and decimals'],
        6: ['Fraction operations', 'Decimal operations', 'Basic geometry'],
        7: ['All arithmetic operations', 'Basic algebraic concepts'],
        8: ['Solving equations', 'Geometry theorems', 'Statistical concepts']
    };
    return prereqs[grade] || [];
}

/**
 * Get learning objectives for grade
 */
function getLearningObjectivesForGrade(grade) {
    const objectives = {
        3: ['Perform basic arithmetic operations', 'Identify geometric shapes', 'Tell time and measure length'],
        4: ['Multiply and divide multi-digit numbers', 'Add and subtract fractions', 'Understand decimal place value'],
        5: ['Master all four operations with whole numbers and decimals', 'Work with fractions and mixed numbers', 'Calculate area and perimeter'],
        6: ['Understand ratio and proportion', 'Work with integers', 'Graph points on coordinate plane'],
        7: ['Solve multi-step equations', 'Understand proportional relationships', 'Calculate probability'],
        8: ['Solve linear equations', 'Apply Pythagorean theorem', 'Analyze statistical data']
    };
    return objectives[grade] || [];
}

/**
 * Get grade level standards
 */
function getGradeLevelStandards(grade) {
    return {
        grade: grade,
        standard: `Grade ${grade} Mathematics Standards`,
        description: `Comprehensive mathematics standards for grade ${grade} covering numbers, algebra, geometry, measurement, and statistics`
    };
}

/**
 * Save questions to file
 */
function saveQuestionsToFile(grade, questions) {
    // Create output directory if it doesn't exist
    mkdirSync(CONFIG.outputDir, { recursive: true });

    // Create comprehensive curriculum structure
    const curriculumData = {
        id: `grade${grade}-comprehensive-2025`,
        grade: grade,
        subject: 'Mathematics',
        topic: getCurriculumTopicForGrade(grade),
        subtopic: getCurriculumSubtopicForGrade(grade),
        concept: {
            id: `grade${grade}-all-concepts`,
            name: `Grade ${grade} Comprehensive Mathematics Concepts`,
            description: `Complete coverage of Grade ${grade} mathematics concepts`,
            keywords: ['mathematics', `grade ${grade}`, 'comprehensive']
        },
        questionTypes: GRADE_QUESTION_TYPES[grade].map(type => type),
        prerequisites: getPrerequisitesForGrade(grade),
        learningObjectives: getLearningObjectivesForGrade(grade),
        gradeLevelStandards: getGradeLevelStandards(grade),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0',
        sampleQuestions: questions
    };

    // Save comprehensive questions file
    const comprehensiveFile = join(CONFIG.outputDir, `grade${grade}-comprehensive-questions.json`);
    writeFileSync(comprehensiveFile, JSON.stringify(curriculumData, null, 2));
    log(`Saved comprehensive questions to: ${comprehensiveFile}`);

    // Create vector-ready format
    const vectorReadyData = {
        metadata: {
            datasetId: `grade${grade}-comprehensive-2025`,
            datasetName: `Grade ${grade} Comprehensive Mathematics Questions`,
            grade: grade,
            subject: 'Mathematics',
            totalQuestions: questions.length,
            difficultyDistribution: questions.reduce((acc, q) => {
                acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
                return acc;
            }, {}),
            questionTypes: [...new Set(questions.map(q => q.type))]
        },
        questions: questions
    };

    // Save vector-ready file
    const vectorReadyFile = join(CONFIG.outputDir, `grade${grade}-questions-vector-ready.json`);
    writeFileSync(vectorReadyFile, JSON.stringify(vectorReadyData, null, 2));
    log(`Saved vector-ready questions to: ${vectorReadyFile}`);

    return { comprehensiveFile, vectorReadyFile };
}

/**
 * Main execution function
 */
async function main() {
    try {
        log('='.repeat(70));
        log('Multi-Grade Question Generation Script');
        log('='.repeat(70));

        log(`Configuration:`);
        log(`  Grades: ${CONFIG.grades.join(', ')}`);
        log(`  Questions per grade: ${CONFIG.questionsPerGrade}`);
        log(`  Output directory: ${CONFIG.outputDir}`);
        log(`  Verbose: ${CONFIG.verbose}`);
        log('');

        // Initialize question generation service
        const questionService = new QuestionGenerationService();

        const results = [];

        // Generate questions for each grade
        for (const grade of CONFIG.grades) {
            log(`\n--- Generating questions for Grade ${grade} ---`);

            const startTime = Date.now();
            const questions = await generateQuestionsForGrade(grade, questionService);
            const endTime = Date.now();

            log(`Generated ${questions.length} questions for Grade ${grade} in ${(endTime - startTime) / 1000}s`);

            // Save to files
            const files = saveQuestionsToFile(grade, questions);
            results.push({ grade, questionCount: questions.length, files });

            log('');
        }

        // Summary
        log('='.repeat(70));
        log('GENERATION COMPLETE');
        log('='.repeat(70));

        results.forEach(result => {
            log(`Grade ${result.grade}: ${result.questionCount} questions`);
            log(`  Comprehensive: ${result.files.comprehensiveFile}`);
            log(`  Vector-ready: ${result.files.vectorReadyFile}`);
        });

        const totalQuestions = results.reduce((sum, r) => sum + r.questionCount, 0);
        log(`\nTotal questions generated: ${totalQuestions}`);

        log('\nNext steps:');
        log('1. Review generated questions for quality');
        log('2. Run ingestion script for each grade:');
        results.forEach(result => {
            log(`   npx tsx ingest-grade-questions.mjs --file ${result.files.vectorReadyFile}`);
        });

    } catch (error) {
        log(`FATAL ERROR: ${error.message}`, 'ERROR');
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the script
main();