#!/usr/bin/env node

/**
 * Clear Grade 5 Questions from Vector Database
 * 
 * This script removes any existing Grade 5 questions from the OpenSearch vector database
 * to prepare for fresh, systematic question ingestion following our MMDD methodology.
 */

import { OpenSearchService } from './dist/services/opensearch.service.js';

async function clearGrade5Questions() {
    try {
        console.log('🧹 Clearing existing Grade 5 questions from vector database...');
        console.log('📋 Preparing for systematic Grade 5 curriculum implementation');
        
        const openSearchService = new OpenSearchService();
        
        // First, check how many Grade 5 questions exist
        const countQuery = {
            query: {
                term: {
                    grade: 5
                }
            }
        };
        
        try {
            const countResult = await openSearchService.search('questions', countQuery, 0, 0);
            console.log(`📊 Found ${countResult.total} existing Grade 5 questions to remove`);
        } catch (countError) {
            console.log('ℹ️  Unable to count existing questions (this is normal if index is empty)');
        }
        
        // Use deleteByQuery to remove all Grade 5 questions
        console.log('🗑️  Deleting all Grade 5 questions...');
        
        const deleteQuery = {
            query: {
                term: {
                    grade: 5
                }
            }
        };
        
        const result = await openSearchService.deleteByQuery('questions', deleteQuery);
        
        if (result) {
            console.log(`✅ Successfully deleted Grade 5 questions from vector database`);
            console.log(`🔧 Database ready for systematic Grade 5 curriculum implementation`);
        } else {
            console.log('ℹ️  No existing Grade 5 questions found or deletion completed');
        }
        
        console.log('🎉 Grade 5 cleanup complete!');
        console.log('🚀 Ready to implement comprehensive Grade 5 question types');
        
    } catch (error) {
        console.error('❌ Error clearing Grade 5 questions:', error.message);
        // Don't exit with error if no questions exist
        if (error.message.includes('index_not_found') || error.message.includes('not found')) {
            console.log('ℹ️  No questions index found - this is normal for first-time setup');
        } else {
            console.error(error.stack);
            process.exit(1);
        }
    }
}

// Execute the cleanup
clearGrade5Questions();