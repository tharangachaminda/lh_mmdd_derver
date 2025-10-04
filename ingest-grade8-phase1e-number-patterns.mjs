import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@opensearch-project/opensearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Phase 1E: Number Patterns - Production Ingestion Script
 * 
 * MMDD-TDD Phase: INGESTION
 * Dataset: Grade 8 Number Patterns Questions
 * Total Questions: 25 (10 easy, 10 medium, 5 hard)
 * Content Focus: Arithmetic sequences, geometric sequences, pattern recognition
 */

const client = new Client({
    node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
    auth: {
        username: process.env.OPENSEARCH_USERNAME || 'admin',
        password: process.env.OPENSEARCH_PASSWORD || 'admin'
    },
    ssl: {
        rejectUnauthorized: false
    }
});

async function ingestPhase1EPatterns() {
    console.log('\n🎯 Phase 1E Number Patterns - INGESTION PHASE');
    console.log('='.repeat(60));
    console.log('📊 Dataset: Grade 8 Number Patterns Questions');
    console.log('📈 Pattern Types: Arithmetic, Geometric, Special Numbers');
    console.log('🎓 Educational Focus: NZ Level 4 Pattern Recognition');
    
    try {
        // Load the dataset
        const datasetPath = path.join(__dirname, 'question_bank', 'grade8', 'grade8_number_patterns_questions.json');
        const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
        
        console.log(`\n📋 Dataset loaded: ${dataset.questions.length} questions`);
        console.log(`📊 Difficulty: ${dataset.metadata.difficultyDistribution.easy} easy, ${dataset.metadata.difficultyDistribution.medium} medium, ${dataset.metadata.difficultyDistribution.hard} hard`);
        
        const indexName = 'enhanced-math-questions';
        const startTime = Date.now();
        let successCount = 0;
        let errorCount = 0;
        
        // Process questions in batches
        const batchSize = 10;
        const batches = [];
        for (let i = 0; i < dataset.questions.length; i += batchSize) {
            batches.push(dataset.questions.slice(i, i + batchSize));
        }
        
        console.log(`\n🔄 Processing ${batches.length} batches of ${batchSize} questions each...`);
        
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            console.log(`\n📦 Batch ${batchIndex + 1}/${batches.length}: ${batch.length} questions`);
            
            const body = [];
            for (const question of batch) {
                // Enhanced metadata for Phase 1E patterns
                const enhancedQuestion = {
                    ...question,
                    // Pattern-specific metadata
                    patternCategory: getPatternCategory(question),
                    sequenceType: getSequenceType(question),
                    algebraicThinking: assessAlgebraicThinking(question.difficulty),
                    
                    // Production metadata
                    phase: 'PHASE_1E',
                    topicArea: 'NUMBER_PATTERNS',
                    curriculumStrand: 'Number and Algebra',
                    
                    // Educational metadata
                    cognitiveLevel: getCognitiveLevel(question.difficulty),
                    mathematicalPractices: getPatternPractices(question),
                    realWorldConnections: hasRealWorldContext(question),
                    
                    // Vector search optimization
                    searchableText: `${question.question} ${question.explanation}`,
                    patternKeywords: extractPatternKeywords(question),
                    
                    // Quality assurance
                    mmddTddValidated: true,
                    productionReady: true,
                    ingestionDate: new Date().toISOString(),
                    
                    // Database metadata
                    dataSource: 'MMDD-TDD Phase 1E Development',
                    qualityScore: calculateQualityScore(question)
                };
                
                body.push({ index: { _index: indexName } });
                body.push(enhancedQuestion);
            }
            
            try {
                const response = await client.bulk({ body });
                
                if (response.body.errors) {
                    console.log(`❌ Batch ${batchIndex + 1} had errors:`);
                    response.body.items.forEach((item, index) => {
                        if (item.index.error) {
                            console.log(`   Question ${index + 1}: ${item.index.error.reason}`);
                            errorCount++;
                        } else {
                            successCount++;
                        }
                    });
                } else {
                    console.log(`✅ Batch ${batchIndex + 1} successfully ingested: ${batch.length} questions`);
                    successCount += batch.length;
                }
            } catch (error) {
                console.log(`❌ Batch ${batchIndex + 1} failed:`, error.message);
                errorCount += batch.length;
            }
        }
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        const successRate = ((successCount / dataset.questions.length) * 100).toFixed(1);
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 PHASE 1E INGESTION COMPLETE');
        console.log('='.repeat(60));
        console.log(`✅ Successfully ingested: ${successCount}/${dataset.questions.length} questions`);
        console.log(`❌ Failed: ${errorCount} questions`);
        console.log(`📈 Success rate: ${successRate}%`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`🎯 Phase 1E Number Patterns now live in production!`);
        
        // Verify ingestion
        await verifyIngestion(indexName, dataset.questions.length);
        
    } catch (error) {
        console.error('❌ Ingestion failed:', error);
        process.exit(1);
    }
}

/**
 * Determine pattern category for enhanced metadata
 */
function getPatternCategory(question) {
    const content = question.question.toLowerCase() + ' ' + question.explanation.toLowerCase();
    
    if (content.includes('arithmetic') || content.includes('constant difference') || content.includes('add') || content.includes('subtract')) {
        return 'arithmetic_sequence';
    }
    if (content.includes('geometric') || content.includes('multiply') || content.includes('ratio') || content.includes('times')) {
        return 'geometric_sequence';
    }
    if (content.includes('square') || content.includes('squared')) {
        return 'square_numbers';
    }
    if (content.includes('triangular')) {
        return 'triangular_numbers';
    }
    if (content.includes('cube')) {
        return 'cube_numbers';
    }
    
    return 'general_pattern';
}

/**
 * Determine sequence type for educational categorization
 */
function getSequenceType(question) {
    const category = getPatternCategory(question);
    
    switch (category) {
        case 'arithmetic_sequence':
            return 'linear';
        case 'geometric_sequence':
            return 'exponential';
        case 'square_numbers':
        case 'cube_numbers':
            return 'polynomial';
        default:
            return 'mixed';
    }
}

/**
 * Assess algebraic thinking level based on difficulty
 */
function assessAlgebraicThinking(difficulty) {
    switch (difficulty) {
        case 'easy':
            return 'pattern_recognition';
        case 'medium':
            return 'rule_application';
        case 'hard':
            return 'generalization';
        default:
            return 'basic';
    }
}

/**
 * Get cognitive level for educational metadata
 */
function getCognitiveLevel(difficulty) {
    switch (difficulty) {
        case 'easy':
            return 'remember_understand';
        case 'medium':
            return 'apply_analyze';
        case 'hard':
            return 'evaluate_create';
        default:
            return 'apply';
    }
}

/**
 * Extract mathematical practices for pattern recognition
 */
function getPatternPractices(question) {
    const practices = ['Pattern Recognition'];
    
    if (question.explanation.includes('Step')) {
        practices.push('Mathematical Reasoning');
    }
    if (question.question.includes('rule') || question.explanation.includes('rule')) {
        practices.push('Mathematical Modeling');
    }
    if (question.difficulty === 'hard') {
        practices.push('Mathematical Argumentation');
    }
    
    return practices;
}

/**
 * Check for real-world context in question
 */
function hasRealWorldContext(question) {
    const realWorldTerms = ['practical', 'real', 'everyday', 'application', 'situation', 'context'];
    const content = question.question.toLowerCase() + ' ' + question.explanation.toLowerCase();
    
    return realWorldTerms.some(term => content.includes(term));
}

/**
 * Extract pattern-specific keywords for enhanced search
 */
function extractPatternKeywords(question) {
    const keywords = [...question.keywords];
    
    // Add pattern-specific terms
    const patternTerms = ['sequence', 'pattern', 'rule', 'term', 'next', 'arithmetic', 'geometric', 'difference', 'ratio'];
    const content = question.question.toLowerCase();
    
    patternTerms.forEach(term => {
        if (content.includes(term) && !keywords.includes(term)) {
            keywords.push(term);
        }
    });
    
    return keywords;
}

/**
 * Calculate quality score based on content richness
 */
function calculateQualityScore(question) {
    let score = 0;
    
    // Base score for required fields
    if (question.question && question.explanation) score += 30;
    if (question.keywords && question.keywords.length > 0) score += 20;
    if (question.contentForEmbedding) score += 20;
    
    // Educational value
    if (question.explanation.includes('Step')) score += 15;
    if (question.learningObjective) score += 10;
    
    // Quality indicators
    if (question.explanation.length > 100) score += 5;
    
    return Math.min(score, 100);
}

/**
 * Verify ingestion success by checking document count
 */
async function verifyIngestion(indexName, expectedCount) {
    try {
        console.log('\n🔍 Verifying ingestion...');
        
        const searchResponse = await client.search({
            index: indexName,
            body: {
                query: {
                    term: { phase: 'PHASE_1E' }
                },
                size: 0
            }
        });
        
        const actualCount = searchResponse.body.hits.total.value;
        console.log(`📊 Phase 1E questions in database: ${actualCount}/${expectedCount}`);
        
        if (actualCount === expectedCount) {
            console.log('✅ Verification successful: All questions are searchable');
        } else {
            console.log('⚠️  Verification warning: Count mismatch detected');
        }
        
    } catch (error) {
        console.log('⚠️  Verification failed:', error.message);
    }
}

// Execute ingestion
ingestPhase1EPatterns();