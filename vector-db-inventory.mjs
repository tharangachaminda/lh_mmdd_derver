#!/usr/bin/env node

/**
 * Vector Database Inventory Script
 * 
 * Comprehensive analysis of all question datasets (Grades 3-8) 
 * and their ingestion status in the vector database.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Log with colors and timestamp
 */
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString().substring(11, 19);
    const colors = {
        'INFO': '\x1b[36m',
        'SUCCESS': '\x1b[32m',
        'ERROR': '\x1b[31m',
        'WARN': '\x1b[33m',
        'HEADER': '\x1b[35m'
    };
    const resetColor = '\x1b[0m';
    const color = colors[level] || '';
    
    console.log(`${color}[${timestamp}] ${message}${resetColor}`);
}

/**
 * Scan directory for question files
 */
async function scanQuestionFiles() {
    const questionBank = path.join(__dirname, 'question_bank');
    const grades = ['grade3', 'grade4', 'grade5', 'grade6', 'grade7', 'grade8'];
    const inventory = {};
    
    for (const grade of grades) {
        const gradePath = path.join(questionBank, grade);
        inventory[grade] = {
            datasets: [],
            totalQuestions: 0,
            totalFiles: 0
        };
        
        try {
            const files = await fs.readdir(gradePath);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            
            for (const file of jsonFiles) {
                const filePath = path.join(gradePath, file);
                
                try {
                    const content = await fs.readFile(filePath, 'utf8');
                    const data = JSON.parse(content);
                    
                    if (data.questions && Array.isArray(data.questions)) {
                        inventory[grade].datasets.push({
                            filename: file,
                            datasetId: data.metadata?.datasetId || 'unknown',
                            topic: data.metadata?.topic || file.replace('.json', ''),
                            questionCount: data.questions.length,
                            hasMetadata: !!data.metadata,
                            difficulty: data.metadata?.difficultyDistribution || null,
                            verified: data.metadata?.verified || false,
                            curriculumAligned: data.metadata?.curriculumAligned || false
                        });
                        
                        inventory[grade].totalQuestions += data.questions.length;
                        inventory[grade].totalFiles++;
                    }
                } catch (error) {
                    log(`Error reading ${file}: ${error.message}`, 'ERROR');
                }
            }
        } catch (error) {
            log(`Error scanning ${grade}: ${error.message}`, 'ERROR');
        }
    }
    
    return inventory;
}

/**
 * Test OpenSearch connection and get status
 */
async function checkVectorDatabaseStatus() {
    try {
        const response = await fetch('http://localhost:9200/_cluster/health');
        if (response.ok) {
            const health = await response.json();
            return {
                status: 'ONLINE',
                health: health.status,
                details: health
            };
        } else {
            return {
                status: 'ERROR',
                health: 'unavailable',
                details: `HTTP ${response.status}`
            };
        }
    } catch (error) {
        return {
            status: 'OFFLINE',
            health: 'disconnected',
            details: error.message
        };
    }
}

/**
 * Get ingested question counts from vector database
 */
async function getIngestedQuestionCounts() {
    try {
        // Try to get counts by grade from the vector database
        const response = await fetch('http://localhost:9200/questions/_search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                size: 0,
                aggs: {
                    by_grade: {
                        terms: {
                            field: 'grade',
                            size: 10
                        }
                    },
                    by_type: {
                        terms: {
                            field: 'type.keyword',
                            size: 50
                        }
                    }
                }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                totalQuestions: data.hits.total.value,
                byGrade: data.aggregations.by_grade.buckets,
                byType: data.aggregations.by_type.buckets
            };
        } else {
            return { success: false, error: `HTTP ${response.status}` };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Display comprehensive report
 */
function displayReport(inventory, dbStatus, ingestedData) {
    log('='.repeat(80), 'HEADER');
    log('📊 GRADES 3-8 QUESTION INVENTORY & VECTOR DATABASE STATUS', 'HEADER');
    log('='.repeat(80), 'HEADER');
    
    // Vector Database Status
    log('', 'INFO');
    log('🗄️  VECTOR DATABASE STATUS', 'HEADER');
    log(`Status: ${dbStatus.status}`, dbStatus.status === 'ONLINE' ? 'SUCCESS' : 'ERROR');
    log(`Health: ${dbStatus.health}`, 'INFO');
    
    if (ingestedData.success) {
        log(`Total Ingested Questions: ${ingestedData.totalQuestions}`, 'SUCCESS');
        log('', 'INFO');
        log('Questions by Grade:', 'INFO');
        ingestedData.byGrade.forEach(bucket => {
            log(`  Grade ${bucket.key}: ${bucket.doc_count} questions`, 'SUCCESS');
        });
    } else {
        log(`Database Query Error: ${ingestedData.error}`, 'ERROR');
    }
    
    // Dataset Inventory
    log('', 'INFO');
    log('📚 DATASET INVENTORY BY GRADE', 'HEADER');
    
    let grandTotal = 0;
    let totalDatasets = 0;
    
    Object.entries(inventory).forEach(([grade, data]) => {
        const gradeNumber = grade.replace('grade', '');
        log('', 'INFO');
        log(`Grade ${gradeNumber}:`, 'HEADER');
        log(`  Files: ${data.totalFiles}`, 'INFO');
        log(`  Total Questions: ${data.totalQuestions}`, 'INFO');
        
        if (data.datasets.length > 0) {
            log('  Datasets:', 'INFO');
            data.datasets.forEach(dataset => {
                const status = dataset.verified ? '✅' : '⏳';
                log(`    ${status} ${dataset.topic} (${dataset.questionCount} questions)`, 'INFO');
            });
        }
        
        grandTotal += data.totalQuestions;
        totalDatasets += data.totalFiles;
    });
    
    // Summary
    log('', 'INFO');
    log('📈 OVERALL SUMMARY', 'HEADER');
    log(`Total Dataset Files: ${totalDatasets}`, 'INFO');
    log(`Total Available Questions: ${grandTotal}`, 'INFO');
    
    if (ingestedData.success) {
        log(`Total Ingested Questions: ${ingestedData.totalQuestions}`, 'SUCCESS');
        const coverage = ((ingestedData.totalQuestions / grandTotal) * 100).toFixed(1);
        log(`Ingestion Coverage: ${coverage}%`, coverage > 80 ? 'SUCCESS' : 'WARN');
        
        const missing = grandTotal - ingestedData.totalQuestions;
        if (missing > 0) {
            log(`Missing from Vector DB: ${missing} questions`, 'WARN');
        }
    }
    
    // Recommendations
    log('', 'INFO');
    log('💡 RECOMMENDATIONS', 'HEADER');
    
    if (dbStatus.status !== 'ONLINE') {
        log('1. Restart OpenSearch service for database access', 'WARN');
    }
    
    if (ingestedData.success && ingestedData.totalQuestions < grandTotal) {
        log('2. Some datasets need ingestion - run ingestion scripts', 'WARN');
    }
    
    if (ingestedData.success && ingestedData.totalQuestions === grandTotal) {
        log('✅ All available questions are ingested!', 'SUCCESS');
    }
    
    log('3. Phase 1G (Grade 8 Algebraic Manipulation) ready for ingestion', 'INFO');
}

/**
 * Main execution
 */
async function main() {
    try {
        log('Starting comprehensive inventory analysis...', 'INFO');
        
        // Scan all question files
        const inventory = await scanQuestionFiles();
        
        // Check vector database status
        const dbStatus = await checkVectorDatabaseStatus();
        
        // Get ingested question counts
        let ingestedData = { success: false, error: 'Database unavailable' };
        if (dbStatus.status === 'ONLINE') {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for DB to be ready
            ingestedData = await getIngestedQuestionCounts();
        }
        
        // Display comprehensive report
        displayReport(inventory, dbStatus, ingestedData);
        
    } catch (error) {
        log(`Fatal error: ${error.message}`, 'ERROR');
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the analysis
main();