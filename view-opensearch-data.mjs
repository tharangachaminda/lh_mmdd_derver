#!/usr/bin/env node

/**
 * Simple OpenSearch Data Viewer
 * 
 * This script directly queries OpenSearch to see what data is currently stored
 * without requiring TypeScript compilation.
 */

import { Client } from '@opensearch-project/opensearch';

// Configuration
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

/**
 * Log message with color
 */
function log(message, level = 'INFO') {
    const colors = {
        'INFO': '\x1b[36m',    // Cyan
        'SUCCESS': '\x1b[32m', // Green  
        'ERROR': '\x1b[31m',   // Red
        'WARN': '\x1b[33m',    // Yellow
        'DATA': '\x1b[35m',    // Magenta
    };
    const resetColor = '\x1b[0m';
    console.log(`${colors[level] || ''}${message}${resetColor}`);
}

/**
 * Check what indices exist
 */
async function checkIndices() {
    try {
        log('='.repeat(60), 'INFO');
        log('OpenSearch Data Viewer', 'INFO');
        log('='.repeat(60), 'INFO');
        
        log('Checking available indices...', 'INFO');
        const response = await client.cat.indices({ format: 'json' });
        const indices = response.body;
        
        log('\nAvailable Indices:', 'DATA');
        indices.forEach(index => {
            if (index.index.includes('math') || index.index.includes('question')) {
                log(`📊 ${index.index} - ${index['docs.count']} documents (${index['store.size']})`, 'SUCCESS');
            }
        });
        
        return indices.filter(idx => idx.index.includes('math') || idx.index.includes('question'));
        
    } catch (error) {
        log(`Error checking indices: ${error.message}`, 'ERROR');
        return [];
    }
}

/**
 * Get documents from an index
 */
async function getDocuments(indexName, size = 5) {
    try {
        log(`\nGetting documents from ${indexName}...`, 'INFO');
        
        const response = await client.search({
            index: indexName,
            body: {
                query: { match_all: {} },
                size: size
            }
        });
        
        const hits = response.body.hits.hits;
        
        if (hits.length === 0) {
            log('No documents found', 'WARN');
            return [];
        }
        
        log(`Found ${hits.length} documents:`, 'SUCCESS');
        
        hits.forEach((hit, index) => {
            const doc = hit._source;
            log(`\n--- Document ${index + 1} ---`, 'DATA');
            
            // Display fields dynamically based on what exists
            Object.entries(doc).forEach(([key, value]) => {
                if (key === 'embedding') {
                    log(`${key}: [${value.length}D vector] ${value.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...`, 'DATA');
                } else if (Array.isArray(value)) {
                    log(`${key}: [${value.length} items] ${value.slice(0, 3).join(', ')}${value.length > 3 ? '...' : ''}`, 'DATA');
                } else if (typeof value === 'object') {
                    log(`${key}: ${JSON.stringify(value)}`, 'DATA');
                } else {
                    const displayValue = String(value).length > 100 ? 
                        String(value).substring(0, 100) + '...' : 
                        String(value);
                    log(`${key}: ${displayValue}`, 'DATA');
                }
            });
        });
        
        return hits;
        
    } catch (error) {
        log(`Error getting documents from ${indexName}: ${error.message}`, 'ERROR');
        return [];
    }
}

/**
 * Get document count for an index
 */
async function getDocumentCount(indexName) {
    try {
        const response = await client.count({
            index: indexName,
            body: {
                query: { match_all: {} }
            }
        });
        
        return response.body.count;
    } catch (error) {
        log(`Error counting documents in ${indexName}: ${error.message}`, 'ERROR');
        return 0;
    }
}

/**
 * Get index mapping to see structure
 */
async function getIndexStructure(indexName) {
    try {
        log(`\nIndex Structure for ${indexName}:`, 'INFO');
        
        const response = await client.indices.getMapping({
            index: indexName
        });
        
        const mapping = response.body[indexName]?.mappings?.properties;
        
        if (mapping) {
            Object.entries(mapping).forEach(([field, config]) => {
                const type = config.type || 'object';
                const extra = config.dimension ? ` (${config.dimension}D vector)` : '';
                log(`  📋 ${field}: ${type}${extra}`, 'DATA');
            });
        } else {
            log('  No mapping found', 'WARN');
        }
        
    } catch (error) {
        log(`Error getting mapping for ${indexName}: ${error.message}`, 'ERROR');
    }
}

/**
 * Main function
 */
async function main() {
    try {
        // Check health first
        const health = await client.cluster.health();
        log(`Cluster Health: ${health.body.status}`, 'SUCCESS');
        
        // Check indices
        const mathIndices = await checkIndices();
        
        if (mathIndices.length === 0) {
            log('\n❌ No math-related indices found!', 'ERROR');
            log('This means no questions have been indexed yet.', 'WARN');
            log('\nTo index your questions, run:', 'INFO');
            log('  node ingest-grade5-questions.mjs --verbose', 'INFO');
            return;
        }
        
        // Examine each math-related index
        for (const index of mathIndices) {
            const count = await getDocumentCount(index.index);
            log(`\n${'='.repeat(50)}`, 'INFO');
            log(`Index: ${index.index} (${count} documents)`, 'SUCCESS');
            log(`${'='.repeat(50)}`, 'INFO');
            
            // Show structure
            await getIndexStructure(index.index);
            
            // Show sample documents
            await getDocuments(index.index, 3);
        }
        
        log('\n' + '='.repeat(60), 'INFO');
        log('📊 Data viewing complete!', 'SUCCESS');
        log('='.repeat(60), 'INFO');
        
    } catch (error) {
        log(`Fatal error: ${error.message}`, 'ERROR');
        console.error(error.stack);
    }
}

// Run the script
main();