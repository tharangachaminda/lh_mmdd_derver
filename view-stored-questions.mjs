#!/usr/bin/env node

/**
 * Vector Database Question Viewer
 * 
 * View and search questions stored in the vector database
 * 
 * Usage: 
 *   node view-stored-questions.mjs --grade 3 --type ADDITION --difficulty easy
 *   node view-stored-questions.mjs --grade 3 --count
 *   node view-stored-questions.mjs --search "apples"
 */

import { OpenSearchService } from './dist/services/opensearch.service.js';
import { EmbeddingService } from './dist/services/embedding.service.js';

/**
 * Logger function
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
}

/**
 * Main execution function
 */
async function main() {
    const args = process.argv.slice(2);
    
    try {
        log('Vector Database Question Viewer');
        log('='.repeat(50));
        
        // Initialize services
        const openSearchService = new OpenSearchService();
        
        // Parse arguments
        const gradeIndex = args.indexOf('--grade');
        const typeIndex = args.indexOf('--type');
        const difficultyIndex = args.indexOf('--difficulty');
        const countFlag = args.includes('--count');
        const searchIndex = args.indexOf('--search');
        
        const filters = {};
        if (gradeIndex !== -1 && args[gradeIndex + 1]) {
            filters.grade = parseInt(args[gradeIndex + 1]);
        }
        if (typeIndex !== -1 && args[typeIndex + 1]) {
            filters.type = args[typeIndex + 1];
        }
        if (difficultyIndex !== -1 && args[difficultyIndex + 1]) {
            filters.difficulty = args[difficultyIndex + 1];
        }
        
        if (searchIndex !== -1 && args[searchIndex + 1]) {
            // Vector search
            const searchTerm = args[searchIndex + 1];
            const showAnswers = args.includes('--with-answers');
            
            log(`Performing vector search for: "${searchTerm}"`);
            
            const embeddingService = new EmbeddingService();
            const searchEmbedding = await embeddingService.generateEmbedding(searchTerm);
            
            const results = await openSearchService.searchEnhancedQuestions({
                embedding: searchEmbedding,
                filters: filters,
                size: 10
            });
            
            log(`Found ${results.length} results:`);
            log('');
            
            if (showAnswers) {
                // Get full question details including answers
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    try {
                        // Get the full question details
                        const fullResults = await openSearchService.getAllQuestions({
                            ...filters,
                            size: 1000  // Get many to find the specific question
                        });
                        
                        const fullQuestion = fullResults.questions.find(q => q.id === result.id);
                        
                        console.log(`${i + 1}. [Grade ${result.grade}] [${result.difficulty}] [Score: ${result.score.toFixed(3)}]`);
                        console.log(`   ${result.question}`);
                        if (fullQuestion) {
                            console.log(`   Answer: ${fullQuestion.answer}`);
                            if (fullQuestion.explanation) {
                                console.log(`   Explanation: ${fullQuestion.explanation}`);
                            }
                        }
                        console.log(`   Type: ${result.type}`);
                        console.log('');
                    } catch (error) {
                        console.log(`${i + 1}. [Grade ${result.grade}] [${result.difficulty}] [Score: ${result.score.toFixed(3)}]`);
                        console.log(`   ${result.question}`);
                        console.log(`   Type: ${result.type}`);
                        console.log('');
                    }
                }
            } else {
                results.forEach((result, index) => {
                    console.log(`${index + 1}. [Grade ${result.grade}] [${result.difficulty}] [Score: ${result.score.toFixed(3)}]`);
                    console.log(`   ${result.question}`);
                    console.log(`   Type: ${result.type}`);
                    console.log('');
                });
            }
            
        } else if (countFlag) {
            // Get counts
            const results = await openSearchService.getAllQuestions({
                ...filters,
                size: 1000  // Get many to count
            });
            
            log(`Total questions matching filters: ${results.total}`);
            
            if (results.questions.length > 0) {
                // Count by difficulty
                const difficultyCount = {};
                const typeCount = {};
                const gradeCount = {};
                
                results.questions.forEach(q => {
                    difficultyCount[q.difficulty] = (difficultyCount[q.difficulty] || 0) + 1;
                    typeCount[q.type] = (typeCount[q.type] || 0) + 1;
                    gradeCount[q.grade] = (gradeCount[q.grade] || 0) + 1;
                });
                
                console.log('\\nBreakdown:');
                console.log('By Difficulty:', difficultyCount);
                console.log('By Type:', typeCount);
                console.log('By Grade:', gradeCount);
            }
            
        } else {
            // List questions
            const results = await openSearchService.getAllQuestions({
                ...filters,
                size: 20
            });
            
            log(`Found ${results.total} total questions (showing first ${Math.min(20, results.questions.length)}):`);
            log('');
            
            results.questions.forEach((question, index) => {
                console.log(`${index + 1}. [${question.id}] [Grade ${question.grade}] [${question.difficulty}]`);
                console.log(`   ${question.question}`);
                console.log(`   Answer: ${question.answer}`);
                console.log('');
            });
            
            if (results.total > 20) {
                log(`... and ${results.total - 20} more questions`);
            }
        }
        
    } catch (error) {
        log(`ERROR: ${error.message}`, 'ERROR');
        console.error(error.stack);
        process.exit(1);
    }
}

// Show usage if no args
if (process.argv.length === 2) {
    console.log('Usage:');
    console.log('  node view-stored-questions.mjs --grade 3 --type ADDITION --difficulty easy');
    console.log('  node view-stored-questions.mjs --grade 3 --count');
    console.log('  node view-stored-questions.mjs --search "apples"');
    console.log('  node view-stored-questions.mjs --search "times tables" --with-answers');
    console.log('  node view-stored-questions.mjs --grade 3 --search "addition"');
    process.exit(0);
}

// Run the script
main();