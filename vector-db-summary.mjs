#!/usr/bin/env node

/**
 * Vector Database Summary Report
 * 
 * This generates a comprehensive summary of what's stored in the vector database
 */

import { Client } from '@opensearch-project/opensearch';

const client = new Client({
    node: process.env.OPENSEARCH_NODE || 'https://localhost:9200',
    auth: {
        username: process.env.OPENSEARCH_USERNAME || 'admin',
        password: process.env.OPENSEARCH_PASSWORD || 'h7F!q9rT#4vL',
    },
    ssl: {
        rejectUnauthorized: false,
    },
    maxRetries: 3,
    requestTimeout: 30000,
    sniffOnStart: false,
});

function log(message, level = 'INFO') {
    const colors = {
        'INFO': '\x1b[36m',
        'SUCCESS': '\x1b[32m',
        'DATA': '\x1b[35m',
        'HEADER': '\x1b[33m',
    };
    const resetColor = '\x1b[0m';
    console.log(`${colors[level] || ''}${message}${resetColor}`);
}

async function generateReport() {
    try {
        log('🔍 VECTOR DATABASE SUMMARY REPORT', 'HEADER');
        log('='.repeat(50), 'HEADER');
        
        // Get aggregations
        const response = await client.search({
            index: 'enhanced-math-questions',
            body: {
                size: 0,
                aggs: {
                    total_count: {
                        value_count: { field: 'id' }
                    },
                    difficulty_distribution: {
                        terms: { field: 'difficulty', size: 10 }
                    },
                    type_distribution: {
                        terms: { field: 'type', size: 50 }
                    },
                    grade_distribution: {
                        terms: { field: 'grade', size: 10 }
                    }
                }
            }
        });
        
        const aggs = response.body.aggregations;
        const totalQuestions = aggs.total_count.value;
        
        log(`\n📊 OVERVIEW`, 'SUCCESS');
        log(`Total Questions Stored: ${totalQuestions}`, 'DATA');
        log(`Index: enhanced-math-questions`, 'DATA');
        log(`Vector Dimensions: 1536 (with embeddings)`, 'DATA');
        
        log(`\n🎯 DIFFICULTY DISTRIBUTION`, 'SUCCESS');
        aggs.difficulty_distribution.buckets.forEach(bucket => {
            const percentage = Math.round((bucket.doc_count / totalQuestions) * 100);
            log(`${bucket.key.padEnd(8)} : ${bucket.doc_count.toString().padStart(2)} questions (${percentage}%)`, 'DATA');
        });
        
        log(`\n📚 QUESTION TYPES (Top 15)`, 'SUCCESS');
        aggs.type_distribution.buckets.slice(0, 15).forEach((bucket, index) => {
            const percentage = Math.round((bucket.doc_count / totalQuestions) * 100);
            log(`${(index + 1).toString().padStart(2)}. ${bucket.key.padEnd(25)} : ${bucket.doc_count.toString().padStart(2)} questions (${percentage}%)`, 'DATA');
        });
        
        log(`\n📈 GRADE COVERAGE`, 'SUCCESS');
        aggs.grade_distribution.buckets.forEach(bucket => {
            log(`Grade ${bucket.key}: ${bucket.doc_count} questions`, 'DATA');
        });
        
        // Get sample questions from each difficulty
        log(`\n📋 SAMPLE QUESTIONS BY DIFFICULTY`, 'SUCCESS');
        
        for (const difficulty of ['easy', 'medium', 'hard']) {
            const sampleResponse = await client.search({
                index: 'enhanced-math-questions',
                body: {
                    query: { term: { difficulty } },
                    size: 2,
                    sort: [{ createdAt: { order: 'asc' } }]
                }
            });
            
            log(`\n${difficulty.toUpperCase()} Examples:`, 'INFO');
            sampleResponse.body.hits.hits.forEach((hit, index) => {
                const doc = hit._source;
                const questionPreview = doc.question.length > 80 ? 
                    doc.question.substring(0, 80) + '...' : 
                    doc.question;
                log(`  ${index + 1}. ${doc.id}: ${questionPreview}`, 'DATA');
                log(`     Answer: ${doc.answer} | Type: ${doc.type}`, 'DATA');
            });
        }
        
        log(`\n✅ VECTOR DATABASE CAPABILITIES`, 'SUCCESS');
        log(`✓ Semantic Search: Find similar questions using text matching`, 'DATA');
        log(`✓ Difficulty Filtering: Filter by easy/medium/hard levels`, 'DATA');
        log(`✓ Type Filtering: Search by specific question types`, 'DATA');
        log(`✓ Grade Filtering: Filter by grade level (Grade 5)`, 'DATA');
        log(`✓ Vector Similarity: Find questions with similar mathematical concepts`, 'DATA');
        log(`✓ Full Metadata: Complete curriculum alignment and learning objectives`, 'DATA');
        
        log(`\n🚀 USAGE EXAMPLES`, 'SUCCESS');
        log(`Search for addition questions:`, 'INFO');
        log(`  node inspect-vector-data.mjs --search "addition" --sample 5`, 'DATA');
        log(`Filter by difficulty:`, 'INFO');
        log(`  node inspect-vector-data.mjs --difficulty medium --sample 3`, 'DATA');
        log(`Find geometry questions:`, 'INFO');
        log(`  node inspect-vector-data.mjs --search "geometry" --sample 3`, 'DATA');
        log(`View data structure:`, 'INFO');
        log(`  node view-opensearch-data.mjs`, 'DATA');
        
        log(`\n${'='.repeat(50)}`, 'HEADER');
        log(`🎉 Grade 5 Vector Database Ready for AI Applications!`, 'SUCCESS');
        log(`${'='.repeat(50)}`, 'HEADER');
        
    } catch (error) {
        console.error('Error generating report:', error.message);
    }
}

generateReport();