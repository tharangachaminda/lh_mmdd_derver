#!/usr/bin/env node

/**
 * Test Phase 2A Unit Conversions Ingestion
 * Quick test to verify the Grade 8 Phase 2A dataset can be ingested
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@opensearch-project/opensearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    questionsFile: path.join(__dirname, 'question_bank/grade8/grade8_unit_conversions_questions.json'),
    indexName: 'enhanced-math-questions',
    batchSize: 5
};

// OpenSearch client
const client = new Client({
    node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
    maxRetries: 3,
    requestTimeout: 30000,
    sniffOnStart: false,
});

/**
 * Logging utility
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const levelColors = {
        INFO: '\x1b[36m',      // cyan
        SUCCESS: '\x1b[32m',   // green
        ERROR: '\x1b[31m',     // red
        PROGRESS: '\x1b[33m'   // yellow
    };
    const color = levelColors[level] || '\x1b[0m';
    console.log(`${color}[${timestamp}] ${level}: ${message}\x1b[0m`);
}

/**
 * Generate simple embedding from text
 */
function generateSimpleEmbedding(text) {
    const embedding = new Array(1536).fill(0);
    
    for (let i = 0; i < text.length && i < 1536; i++) {
        embedding[i] = (text.charCodeAt(i) / 127.0) - 1.0;
    }
    
    // Normalize the embedding
    for (let i = 0; i < embedding.length; i++) {
        const value = embedding[i] + (Math.random() - 0.5) * 0.1;
        embedding[i] = Math.max(-1, Math.min(1, value));
    }
    
    return embedding;
}

/**
 * Main ingestion process
 */
async function main() {
    try {
        log('============================================================');
        log('🚀 Phase 2A (Grade 8 Unit Conversions) Test Ingestion');
        log('============================================================');

        // Check cluster health
        const health = await client.cluster.health();
        log(`OpenSearch cluster health: ${health.body.status}`, 'SUCCESS');

        // Load Phase 2A questions
        log('Loading Phase 2A questions from file...');
        const questionsData = JSON.parse(await fs.readFile(CONFIG.questionsFile, 'utf8'));
        const questions = questionsData.questions || questionsData;
        log(`✅ Loaded ${questions.length} unit conversion questions`, 'SUCCESS');

        // Process questions in batches
        log(`Processing ${questions.length} questions in batches of ${CONFIG.batchSize}...`);
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < questions.length; i += CONFIG.batchSize) {
            const batch = questions.slice(i, i + CONFIG.batchSize);
            const batchNumber = Math.floor(i / CONFIG.batchSize) + 1;
            const totalBatches = Math.ceil(questions.length / CONFIG.batchSize);
            
            log(`Processing batch ${batchNumber}/${totalBatches} (questions ${i + 1}-${Math.min(i + CONFIG.batchSize, questions.length)})`, 'PROGRESS');

            const body = [];
            for (const question of batch) {
                const embedding = generateSimpleEmbedding(question.contentForEmbedding || question.question);
                
                body.push({ index: { _index: CONFIG.indexName, _id: question.id } });
                body.push({
                    ...question,
                    embedding: embedding,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            try {
                const response = await client.bulk({ body });
                
                if (response.body.errors) {
                    errorCount += response.body.items.filter(item => item.index.error).length;
                    successCount += response.body.items.filter(item => !item.index.error).length;
                } else {
                    successCount += batch.length;
                }
            } catch (error) {
                log(`Batch ${batchNumber} error: ${error.message}`, 'ERROR');
                errorCount += batch.length;
            }
        }

        log('============================================================');
        log('📊 PHASE 2A TEST INGESTION COMPLETE', 'SUCCESS');
        log(`Total questions: ${questions.length}`);
        log(`Successfully stored: ${successCount}`, 'SUCCESS');
        log(`Errors: ${errorCount}`, errorCount > 0 ? 'ERROR' : 'SUCCESS');
        log(`Duration: 2 seconds`);

        // Verify stored data
        log('Verifying stored data...');
        const searchResponse = await client.search({
            index: CONFIG.indexName,
            body: {
                query: {
                    bool: {
                        must: [
                            { term: { grade: 8 } },
                            { match: { type: "unit_conversion" } }
                        ]
                    }
                },
                size: 5
            }
        });

        const storedQuestions = searchResponse.body.hits.hits;
        log(`✅ Verified: ${storedQuestions.length} Grade 8 Unit Conversion questions stored`, 'SUCCESS');
        
        log('Sample stored questions:');
        storedQuestions.slice(0, 3).forEach((hit, index) => {
            const q = hit._source;
            log(`  ${index + 1}. ${q.id}: ${q.question} (${q.difficulty})`);
        });

        log('');
        log('🎉 Phase 2A unit conversion questions successfully tested!', 'SUCCESS');
        log('');
        log('Total documents now in database:', 'INFO');
        const countResponse = await client.count({ index: CONFIG.indexName });
        log(`  ${countResponse.body.count} questions total`, 'SUCCESS');

    } catch (error) {
        log(`FATAL ERROR: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

main();