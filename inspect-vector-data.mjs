#!/usr/bin/env node

/**
 * Vector Database Data Inspector
 * 
 * This script helps you view and inspect indexed data in OpenSearch
 * 
 * Usage:
 *   node inspect-vector-data.mjs [options]
 * 
 * Options:
 *   --list-indices      : Show all available indices
 *   --count             : Show document count per index
 *   --sample [n]        : Show sample documents (default: 5)
 *   --search "query"    : Search for specific questions
 *   --difficulty easy   : Filter by difficulty level
 *   --type "math_type"  : Filter by question type
 *   --grade [n]         : Filter by grade level
 *   --schema            : Show index mapping/schema
 *   --health            : Check cluster health
 *   --stats             : Show detailed index statistics
 * 
 * Examples:
 *   node inspect-vector-data.mjs --sample 3
 *   node inspect-vector-data.mjs --search "addition"
 *   node inspect-vector-data.mjs --difficulty easy --count
 *   node inspect-vector-data.mjs --type "area_calculation" --sample 2
 */

import { Client } from '@opensearch-project/opensearch';

// Configuration
const CONFIG = {
    node: process.env.OPENSEARCH_NODE || 'https://localhost:9200',
    username: process.env.OPENSEARCH_USERNAME || 'admin',
    password: process.env.OPENSEARCH_PASSWORD || 'h7F!q9rT#4vL',
    indexName: 'enhanced_questions',
    
    // Command line options
    listIndices: process.argv.includes('--list-indices'),
    showCount: process.argv.includes('--count'),
    showSchema: process.argv.includes('--schema'),
    showHealth: process.argv.includes('--health'),
    showStats: process.argv.includes('--stats'),
    
    // Filters
    difficulty: getArgValue('--difficulty'),
    type: getArgValue('--type'),
    grade: parseInt(getArgValue('--grade')) || null,
    searchQuery: getArgValue('--search'),
    sampleSize: parseInt(getArgValue('--sample')) || 5,
};

// Helper function to get argument values
function getArgValue(arg) {
    const index = process.argv.indexOf(arg);
    return index !== -1 && index + 1 < process.argv.length ? process.argv[index + 1] : null;
}

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
        'DATA': '\x1b[35m',    // Magenta
    }[level] || '';
    const resetColor = '\x1b[0m';
    
    console.log(`${levelColor}[${timestamp}] ${level}: ${message}${resetColor}`);
}

/**
 * Initialize OpenSearch client
 */
function createClient() {
    return new Client({
        node: CONFIG.node,
        auth: {
            username: CONFIG.username,
            password: CONFIG.password,
        },
        ssl: {
            rejectUnauthorized: false, // For development with self-signed certificates
        },
        maxRetries: 3,
        requestTimeout: 30000,
        sniffOnStart: false,
    });
}

/**
 * Check cluster health
 */
async function checkHealth(client) {
    try {
        log('Checking OpenSearch cluster health...');
        const response = await client.cluster.health();
        const health = response.body;
        
        log(`Cluster Health: ${health.status}`, health.status === 'green' ? 'SUCCESS' : 'WARN');
        log(`Cluster Name: ${health.cluster_name}`);
        log(`Number of Nodes: ${health.number_of_nodes}`);
        log(`Active Primary Shards: ${health.active_primary_shards}`);
        log(`Active Shards: ${health.active_shards}`);
        
        return health;
    } catch (error) {
        log(`Failed to check cluster health: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * List all indices
 */
async function listIndices(client) {
    try {
        log('Listing all indices...');
        const response = await client.cat.indices({ format: 'json' });
        const indices = response.body;
        
        if (indices.length === 0) {
            log('No indices found', 'WARN');
            return [];
        }
        
        log('Available Indices:', 'DATA');
        indices.forEach(index => {
            log(`  ${index.index} (${index.status}) - ${index['docs.count']} docs, ${index['store.size']}`, 'DATA');
        });
        
        return indices;
    } catch (error) {
        log(`Failed to list indices: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * Get index mapping/schema
 */
async function getIndexSchema(client, indexName) {
    try {
        log(`Getting mapping for index: ${indexName}...`);
        const response = await client.indices.getMapping({ index: indexName });
        const mapping = response.body[indexName]?.mappings?.properties;
        
        if (!mapping) {
            log('No mapping found for index', 'WARN');
            return null;
        }
        
        log('Index Schema:', 'DATA');
        Object.entries(mapping).forEach(([field, config]) => {
            const type = config.type || 'object';
            const dimension = config.dimension ? ` (${config.dimension}D)` : '';
            log(`  ${field}: ${type}${dimension}`, 'DATA');
        });
        
        return mapping;
    } catch (error) {
        log(`Failed to get index mapping: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * Get document count with optional filters
 */
async function getDocumentCount(client, filters = {}) {
    try {
        log('Getting document count...');
        
        // Build query with filters
        const query = buildQuery(filters);
        
        const response = await client.count({
            index: CONFIG.indexName,
            body: { query }
        });
        
        const count = response.body.count;
        log(`Total documents: ${count}`, 'SUCCESS');
        
        if (Object.keys(filters).length > 0) {
            log(`Filters applied: ${JSON.stringify(filters)}`, 'DATA');
        }
        
        return count;
    } catch (error) {
        if (error.body?.error?.type === 'index_not_found_exception') {
            log(`Index '${CONFIG.indexName}' not found`, 'WARN');
            return 0;
        }
        log(`Failed to get document count: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * Build search query with filters
 */
function buildQuery(filters = {}) {
    const mustClauses = [];
    
    if (filters.difficulty) {
        mustClauses.push({ term: { difficulty: filters.difficulty } });
    }
    
    if (filters.type) {
        mustClauses.push({ term: { type: filters.type } });
    }
    
    if (filters.grade) {
        mustClauses.push({ term: { grade: filters.grade } });
    }
    
    if (filters.searchQuery) {
        mustClauses.push({
            multi_match: {
                query: filters.searchQuery,
                fields: ['question', 'explanation', 'fullText', 'searchKeywords']
            }
        });
    }
    
    if (mustClauses.length === 0) {
        return { match_all: {} };
    }
    
    return {
        bool: {
            must: mustClauses
        }
    };
}

/**
 * Get sample documents
 */
async function getSampleDocuments(client, filters = {}, size = 5) {
    try {
        log(`Getting ${size} sample documents...`);
        
        const query = buildQuery(filters);
        
        const response = await client.search({
            index: CONFIG.indexName,
            body: {
                query,
                size,
                sort: [{ createdAt: { order: 'desc' } }] // Get most recent first
            }
        });
        
        const hits = response.body.hits.hits;
        
        if (hits.length === 0) {
            log('No documents found matching criteria', 'WARN');
            return [];
        }
        
        log(`Found ${hits.length} documents:`, 'SUCCESS');
        
        hits.forEach((hit, index) => {
            const doc = hit._source;
            log(`\n--- Document ${index + 1} ---`, 'DATA');
            log(`ID: ${doc.id}`, 'DATA');
            log(`Question: ${doc.question}`, 'DATA');
            log(`Answer: ${doc.answer}`, 'DATA');
            log(`Type: ${doc.type}`, 'DATA');
            log(`Difficulty: ${doc.difficulty}`, 'DATA');
            log(`Grade: ${doc.grade}`, 'DATA');
            
            if (doc.embedding) {
                log(`Embedding: ${doc.embedding.length}D vector [${doc.embedding.slice(0, 3).map(n => n.toFixed(4)).join(', ')}...]`, 'DATA');
            }
            
            if (doc.keywords && doc.keywords.length > 0) {
                log(`Keywords: ${doc.keywords.join(', ')}`, 'DATA');
            }
            
            log(`Created: ${doc.createdAt}`, 'DATA');
        });
        
        return hits;
    } catch (error) {
        if (error.body?.error?.type === 'index_not_found_exception') {
            log(`Index '${CONFIG.indexName}' not found`, 'WARN');
            return [];
        }
        log(`Failed to get sample documents: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * Get detailed index statistics
 */
async function getIndexStats(client, indexName) {
    try {
        log(`Getting statistics for index: ${indexName}...`);
        const response = await client.indices.stats({ index: indexName });
        const stats = response.body.indices[indexName];
        
        if (!stats) {
            log('No statistics found for index', 'WARN');
            return null;
        }
        
        log('Index Statistics:', 'DATA');
        log(`  Documents: ${stats.total.docs.count}`, 'DATA');
        log(`  Deleted Documents: ${stats.total.docs.deleted}`, 'DATA');
        log(`  Store Size: ${formatBytes(stats.total.store.size_in_bytes)}`, 'DATA');
        log(`  Index Operations: ${stats.total.indexing.index_total}`, 'DATA');
        log(`  Search Operations: ${stats.total.search.query_total}`, 'DATA');
        log(`  Cache Size: ${formatBytes(stats.total.query_cache?.memory_size_in_bytes || 0)}`, 'DATA');
        
        return stats;
    } catch (error) {
        if (error.body?.error?.type === 'index_not_found_exception') {
            log(`Index '${indexName}' not found`, 'WARN');
            return null;
        }
        log(`Failed to get index statistics: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Analyze data distribution
 */
async function analyzeDataDistribution(client) {
    try {
        log('Analyzing data distribution...');
        
        const response = await client.search({
            index: CONFIG.indexName,
            body: {
                size: 0, // Don't return documents, just aggregations
                aggs: {
                    difficulty_distribution: {
                        terms: { field: 'difficulty' }
                    },
                    type_distribution: {
                        terms: { field: 'type', size: 50 }
                    },
                    grade_distribution: {
                        terms: { field: 'grade' }
                    }
                }
            }
        });
        
        const aggs = response.body.aggregations;
        
        log('Data Distribution Analysis:', 'DATA');
        
        // Difficulty distribution
        log('\nDifficulty Distribution:', 'DATA');
        aggs.difficulty_distribution.buckets.forEach(bucket => {
            log(`  ${bucket.key}: ${bucket.doc_count} questions`, 'DATA');
        });
        
        // Grade distribution
        log('\nGrade Distribution:', 'DATA');
        aggs.grade_distribution.buckets.forEach(bucket => {
            log(`  Grade ${bucket.key}: ${bucket.doc_count} questions`, 'DATA');
        });
        
        // Type distribution (top 10)
        log('\nTop 10 Question Types:', 'DATA');
        aggs.type_distribution.buckets.slice(0, 10).forEach(bucket => {
            log(`  ${bucket.key}: ${bucket.doc_count} questions`, 'DATA');
        });
        
        return aggs;
    } catch (error) {
        if (error.body?.error?.type === 'index_not_found_exception') {
            log(`Index '${CONFIG.indexName}' not found`, 'WARN');
            return null;
        }
        log(`Failed to analyze data distribution: ${error.message}`, 'ERROR');
        throw error;
    }
}

/**
 * Main execution function
 */
async function main() {
    try {
        log('='.repeat(60));
        log('Vector Database Data Inspector');
        log('='.repeat(60));
        
        const client = createClient();
        
        // Check health if requested
        if (CONFIG.showHealth) {
            await checkHealth(client);
            log('');
        }
        
        // List indices if requested
        if (CONFIG.listIndices) {
            await listIndices(client);
            log('');
        }
        
        // Show schema if requested
        if (CONFIG.showSchema) {
            await getIndexSchema(client, CONFIG.indexName);
            log('');
        }
        
        // Show statistics if requested
        if (CONFIG.showStats) {
            await getIndexStats(client, CONFIG.indexName);
            log('');
        }
        
        // Build filters
        const filters = {};
        if (CONFIG.difficulty) filters.difficulty = CONFIG.difficulty;
        if (CONFIG.type) filters.type = CONFIG.type;
        if (CONFIG.grade) filters.grade = CONFIG.grade;
        if (CONFIG.searchQuery) filters.searchQuery = CONFIG.searchQuery;
        
        // Show document count
        if (CONFIG.showCount || Object.keys(filters).length > 0) {
            await getDocumentCount(client, filters);
            log('');
        }
        
        // Get sample documents (default behavior)
        if (!CONFIG.listIndices && !CONFIG.showSchema && !CONFIG.showStats && !CONFIG.showHealth) {
            await getSampleDocuments(client, filters, CONFIG.sampleSize);
            log('');
            
            // Show data analysis if no specific filters
            if (Object.keys(filters).length === 0) {
                await analyzeDataDistribution(client);
            }
        }
        
        log('='.repeat(60));
        log('Inspection complete!', 'SUCCESS');
        
    } catch (error) {
        log(`FATAL ERROR: ${error.message}`, 'ERROR');
        console.error(error.stack);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    log('\nReceived SIGINT. Shutting down gracefully...', 'WARN');
    process.exit(130);
});

// Show help if no arguments
if (process.argv.length === 2) {
    console.log(`
Vector Database Data Inspector

Usage: node inspect-vector-data.mjs [options]

Options:
  --list-indices      Show all available indices
  --count             Show document count per index
  --sample [n]        Show sample documents (default: 5)
  --search "query"    Search for specific questions
  --difficulty easy   Filter by difficulty level (easy/medium/hard)
  --type "math_type"  Filter by question type
  --grade [n]         Filter by grade level
  --schema            Show index mapping/schema
  --health            Check cluster health
  --stats             Show detailed index statistics

Examples:
  node inspect-vector-data.mjs --sample 3
  node inspect-vector-data.mjs --search "addition"
  node inspect-vector-data.mjs --difficulty easy --count
  node inspect-vector-data.mjs --type "area_calculation" --sample 2
  node inspect-vector-data.mjs --health --stats
`);
    process.exit(0);
}

// Run the script
main();