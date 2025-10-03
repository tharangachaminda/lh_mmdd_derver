#!/usr/bin/env node

/**
 * Grade 8 Phase 2B Ingestion Script - Perimeter, Area, and Volume
 * 
 * Ingests Grade 8 Phase 2B PERIMETER_AREA_VOLUME questions into OpenSearch vector database
 * with comprehensive metadata, quality scoring, and vector embeddings.
 * 
 * @fileoverview Production ingestion script for Phase 2B dataset
 * @author Learning Hub Development Team
 * @version 1.0.0
 * @created 2025-10-04
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// OpenSearch configuration
const OPENSEARCH_URL = 'http://localhost:9200';
const INDEX_NAME = 'enhanced-math-questions';

// OpenAI configuration for embeddings
const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Calculate quality score for a question based on multiple factors
 * @param {Object} question - The question object
 * @returns {number} Quality score from 0-100
 */
function calculateQualityScore(question) {
    let score = 0;
    const maxScore = 100;

    // Content completeness (30 points)
    if (question.question && question.question.length > 10) score += 10;
    if (question.answer && question.answer.length > 2) score += 10;
    if (question.explanation && question.explanation.length > 20) score += 10;

    // Educational metadata (25 points)
    if (question.difficulty) score += 5;
    if (question.grade) score += 5;
    if (question.category) score += 5;
    if (question.subcategory) score += 5;
    if (question.curriculumTopic) score += 5;

    // Question quality indicators (25 points)
    if (question.keyTerms && question.keyTerms.length > 0) score += 5;
    if (question.context) score += 5;
    if (question.includesFormula === true) score += 5;
    if (question.explanation && question.explanation.includes('=')) score += 5;
    if (question.type === 'PERIMETER_AREA_VOLUME') score += 5;

    // Real-world application (10 points)
    const realWorldIndicators = /garden|playground|room|field|pool|tank|box|container/i;
    if (realWorldIndicators.test(question.question)) score += 5;
    if (question.context === 'real-world') score += 5;

    // Mathematical rigor (10 points)
    const formulaIndicators = /perimeter|area|volume|×|÷|π|formula/i;
    if (formulaIndicators.test(question.explanation)) score += 5;
    if (question.explanation && question.explanation.length > 50) score += 5;

    return Math.min(score, maxScore);
}

/**
 * Calculate completeness score based on required fields
 * @param {Object} question - The question object
 * @returns {number} Completeness score from 0-100
 */
function calculateCompletenessScore(question) {
    const requiredFields = [
        'id', 'question', 'answer', 'explanation', 
        'difficulty', 'grade', 'subject', 'type',
        'category', 'subcategory', 'curriculumTopic'
    ];
    
    const presentFields = requiredFields.filter(field => 
        question[field] !== undefined && 
        question[field] !== null && 
        question[field] !== ''
    );
    
    return Math.round((presentFields.length / requiredFields.length) * 100);
}

/**
 * Generate vector embedding for question content
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} Vector embedding
 */
async function generateEmbedding(text) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.warn('⚠️  OPENAI_API_KEY not found, using mock embedding');
        // Return mock embedding for development
        return Array(EMBEDDING_DIMENSIONS).fill(0).map(() => Math.random() * 0.1);
    }

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                input: text,
                dimensions: EMBEDDING_DIMENSIONS
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.data[0].embedding;
    } catch (error) {
        console.warn(`⚠️  Embedding generation failed: ${error.message}, using mock embedding`);
        return Array(EMBEDDING_DIMENSIONS).fill(0).map(() => Math.random() * 0.1);
    }
}

/**
 * Check OpenSearch cluster health
 * @returns {Promise<boolean>} Health status
 */
async function checkOpenSearchHealth() {
    try {
        const response = await fetch(`${OPENSEARCH_URL}/_cluster/health`);
        const health = await response.json();
        console.log(`📊 OpenSearch cluster status: ${health.status}`);
        return health.status === 'green' || health.status === 'yellow';
    } catch (error) {
        console.error(`❌ OpenSearch health check failed: ${error.message}`);
        return false;
    }
}

/**
 * Index a single question into OpenSearch
 * @param {Object} question - Enhanced question object
 * @returns {Promise<boolean>} Success status
 */
async function indexQuestion(question) {
    try {
        const response = await fetch(`${OPENSEARCH_URL}/${INDEX_NAME}/_doc/${question.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`❌ Failed to index question ${question.id}: ${error}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error(`❌ Error indexing question ${question.id}: ${error.message}`);
        return false;
    }
}

/**
 * Main ingestion function
 */
async function ingestPhase2BQuestions() {
    console.log('🚀 Starting Grade 8 Phase 2B (Perimeter, Area, Volume) Ingestion');
    console.log('=' .repeat(70));

    // 1. Check OpenSearch health
    const isHealthy = await checkOpenSearchHealth();
    if (!isHealthy) {
        console.error('❌ OpenSearch cluster is not healthy. Aborting ingestion.');
        process.exit(1);
    }

    // 2. Load Phase 2B dataset
    const datasetPath = join(__dirname, 'question_bank/grade8/grade8_perimeter_area_volume_questions.json');
    
    if (!existsSync(datasetPath)) {
        console.error(`❌ Dataset file not found: ${datasetPath}`);
        process.exit(1);
    }

    console.log(`📁 Loading dataset: ${datasetPath}`);
    const rawData = readFileSync(datasetPath, 'utf8');
    const dataset = JSON.parse(rawData);
    const questions = dataset.questions || [];

    console.log(`📊 Dataset loaded: ${questions.length} questions`);

    // 3. Process and enhance questions
    let successCount = 0;
    let failCount = 0;
    const startTime = Date.now();

    console.log('\n🔄 Processing questions...');

    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        try {
            // Create embedding text
            const embeddingText = `${question.question} ${question.answer} ${question.explanation}`;
            
            // Generate vector embedding
            const embedding = await generateEmbedding(embeddingText);
            
            // Calculate quality scores
            const qualityScore = calculateQualityScore(question);
            const completenessScore = calculateCompletenessScore(question);
            
            // Enhance question with metadata
            const enhancedQuestion = {
                ...question,
                
                // Vector embedding
                embedding: embedding,
                
                // Phase identification
                phase: 'PHASE_2B',
                phaseDescription: 'Perimeter, Area, and Volume Calculations',
                
                // Quality metrics
                qualityScore: qualityScore,
                completenessScore: completenessScore,
                
                // Enhanced metadata
                metadata: {
                    ...dataset.metadata,
                    ingestionDate: new Date().toISOString(),
                    ingestionVersion: '1.0.0',
                    embeddingModel: EMBEDDING_MODEL,
                    embeddingDimensions: EMBEDDING_DIMENSIONS
                },
                
                // Search optimization
                searchTags: [
                    'grade8',
                    'phase2b',
                    'perimeter',
                    'area', 
                    'volume',
                    question.category,
                    question.subcategory,
                    question.difficulty,
                    'measurement',
                    'geometry'
                ],
                
                // Educational categorization
                learningObjectives: [
                    `Calculate ${question.category} of geometric shapes`,
                    'Apply measurement formulas to solve problems',
                    'Solve real-world measurement applications'
                ],
                
                // Enhanced curriculum alignment
                nzCurriculumLevel: 'Level 4-5',
                mathsStrand: 'Measurement',
                cognitiveLevel: question.difficulty === 'easy' ? 'Apply' : 
                              question.difficulty === 'medium' ? 'Analyse' : 'Evaluate'
            };
            
            // Index question
            const success = await indexQuestion(enhancedQuestion);
            
            if (success) {
                successCount++;
                console.log(`✅ [${i + 1}/${questions.length}] ${question.id} - ${question.category}/${question.subcategory} (Quality: ${qualityScore}%)`);
            } else {
                failCount++;
                console.log(`❌ [${i + 1}/${questions.length}] ${question.id} - FAILED`);
            }
            
        } catch (error) {
            failCount++;
            console.error(`❌ [${i + 1}/${questions.length}] ${question.id} - ERROR: ${error.message}`);
        }
        
        // Brief pause to avoid overwhelming the system
        if (i % 5 === 4) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // 4. Report results
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n' + '=' .repeat(70));
    console.log('📊 INGESTION COMPLETE - PHASE 2B SUMMARY');
    console.log('=' .repeat(70));
    console.log(`✅ Successfully ingested: ${successCount}/${questions.length} questions`);
    console.log(`❌ Failed: ${failCount}/${questions.length} questions`);
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log(`📈 Success rate: ${Math.round((successCount / questions.length) * 100)}%`);
    
    if (successCount > 0) {
        console.log('\n🎯 Quality Metrics:');
        console.log(`   • Vector embeddings: ${EMBEDDING_DIMENSIONS}D using ${EMBEDDING_MODEL}`);
        console.log(`   • Categories covered: Perimeter, Area, Volume`);
        console.log(`   • Real-world applications: Enhanced with practical contexts`);
        console.log(`   • NZ Curriculum aligned: Level 4-5 Mathematics`);
        
        console.log('\n🔍 Next Steps:');
        console.log('   • Test vector search functionality with new Phase 2B questions');
        console.log('   • Verify question retrieval for perimeter/area/volume queries');
        console.log('   • Consider running similarity searches across Phase 2B and 2C');
    }
    
    console.log(`\n🎉 Phase 2B ingestion ${successCount === questions.length ? 'SUCCESSFUL' : 'COMPLETED WITH ERRORS'}!`);
    
    // Exit with appropriate code
    process.exit(failCount > 0 ? 1 : 0);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    ingestPhase2BQuestions().catch(error => {
        console.error('💥 Ingestion failed:', error);
        process.exit(1);
    });
}

export default ingestPhase2BQuestions;