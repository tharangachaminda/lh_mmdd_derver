import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@opensearch-project/opensearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Phase 2C: Speed, Time, and Distance - Production Ingestion Script
 * 
 * MMDD-TDD Phase: INGESTION
 * Dataset: Grade 8 Speed, Time, and Distance Questions
 * Total Questions: 30 (13 easy, 12 medium, 5 hard)
 * Content Focus: Motion calculations, D=S×T relationships, real-world transportation
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

async function ingestPhase2CSpeedTimeDistance() {
    console.log('\n🎯 Phase 2C Speed, Time, and Distance - INGESTION PHASE');
    console.log('='.repeat(60));
    console.log('📊 Dataset: Grade 8 Speed, Time, and Distance Questions');
    console.log('🚗 Motion Types: Speed, Distance, Time Calculations');
    console.log('🎓 Educational Focus: NZ Level 4 Motion and Measurement');
    
    try {
        // Load the dataset
        const filePath = path.join(__dirname, 'question_bank/grade8/grade8_speed_calculations_questions.json');
        const dataset = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
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
        
        console.log(`\n🔄 Processing ${batches.length} batches of up to ${batchSize} questions each...`);
        
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];
            console.log(`\n📦 Batch ${batchIndex + 1}/${batches.length}: ${batch.length} questions`);
            
            const body = [];
            for (const question of batch) {
                // Enhanced metadata for Phase 2B geometric measurements
                const enhancedQuestion = {
                    ...question,
                    // Geometry-specific metadata
                    geometricCategory: getGeometricCategory(question),
                    measurementType: getMeasurementType(question),
                    shapeType: getShapeType(question),
                    complexityLevel: assessComplexityLevel(question.difficulty),
                    
                    // Production metadata
                    phase: 'PHASE_2B',
                    topicArea: 'PERIMETER_AREA_VOLUME',
                    curriculumStrand: 'Measurement and Applications',
                    
                    // Educational metadata
                    cognitiveLevel: getCognitiveLevel(question.difficulty),
                    mathematicalPractices: getGeometryPractices(question),
                    realWorldConnections: hasRealWorldContext(question),
                    formulaUsage: hasFormulaApplication(question),
                    
                    // Vector search optimization
                    searchableText: `${question.question} ${question.explanation}`,
                    geometryKeywords: extractGeometryKeywords(question),
                    
                    // Quality assurance
                    mmddTddValidated: true,
                    productionReady: true,
                    ingestionDate: new Date().toISOString(),
                    
                    // Database metadata
                    dataSource: 'MMDD-TDD Phase 2B Development',
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
        console.log('📊 PHASE 2B INGESTION COMPLETE');
        console.log('='.repeat(60));
        console.log(`✅ Successfully ingested: ${successCount}/${dataset.questions.length} questions`);
        console.log(`❌ Failed: ${errorCount} questions`);
        console.log(`📈 Success rate: ${successRate}%`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`🎯 Phase 2B Geometric Measurements now live in production!`);
        
        // Verify ingestion
        await verifyIngestion(indexName, dataset.questions.length);
        
    } catch (error) {
        console.error('❌ Ingestion failed:', error);
        process.exit(1);
    }
}

/**
 * Determine geometric category for enhanced metadata
 */
function getGeometricCategory(question) {
    const category = question.category?.toLowerCase() || '';
    
    if (category.includes('perimeter')) {
        return 'perimeter_calculation';
    }
    if (category.includes('area')) {
        return 'area_calculation';
    }
    if (category.includes('volume')) {
        return 'volume_calculation';
    }
    
    return 'mixed_geometry';
}

/**
 * Determine measurement type for educational categorization
 */
function getMeasurementType(question) {
    const content = question.question.toLowerCase() + ' ' + question.explanation.toLowerCase();
    
    if (content.includes('perimeter')) {
        return 'linear_measurement';
    }
    if (content.includes('area')) {
        return 'area_measurement';
    }
    if (content.includes('volume')) {
        return 'volume_measurement';
    }
    
    return 'general_measurement';
}

/**
 * Determine shape type for geometric classification
 */
function getShapeType(question) {
    const subcategory = question.subcategory?.toLowerCase() || '';
    const content = question.question.toLowerCase();
    
    if (subcategory.includes('rectangle') || content.includes('rectangle')) {
        return 'rectangle';
    }
    if (subcategory.includes('triangle') || content.includes('triangle')) {
        return 'triangle';
    }
    if (subcategory.includes('circle') || content.includes('circle')) {
        return 'circle';
    }
    if (subcategory.includes('cube') || content.includes('cube')) {
        return 'cube';
    }
    if (subcategory.includes('cylinder') || content.includes('cylinder')) {
        return 'cylinder';
    }
    if (subcategory.includes('composite') || content.includes('composite')) {
        return 'composite_shape';
    }
    
    return 'general_shape';
}

/**
 * Assess complexity level based on difficulty and content
 */
function assessComplexityLevel(difficulty) {
    switch (difficulty) {
        case 'easy':
            return 'basic_formula_application';
        case 'medium':
            return 'multi_step_calculation';
        case 'hard':
            return 'complex_problem_solving';
        default:
            return 'standard';
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
 * Extract mathematical practices for geometric measurements
 */
function getGeometryPractices(question) {
    const practices = ['Geometric Measurement'];
    
    if (question.explanation.includes('formula') || question.includesFormula) {
        practices.push('Formula Application');
    }
    if (question.context === 'real-world' || question.question.includes('garden') || question.question.includes('pool')) {
        practices.push('Real-world Application');
    }
    if (question.subcategory?.includes('missing') || question.question.includes('unknown')) {
        practices.push('Problem Solving');
    }
    if (question.difficulty === 'hard') {
        practices.push('Mathematical Reasoning');
    }
    
    return practices;
}

/**
 * Check for real-world context in question
 */
function hasRealWorldContext(question) {
    const realWorldTerms = ['garden', 'pool', 'room', 'field', 'house', 'building', 'tank', 'container', 'playground', 'practical'];
    const content = question.question.toLowerCase() + ' ' + question.explanation.toLowerCase();
    
    return realWorldTerms.some(term => content.includes(term)) || question.context === 'real-world';
}

/**
 * Check for formula application in question
 */
function hasFormulaApplication(question) {
    return question.includesFormula === true || 
           question.explanation.includes('=') || 
           question.explanation.includes('formula') ||
           question.explanation.includes('Perimeter =') ||
           question.explanation.includes('Area =') ||
           question.explanation.includes('Volume =');
}

/**
 * Extract geometry-specific keywords for enhanced search
 */
function extractGeometryKeywords(question) {
    const keywords = [...(question.keywords || [])];
    
    // Add geometry-specific terms
    const geometryTerms = ['shape', 'formula', 'calculate', 'measurement', 'geometry', 'dimension', 'length', 'width', 'height', 'radius'];
    const content = question.question.toLowerCase();
    
    geometryTerms.forEach(term => {
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
    if (question.includesFormula) score += 15;
    if (question.answer) score += 10;
    
    // Quality indicators
    if (question.explanation.length > 80) score += 5;
    
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
                    term: { phase: 'PHASE_2B' }
                },
                size: 0
            }
        });
        
        const actualCount = searchResponse.body.hits.total.value;
        console.log(`📊 Phase 2B questions in database: ${actualCount}/${expectedCount}`);
        
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
ingestPhase2CSpeedTimeDistance();