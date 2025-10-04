import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@opensearch-project/opensearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    console.log('\\n🎯 Phase 2C Speed, Time, and Distance - INGESTION PHASE');
    console.log('📊 Dataset: Grade 8 Speed, Time, and Distance Questions');
    console.log('🔢 Total Questions: 30 (13 easy, 12 medium, 5 hard)');
    console.log('🎯 Focus: Motion calculations, D=S×T relationships\\n');
    
    try {
        // Load the dataset
        const filePath = path.join(__dirname, 'question_bank/grade8/grade8_speed_calculations_questions.json');
        const dataset = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`📋 Dataset loaded: ${dataset.questions.length} questions`);
        console.log(`📊 Difficulty: ${dataset.metadata.difficultyDistribution.easy} easy, ${dataset.metadata.difficultyDistribution.medium} medium, ${dataset.metadata.difficultyDistribution.hard} hard`);
        
        const indexName = 'enhanced-math-questions';
        const startTime = Date.now();
        let successCount = 0;
        let errorCount = 0;
        
        // Process questions in batches
        const batchSize = 10;
        for (let i = 0; i < dataset.questions.length; i += batchSize) {
            const batch = dataset.questions.slice(i, i + batchSize);
            
            const body = [];
            for (const question of batch) {
                // Add motion-specific metadata
                const enhancedQuestion = {
                    ...question,
                    strand: 'Measurement and Geometry',
                    phase: '2C',
                    motionCalculationType: determineMotionType(question),
                    transportationContext: extractTransportContext(question),
                    unitsInvolved: extractMotionUnits(question),
                    searchTags: [
                        'speed-calculations',
                        'time-distance', 
                        'motion-formulas',
                        'transportation',
                        question.difficulty,
                        'phase-2c',
                        'measurement-geometry'
                    ],
                    ingestionTimestamp: new Date().toISOString(),
                    version: '1.0'
                };

                body.push(
                    { index: { _index: indexName, _id: question.id } },
                    enhancedQuestion
                );
            }
            
            try {
                const response = await client.bulk({ body });
                
                if (response.body.errors) {
                    const failedItems = response.body.items.filter(item => 
                        item.index && item.index.error
                    );
                    errorCount += failedItems.length;
                    successCount += (batch.length - failedItems.length);
                } else {
                    successCount += batch.length;
                }
                
                console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${batch.length} questions processed`);
                
            } catch (batchError) {
                console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, batchError.message);
                errorCount += batch.length;
            }
        }
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('\\n🎉 Phase 2C Speed, Time, and Distance ingestion completed!');
        console.log('📊 Results:');
        console.log(`   ✅ Successfully ingested: ${successCount} questions`);
        console.log(`   ❌ Failed: ${errorCount} questions`);
        console.log(`   📈 Success rate: ${(successCount / dataset.questions.length * 100).toFixed(1)}%`);
        console.log(`   ⏱️  Processing time: ${duration}s`);
        console.log(`   📚 Measurement & Geometry strand total: ${51 + successCount} questions`);
        console.log('\\n🏆 Phase 2C INGESTION COMPLETE - Measurement strand expanded with motion calculations! 🚗💨');
        
        return successCount;
        
    } catch (error) {
        console.error('❌ Ingestion failed:', error.message);
        throw error;
    }
}

function determineMotionType(question) {
    const questionText = question.question.toLowerCase();
    if (questionText.includes('speed')) return 'speed_calculation';
    if (questionText.includes('distance')) return 'distance_calculation';
    if (questionText.includes('time')) return 'time_calculation';
    if (questionText.includes('average')) return 'average_speed';
    return 'general_motion';
}

function extractTransportContext(question) {
    const text = question.question.toLowerCase();
    if (text.includes('car') || text.includes('vehicle')) return 'automotive';
    if (text.includes('train') || text.includes('bus')) return 'public_transport';
    if (text.includes('walk') || text.includes('cycle')) return 'personal_transport';
    return 'general';
}

function extractMotionUnits(question) {
    const text = (question.question + ' ' + question.answer).toLowerCase();
    const units = [];
    if (text.includes('km/h')) units.push('km_per_hour');
    if (text.includes('m/s')) units.push('metres_per_second');
    if (text.includes('km')) units.push('kilometres');
    if (text.includes('hours')) units.push('hours');
    if (text.includes('minutes')) units.push('minutes');
    return units;
}

// Execute ingestion
ingestPhase2CSpeedTimeDistance()
    .then(successCount => {
        console.log(`\\n🎊 Phase 2C deployment successful! Measurement and Geometry strand now complete.`);
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Deployment failed:', error.message);
        process.exit(1);
    });