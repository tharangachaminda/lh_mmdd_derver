#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Verifies all required environment variables are properly configured
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔧 Environment Variable Configuration Check\n');

const configs = [
    {
        category: 'Server Settings',
        vars: [
            { name: 'PORT', value: process.env.PORT, default: '3000' },
            { name: 'NODE_ENV', value: process.env.NODE_ENV, default: 'development' }
        ]
    },
    {
        category: 'Ollama Configuration',
        vars: [
            { name: 'OLLAMA_BASE_URL', value: process.env.OLLAMA_BASE_URL, default: 'http://127.0.0.1:11434' },
            { name: 'OLLAMA_MODEL_NAME', value: process.env.OLLAMA_MODEL_NAME, default: 'llama2' },
            { name: 'OLLAMA_EMBEDDING_MODEL', value: process.env.OLLAMA_EMBEDDING_MODEL, default: 'nomic-embed-text' }
        ]
    },
    {
        category: 'OpenSearch Configuration',
        vars: [
            { name: 'OPENSEARCH_NODE', value: process.env.OPENSEARCH_NODE, default: 'https://localhost:9200' },
            { name: 'OPENSEARCH_USERNAME', value: process.env.OPENSEARCH_USERNAME, default: 'admin' },
            { name: 'OPENSEARCH_PASSWORD', value: process.env.OPENSEARCH_PASSWORD ? '***CONFIGURED***' : undefined, default: 'admin' }
        ]
    },
    {
        category: 'Vector Database Settings',
        vars: [
            { name: 'VECTOR_INDEX_NAME', value: process.env.VECTOR_INDEX_NAME, default: 'enhanced_questions' },
            { name: 'VECTOR_DIMENSION', value: process.env.VECTOR_DIMENSION, default: '1536' },
            { name: 'VECTOR_SIMILARITY', value: process.env.VECTOR_SIMILARITY, default: 'cosine' }
        ]
    },
    {
        category: 'Embedding Service',
        vars: [
            { name: 'EMBEDDING_BATCH_SIZE', value: process.env.EMBEDDING_BATCH_SIZE, default: '10' },
            { name: 'EMBEDDING_TIMEOUT', value: process.env.EMBEDDING_TIMEOUT, default: '30000' }
        ]
    }
];

configs.forEach(({ category, vars }) => {
    console.log(`📊 ${category}`);
    console.log('─'.repeat(50));
    
    vars.forEach(({ name, value, default: defaultValue }) => {
        const status = value ? '✅' : '⚠️ ';
        const displayValue = value || `(default: ${defaultValue})`;
        console.log(`${status} ${name.padEnd(25)} = ${displayValue}`);
    });
    
    console.log('');
});

console.log('🎯 Configuration Summary:');
console.log('─'.repeat(50));

const allConfigured = configs.every(({ vars }) => 
    vars.every(({ value }) => value !== undefined)
);

if (allConfigured) {
    console.log('✅ All environment variables are configured');
} else {
    console.log('⚠️  Some variables using defaults - check .env file');
}

console.log('\n📁 Expected Data Directories:');
console.log('─'.repeat(50));
console.log('📂 ./opensearch-data/  (persistent data)');
console.log('📂 ./opensearch-logs/  (service logs)');
console.log('📂 ./backups/          (backup storage)');

console.log('\n🚀 Next Steps:');
console.log('─'.repeat(50));
console.log('1. Start persistent OpenSearch: docker-compose up -d');
console.log('2. Create backup of current data: ./backup-opensearch.sh');
console.log('3. Verify configuration: node test-env-config.mjs');