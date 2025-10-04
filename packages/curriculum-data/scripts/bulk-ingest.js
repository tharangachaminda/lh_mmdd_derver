#!/usr/bin/env node

/**
 * Bulk Question Ingestion Script
 * 
 * Script to ingest all scattered question files in the repository
 * into the centralized curriculum data system.
 * 
 * @fileoverview Bulk ingestion runner script
 * @version 1.0.0
 */

import { OpenSearchService } from '../services/opensearch.service.js';
import { EmbeddingService } from '../vector-db/embedding.service.js';
import { BulkQuestionIngester } from '../ingestion/bulk-question-ingester.js';

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('🚀 Starting bulk question ingestion...');
        console.log('');

        // Initialize services
        console.log('🔧 Initializing services...');
        const openSearchService = new OpenSearchService();
        const embeddingService = new EmbeddingService();
        const bulkIngester = new BulkQuestionIngester(openSearchService, embeddingService);

        // Initialize OpenSearch indices
        console.log('🏗️  Initializing OpenSearch indices...');
        await openSearchService.initializeIndices();

        // Check OpenSearch health
        console.log('🔍 Checking OpenSearch cluster health...');
        const health = await openSearchService.getClusterHealth();
        console.log(`   Status: ${health.cluster.status}`);
        console.log(`   Active shards: ${health.cluster.active_shards}`);

        // Run ingestion with default config
        console.log('');
        console.log('📚 Starting question ingestion...');
        const config = {
            sourceDirectory: '../../..',  // Root workspace directory
            filePatterns: [
                'grade*-questions*.json',
                'grade*-template.json',
                'curriculum-*.json',
                'sample-curriculum-*.json',
                '**/question_bank/**/*.json',
                '**/content/**/*.json'
            ],
            batchSize: 25,
            generateEmbeddings: true,
            validateData: true,
            skipExisting: false,
            dryRun: false  // Set to true for testing
        };

        const stats = await bulkIngester.ingestExistingQuestions(config);

        // Print final summary
        console.log('');
        console.log('🎉 INGESTION COMPLETED!');
        console.log('=' .repeat(60));
        console.log(`📊 Total files processed: ${stats.totalFiles}`);
        console.log(`📝 Total questions found: ${stats.totalQuestions}`);
        console.log(`✅ Successfully ingested: ${stats.processedQuestions}`);
        console.log(`❌ Failed to ingest: ${stats.failedQuestions}`);
        console.log(`⏱️  Total processing time: ${(stats.processingTime / 1000).toFixed(2)}s`);
        
        if (stats.totalQuestions > 0) {
            const successRate = (stats.processedQuestions / stats.totalQuestions * 100).toFixed(1);
            console.log(`🎯 Success rate: ${successRate}%`);
        }

        if (stats.errors.length > 0) {
            console.log(`⚠️  Errors encountered: ${stats.errors.length}`);
            console.log('   First few errors:');
            stats.errors.slice(0, 3).forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.file}: ${error.error.substring(0, 100)}...`);
            });
        }

        console.log('=' .repeat(60));
        console.log('✅ Bulk ingestion script completed successfully!');

    } catch (error) {
        console.error('❌ Bulk ingestion failed:', error);
        console.error('');
        console.error('🔍 Troubleshooting tips:');
        console.error('1. Check that OpenSearch is running and accessible');
        console.error('2. Verify environment variables are set correctly');
        console.error('3. Ensure file permissions allow reading source files');
        console.error('4. Check network connectivity to embedding service');
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}