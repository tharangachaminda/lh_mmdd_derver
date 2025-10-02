/**
 * Grade 8 Phase 1B Dataset Tests: Negative Numbers
 * 
 * Tests for NZ Curriculum-aligned Grade 8 mathematics questions focusing on:
 * - Operations with negative numbers (addition, subtraction)
 * - Negative number ordering and comparison
 * - Integer number line understanding
 * - Real-world applications with negative values
 * 
 * Target: 15 questions with difficulty distribution:
 * - Easy: 6 questions (basic negative number operations)
 * - Medium: 6 questions (mixed operations, ordering)
 * - Hard: 3 questions (complex applications, problem solving)
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Question {
    id: string;
    question: string;
    answer: string;
    explanation: string;
    type: string;
    difficulty: 'easy' | 'medium' | 'hard';
    grade: number;
    subject: string;
    curriculumTopic: string;
    curriculumSubtopic: string;
    keywords: string[];
    createdAt: string;
    version: string;
    verified: boolean;
    documentType: string;
    contentForEmbedding: string;
}

interface Dataset {
    metadata: {
        datasetId: string;
        datasetName: string;
        grade: number;
        subject: string;
        curriculumTopic: string;
        curriculumSubtopic: string;
        totalQuestions: number;
        questionTypes: string[];
        difficultyDistribution: {
            easy: number;
            medium: number;
            hard: number;
        };
        verified: boolean;
        curriculumAligned: boolean;
        createdAt: string;
        updatedAt: string;
        version: string;
    };
    questions: Question[];
}

describe('Grade 8 Phase 1B: Negative Numbers Dataset', () => {
    let dataset: Dataset;
    const expectedFilePath = path.join(__dirname, '../../question_bank/grade8/grade8_negative_numbers_questions.json');

    beforeAll(() => {
        // This test will FAIL initially (RED phase) - dataset file doesn't exist yet
        expect(fs.existsSync(expectedFilePath)).toBe(true);
        
        const fileContent = fs.readFileSync(expectedFilePath, 'utf-8');
        dataset = JSON.parse(fileContent);
    });

    describe('Dataset Metadata Validation', () => {
        test('should have correct NZ curriculum-aligned metadata structure', () => {
            expect(dataset.metadata).toBeDefined();
            expect(dataset.metadata.datasetId).toBe('grade8-negative-numbers-2025');
            expect(dataset.metadata.datasetName).toBe('Grade 8 Negative Numbers Questions');
            expect(dataset.metadata.grade).toBe(8);
            expect(dataset.metadata.subject).toBe('Mathematics');
            expect(dataset.metadata.curriculumTopic).toBe('Number and Algebra');
            expect(dataset.metadata.curriculumSubtopic).toBe('Operations with negative numbers and integer understanding');
            expect(dataset.metadata.totalQuestions).toBe(15);
            expect(dataset.metadata.questionTypes).toEqual(['NEGATIVE_NUMBERS']);
        });

        test('should have correct difficulty distribution for Grade 8 negative numbers', () => {
            expect(dataset.metadata.difficultyDistribution).toEqual({
                easy: 6,
                medium: 6,
                hard: 3
            });
        });

        test('should be verified and curriculum aligned', () => {
            expect(dataset.metadata.verified).toBe(true);
            expect(dataset.metadata.curriculumAligned).toBe(true);
        });
    });

    describe('Questions Structure Validation', () => {
        test('should have exactly 15 questions', () => {
            expect(dataset.questions).toBeDefined();
            expect(dataset.questions.length).toBe(15);
        });

        test('should have correct difficulty distribution in questions', () => {
            const difficultyCount = dataset.questions.reduce((acc, q) => {
                acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            expect(difficultyCount.easy).toBe(6);
            expect(difficultyCount.medium).toBe(6);
            expect(difficultyCount.hard).toBe(3);
        });

        test('should have consistent Grade 8 metadata in all questions', () => {
            dataset.questions.forEach(question => {
                expect(question.grade).toBe(8);
                expect(question.subject).toBe('Mathematics');
                expect(question.type).toBe('NEGATIVE_NUMBERS');
                expect(question.curriculumTopic).toBe('Number and Algebra');
                expect(question.verified).toBe(true);
                expect(question.documentType).toBe('question');
            });
        });
    });

    describe('NZ Curriculum Content Validation', () => {
        test('should include negative number addition questions', () => {
            const additionQuestions = dataset.questions.filter(q => 
                (q.question.toLowerCase().includes('add') || q.question.includes('+')) &&
                (q.question.includes('-') || q.explanation.toLowerCase().includes('negative'))
            );
            expect(additionQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test('should include negative number subtraction questions', () => {
            const subtractionQuestions = dataset.questions.filter(q => 
                (q.question.toLowerCase().includes('subtract') || q.question.includes('-')) &&
                q.explanation.toLowerCase().includes('negative')
            );
            expect(subtractionQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test('should include number line and ordering questions', () => {
            const orderingQuestions = dataset.questions.filter(q => 
                q.question.toLowerCase().includes('order') ||
                q.question.toLowerCase().includes('greater') ||
                q.question.toLowerCase().includes('less') ||
                q.explanation.toLowerCase().includes('number line')
            );
            expect(orderingQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test('should include real-world applications with negative numbers', () => {
            const applicationQuestions = dataset.questions.filter(q => 
                q.question.toLowerCase().includes('temperature') ||
                q.question.toLowerCase().includes('elevation') ||
                q.question.toLowerCase().includes('debt') ||
                q.question.toLowerCase().includes('below')
            );
            expect(applicationQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test('should use NZ curriculum vocabulary for negative numbers', () => {
            const vocabularyTerms = ['negative number', 'positive number', 'integer', 'number line', 'opposite'];
            let vocabularyFound = 0;

            dataset.questions.forEach(question => {
                const questionText = (question.question + ' ' + question.explanation + ' ' + question.keywords.join(' ')).toLowerCase();
                vocabularyTerms.forEach(term => {
                    if (questionText.includes(term)) {
                        vocabularyFound++;
                    }
                });
            });

            expect(vocabularyFound).toBeGreaterThanOrEqual(10); // Should use curriculum vocabulary extensively
        });
    });

    describe('Question Quality Validation', () => {
        test('should have comprehensive explanations for all questions', () => {
            dataset.questions.forEach(question => {
                expect(question.explanation.length).toBeGreaterThanOrEqual(100);
                expect(question.explanation).toMatch(/Step \d+:/); // Should have step-by-step explanations
            });
        });

        test('should have appropriate keywords for searchability', () => {
            dataset.questions.forEach(question => {
                expect(question.keywords.length).toBeGreaterThanOrEqual(4);
                expect(question.keywords).toContain('grade 8');
                expect(question.keywords.some(k => 
                    ['negative', 'positive', 'integer', 'number', 'operation'].some(term => 
                        k.toLowerCase().includes(term)
                    )
                )).toBe(true);
            });
        });

        test('should have unique question IDs following Grade 8 convention', () => {
            const ids = dataset.questions.map(q => q.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(dataset.questions.length);

            // Check ID format: g8-NEGATIVE_NUMBERS-{difficulty}-{number}
            dataset.questions.forEach(question => {
                expect(question.id).toMatch(/^g8-NEGATIVE_NUMBERS-(easy|medium|hard)-\d+$/);
            });
        });

        test('should have vector-ready content embedding', () => {
            dataset.questions.forEach(question => {
                expect(question.contentForEmbedding).toBeDefined();
                expect(question.contentForEmbedding.length).toBeGreaterThanOrEqual(20);
                expect(question.contentForEmbedding.length).toBeLessThanOrEqual(200);
            });
        });
    });

    describe('Educational Value Validation', () => {
        test('should progress logically from easy to hard concepts', () => {
            const easyQuestions = dataset.questions.filter(q => q.difficulty === 'easy');
            const hardQuestions = dataset.questions.filter(q => q.difficulty === 'hard');

            // Easy questions should focus on basic operations
            const basicOperations = easyQuestions.filter(q => 
                q.question.includes('+') || q.question.includes('-') ||
                q.question.toLowerCase().includes('add') || q.question.toLowerCase().includes('subtract')
            );
            expect(basicOperations.length).toBeGreaterThanOrEqual(4);

            // Hard questions should involve complex problem solving
            const complexProblems = hardQuestions.filter(q => 
                q.explanation.toLowerCase().includes('multiple') || 
                q.explanation.toLowerCase().includes('analyze') ||
                q.question.toLowerCase().includes('temperature') ||
                q.question.toLowerCase().includes('elevation')
            );
            expect(complexProblems.length).toBeGreaterThanOrEqual(2);
        });

        test('should align with Grade 8 NZ curriculum learning outcomes', () => {
            // Test that questions address core Grade 8 negative number concepts
            const curriculumAreas = [
                'negative number',
                'positive number',
                'integer',
                'number line',
                'operation'
            ];

            curriculumAreas.forEach(area => {
                const relevantQuestions = dataset.questions.filter(q => {
                    const content = (q.question + ' ' + q.explanation + ' ' + q.curriculumSubtopic + ' ' + q.keywords.join(' ')).toLowerCase();
                    return content.includes(area.toLowerCase());
                });
                expect(relevantQuestions.length).toBeGreaterThanOrEqual(1);
            });
        });

        test('should demonstrate proper mathematical notation and language', () => {
            // Check for proper use of mathematical symbols and language
            const notationQuestions = dataset.questions.filter(q => 
                q.question.includes('-') || q.question.includes('+') ||
                q.explanation.toLowerCase().includes('positive') || 
                q.explanation.toLowerCase().includes('negative')
            );
            expect(notationQuestions.length).toBeGreaterThanOrEqual(10);
        });
    });
});