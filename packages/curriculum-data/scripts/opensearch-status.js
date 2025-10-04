#!/usr/bin/env node

/**
 * OpenSearch Status Check Script
 * 
 * Script to check OpenSearch cluster health, indices status,
 * and basic connectivity for the curriculum data system.
 * 
 * @fileoverview OpenSearch health and status checker
 * @version 1.0.0
 */

import { OpenSearchService } from '../services/opensearch.service.js';

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('🔍 OpenSearch Status Check');
        console.log('=' .repeat(50));

        // Initialize OpenSearch service
        const openSearchService = new OpenSearchService();
        
        console.log(`📍 Connecting to: ${openSearchService.config.node}`);
        console.log(`🏗️  Vector Index: ${openSearchService.config.vectorIndex}`);
        console.log(`📚 Curriculum Index: ${openSearchService.config.curriculumIndex}`);
        console.log('');

        // Check cluster health
        console.log('🏥 CLUSTER HEALTH');
        console.log('-' .repeat(25));
        
        try {
            const health = await openSearchService.getClusterHealth();
            
            console.log(`Status: ${health.cluster.status}`);
            console.log(`Cluster Name: ${health.cluster.cluster_name}`);
            console.log(`Active Shards: ${health.cluster.active_shards}`);
            console.log(`Relocating Shards: ${health.cluster.relocating_shards}`);
            console.log(`Initializing Shards: ${health.cluster.initializing_shards}`);
            console.log(`Unassigned Shards: ${health.cluster.unassigned_shards}`);
            console.log(`Number of Nodes: ${health.cluster.number_of_nodes}`);
            console.log(`Number of Data Nodes: ${health.cluster.number_of_data_nodes}`);
            
            // Status interpretation
            if (health.cluster.status === 'green') {
                console.log('✅ Cluster is healthy and all shards are allocated');
            } else if (health.cluster.status === 'yellow') {
                console.log('⚠️  Cluster is functional but some replica shards are not allocated');
            } else if (health.cluster.status === 'red') {
                console.log('❌ Cluster has issues - some primary shards are not allocated');
            }

        } catch (error) {
            console.error('❌ Failed to get cluster health:', error.message);
            console.log('');
            console.log('🔧 Troubleshooting:');
            console.log('1. Check if OpenSearch is running');
            console.log('2. Verify connection settings in environment variables');
            console.log('3. Check network connectivity');
            return;
        }

        console.log('');

        // Check indices
        console.log('📊 INDICES STATUS');
        console.log('-' .repeat(25));
        
        try {
            const indices = ['enhanced_questions', 'curriculum_data', 'question_bank'];
            
            for (const indexName of indices) {
                try {
                    const exists = await openSearchService.client.indices.exists({ index: indexName });
                    
                    if (exists.body) {
                        const stats = await openSearchService.client.indices.stats({ index: indexName });
                        const indexStats = stats.body.indices[indexName];
                        
                        console.log(`${indexName}:`);
                        console.log(`  ✅ Exists: Yes`);
                        console.log(`  📄 Documents: ${indexStats.total.docs.count || 0}`);
                        console.log(`  💾 Size: ${indexStats.total.store.size_in_bytes || 0} bytes`);
                        console.log(`  🔍 Shards: ${indexStats.total.shards || 0}`);
                    } else {
                        console.log(`${indexName}:`);
                        console.log(`  ❌ Exists: No`);
                        console.log(`  📝 Status: Index not created yet`);
                    }
                    console.log('');
                } catch (indexError) {
                    console.log(`${indexName}:`);
                    console.log(`  ❌ Error: ${indexError.message}`);
                    console.log('');
                }
            }

        } catch (error) {
            console.error('❌ Failed to get indices status:', error.message);
        }

        // Test basic connectivity
        console.log('🔗 CONNECTIVITY TEST');
        console.log('-' .repeat(25));
        
        try {
            const response = await openSearchService.client.info();
            console.log(`✅ Connection successful`);
            console.log(`OpenSearch Version: ${response.body.version.number}`);
            console.log(`Lucene Version: ${response.body.version.lucene_version}`);
            console.log(`Distribution: ${response.body.version.distribution || 'OpenSearch'}`);
        } catch (error) {
            console.error('❌ Connection test failed:', error.message);
        }

        console.log('');
        console.log('🎯 RECOMMENDATIONS');
        console.log('-' .repeat(25));
        
        try {
            const health = await openSearchService.getClusterHealth();
            
            if (health.cluster.status === 'green') {
                console.log('✅ System is ready for curriculum data operations');
                console.log('✅ You can safely run bulk ingestion scripts');
            } else if (health.cluster.status === 'yellow') {
                console.log('⚠️  System is functional but consider adding replica nodes');
                console.log('✅ You can proceed with data operations');
            } else {
                console.log('❌ Fix cluster issues before proceeding with data operations');
                console.log('❌ Check OpenSearch logs for detailed error information');
            }
        } catch (error) {
            console.log('❌ Cannot determine system readiness due to connection issues');
            console.log('🔧 Fix connectivity issues first');
        }

        console.log('');
        console.log('=' .repeat(50));
        console.log('✅ Status check completed');

    } catch (error) {
        console.error('❌ Status check failed:', error);
        console.error('');
        console.error('🔍 Common solutions:');
        console.error('1. Start OpenSearch: docker-compose up opensearch');
        console.error('2. Check environment variables in .env file');
        console.error('3. Verify OpenSearch is accessible at the configured URL');
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}