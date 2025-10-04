import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@opensearch-project/opensearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Phase 2A: Unit Conversions - Production Ingestion Script
 * 
 * MMDD-TDD Phase: INGESTION
 * Dataset: Grade 8 Unit Conversions Questions
 * Total Questions: 20 (8 easy, 8 medium, 4 hard)
 * Content Focus: Time conversions, volume conversions, measurement applications
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

async function ingestPhase2AConversions() {
    console.log('\n🎯 Phase 2A Unit Conversions - INGESTION PHASE');
    console.log('='.repeat(60));
    console.log('📊 Dataset: Grade 8 Unit Conversions Questions');
    console.log('📏 Conversion Types: Time, Volume, Metric/Imperial');
    console.log('🎓 Educational Focus: NZ Level 4 Measurement Applications');
    
    try {
        // Load the dataset
        const datasetPath = path.join(__dirname, 'question_bank', 'grade8', 'grade8_unit_conversions_questions.json');
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
                // Enhanced metadata for Phase 2A conversions
                const enhancedQuestion = {
                    ...question,
                    // Conversion-specific metadata
                    conversionCategory: getConversionCategory(question),
                    unitType: getUnitType(question),
                    measurementApplication: assessMeasurementApplication(question.difficulty),
                    
                    // Production metadata
                    phase: 'PHASE_2A',
                    topicArea: 'UNIT_CONVERSIONS',
                    curriculumStrand: 'Measurement and Applications',
                    
                    // Educational metadata
                    cognitiveLevel: getCognitiveLevel(question.difficulty),
                    mathematicalPractices: getConversionPractices(question),
                    realWorldConnections: hasRealWorldContext(question),
                    
                    // Vector search optimization
                    searchableText: `${question.question} ${question.explanation}`,
                    conversionKeywords: extractConversionKeywords(question),
                    
                    // Quality assurance
                    mmddTddValidated: true,
                    productionReady: true,
                    ingestionDate: new Date().toISOString(),
                    
                    // Database metadata
                    dataSource: 'MMDD-TDD Phase 2A Development',
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
        console.log('📊 PHASE 2A INGESTION COMPLETE');
        console.log('='.repeat(60));
        console.log(`✅ Successfully ingested: ${successCount}/${dataset.questions.length} questions`);
        console.log(`❌ Failed: ${errorCount} questions`);
        console.log(`📈 Success rate: ${successRate}%`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`🎯 Phase 2A Unit Conversions now live in production!`);
        
        // Verify ingestion
        await verifyIngestion(indexName, dataset.questions.length);
        
    } catch (error) {
        console.error('❌ Ingestion failed:', error);
        process.exit(1);
    }
}

/**
 * Determine conversion category for enhanced metadata
 */
function getConversionCategory(question) {
    const content = question.question.toLowerCase() + ' ' + question.explanation.toLowerCase();
    
    if (content.includes('millisecond') || content.includes('second') || content.includes('minute') || content.includes('hour')) {
        return 'time_conversion';
    }
    if (content.includes('litre') || content.includes('liter') || content.includes('millilitre') || content.includes('milliliter') || content.includes('cubic')) {
        return 'volume_conversion';
    }
    if (content.includes('metre') || content.includes('meter') || content.includes('kilometre') || content.includes('kilometer') || content.includes('centimetre') || content.includes('centimeter')) {
        return 'distance_conversion';
    }
    if (content.includes('gallon') || content.includes('pint') || content.includes('cup') || content.includes('ounce')) {
        return 'imperial_conversion';
    }
    
    return 'general_conversion';
}

/**
 * Determine unit type for educational categorization
 */
function getUnitType(question) {
    const category = getConversionCategory(question);
    
    switch (category) {
        case 'time_conversion':
            return 'temporal';
        case 'volume_conversion':
            return 'capacity';
        case 'distance_conversion':
            return 'length';
        case 'imperial_conversion':
            return 'imperial_system';
        default:
            return 'mixed';
    }
}

/**
 * Assess measurement application level based on difficulty
 */
function assessMeasurementApplication(difficulty) {
    switch (difficulty) {
        case 'easy':
            return 'basic_conversion';
        case 'medium':
            return 'practical_application';
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
 * Extract mathematical practices for unit conversions
 */
function getConversionPractices(question) {
    const practices = ['Unit Conversion'];
    
    if (question.explanation.includes('multiply') || question.explanation.includes('divide')) {
        practices.push('Proportional Reasoning');
    }
    if (question.question.includes('cooking') || question.question.includes('recipe') || question.explanation.includes('practical')) {
        practices.push('Real-world Application');
    }
    if (question.difficulty === 'hard') {
        practices.push('Problem Solving');
    }
    
    return practices;
}

/**
 * Check for real-world context in question
 */
function hasRealWorldContext(question) {
    const realWorldTerms = ['cooking', 'recipe', 'bottle', 'container', 'fuel', 'capacity', 'timing', 'activities', 'practical', 'everyday'];
    const content = question.question.toLowerCase() + ' ' + question.explanation.toLowerCase();
    
    return realWorldTerms.some(term => content.includes(term));
}

/**
 * Extract conversion-specific keywords for enhanced search
 */
function extractConversionKeywords(question) {
    const keywords = [...question.keywords];
    
    // Add conversion-specific terms
    const conversionTerms = ['convert', 'conversion', 'units', 'measurement', 'multiply', 'divide', 'metric', 'imperial'];
    const content = question.question.toLowerCase();
    
    conversionTerms.forEach(term => {
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
    if (question.explanation.includes('multiply') || question.explanation.includes('divide')) score += 15;
    if (question.answer) score += 10;
    
    // Quality indicators
    if (question.explanation.length > 50) score += 5;
    
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
                    term: { phase: 'PHASE_2A' }
                },
                size: 0
            }
        });
        
        const actualCount = searchResponse.body.hits.total.value;
        console.log(`📊 Phase 2A questions in database: ${actualCount}/${expectedCount}`);
        
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
ingestPhase2AConversions();