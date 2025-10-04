#!/usr/bin/env node

/**
 * Clear Grade 3 Questions from Vector Database
 * 
 * This script removes any existing Grade 3 questions from the OpenSearch vector database
 * to prepare for fresh question ingestion.
 */

import { OpenSearchService } from './dist/services/opensearch.service.js';

async function clearGrade3Questions() {
    try {
        console.log('🧹 Clearing existing Grade 3 questions from vector database...');
        
        const openSearchService = new OpenSearchService();
        
        // Use deleteByQuery to remove all Grade 3 questions
        console.log('🗑️  Deleting all Grade 3 questions...');
        
        const deleteQuery = {
            query: {
                term: {
                    grade: 3
                }
            }
        };
        
        const result = await openSearchService.deleteByQuery('questions', deleteQuery);
        
        if (result) {
            console.log(`✅ Successfully deleted Grade 3 questions from vector database`);
        } else {
            console.log('ℹ️  No existing Grade 3 questions found or deletion completed');
        }
        
        console.log('🎉 Grade 3 cleanup complete!');
        
    } catch (error) {
        console.error('❌ Error clearing Grade 3 questions:', error.message);
        // Don't exit with error if no questions exist
        if (error.message.includes('index_not_found') || error.message.includes('not found')) {
            console.log('ℹ️  No questions index found - this is normal for first-time setup');
        } else {
            console.error(error.stack);
            process.exit(1);
        }
    }
}

// Run the cleanup
clearGrade3Questions();