/**
 * Grade 8 Phase 1A Dataset Tests: Prime and Composite Numbers
 * 
 * Tests for NZ Curriculum-aligned Grade 8 mathematics questions focusing on:
 * - Prime numbers and prime factorization
 * - Composite numbers and factor analysis
 * - Cube numbers and their properties
 * - Powers of 10 and place value understanding
 * 
 * Target: 20 questions with difficulty distribution:
 * - Easy: 8 questions (basic prime/composite identification)
 * - Medium: 8 questions (prime factorization, cube numbers)
 * - Hard: 4 questions (advanced applications, powers analysis)
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

describe('Grade 8 Phase 1A: Prime and Composite Numbers Dataset', () => {
    let dataset: Dataset;
    const expectedFilePath = path.join(__dirname, '../../question_bank/grade8/grade8_prime_composite_numbers_questions.json');

    beforeAll(() => {
        // This test will FAIL initially (RED phase) - dataset file doesn't exist yet
        expect(fs.existsSync(expectedFilePath)).toBe(true);
        
        const fileContent = fs.readFileSync(expectedFilePath, 'utf-8');
        dataset = JSON.parse(fileContent);
    });

    describe('Dataset Metadata Validation', () => {
        test('should have correct NZ curriculum-aligned metadata structure', () => {
            expect(dataset.metadata).toBeDefined();
            expect(dataset.metadata.datasetId).toBe('grade8-prime-composite-numbers-2025');
            expect(dataset.metadata.datasetName).toBe('Grade 8 Prime and Composite Numbers Questions');
            expect(dataset.metadata.grade).toBe(8);
            expect(dataset.metadata.subject).toBe('Mathematics');
            expect(dataset.metadata.curriculumTopic).toBe('Number and Algebra');
            expect(dataset.metadata.curriculumSubtopic).toBe('Prime numbers, composite numbers, cube numbers, and powers of 10');
            expect(dataset.metadata.totalQuestions).toBe(20);
            expect(dataset.metadata.questionTypes).toEqual(['PRIME_COMPOSITE_NUMBERS']);
        });

        test('should have correct difficulty distribution for Grade 8 level', () => {
            expect(dataset.metadata.difficultyDistribution).toEqual({
                easy: 8,
                medium: 8,
                hard: 4
            });
        });

        test('should be verified and curriculum aligned', () => {
            expect(dataset.metadata.verified).toBe(true);
            expect(dataset.metadata.curriculumAligned).toBe(true);
        });
    });

    describe('Questions Structure Validation', () => {
        test('should have exactly 20 questions', () => {
            expect(dataset.questions).toBeDefined();
            expect(dataset.questions.length).toBe(20);
        });

        test('should have correct difficulty distribution in questions', () => {
            const difficultyCount = dataset.questions.reduce((acc, q) => {
                acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            expect(difficultyCount.easy).toBe(8);
            expect(difficultyCount.medium).toBe(8);
            expect(difficultyCount.hard).toBe(4);
        });

        test('should have consistent Grade 8 metadata in all questions', () => {
            dataset.questions.forEach(question => {
                expect(question.grade).toBe(8);
                expect(question.subject).toBe('Mathematics');
                expect(question.type).toBe('PRIME_COMPOSITE_NUMBERS');
                expect(question.curriculumTopic).toBe('Number and Algebra');
                expect(question.verified).toBe(true);
                expect(question.documentType).toBe('question');
            });
        });
    });

    describe('NZ Curriculum Content Validation', () => {
        test('should include prime number identification questions', () => {
            const primeQuestions = dataset.questions.filter(q => 
                q.question.toLowerCase().includes('prime') || 
                q.keywords.some(k => k.toLowerCase().includes('prime'))
            );
            expect(primeQuestions.length).toBeGreaterThanOrEqual(5);
        });

        test('should include composite number analysis questions', () => {
            const compositeQuestions = dataset.questions.filter(q => 
                q.question.toLowerCase().includes('composite') || 
                q.keywords.some(k => k.toLowerCase().includes('composite'))
            );
            expect(compositeQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test('should include cube number questions', () => {
            const cubeQuestions = dataset.questions.filter(q => 
                q.question.toLowerCase().includes('cube') || 
                q.keywords.some(k => k.toLowerCase().includes('cube'))
            );
            expect(cubeQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test('should include prime factorization questions', () => {
            const factorQuestions = dataset.questions.filter(q => 
                q.question.toLowerCase().includes('factor') || 
                q.explanation.toLowerCase().includes('factor') ||
                q.keywords.some(k => k.toLowerCase().includes('factor'))
            );
            expect(factorQuestions.length).toBeGreaterThanOrEqual(4);
        });

        test('should use NZ curriculum vocabulary', () => {
            const vocabularyTerms = ['prime number', 'composite number', 'cube number', 'powers of 10', 'factor'];
            let vocabularyFound = 0;

            dataset.questions.forEach(question => {
                const questionText = (question.question + ' ' + question.explanation + ' ' + question.keywords.join(' ')).toLowerCase();
                vocabularyTerms.forEach(term => {
                    if (questionText.includes(term)) {
                        vocabularyFound++;
                    }
                });
            });

            expect(vocabularyFound).toBeGreaterThanOrEqual(15); // Should use curriculum vocabulary extensively
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
                    ['prime', 'composite', 'cube', 'factor', 'number'].some(term => 
                        k.toLowerCase().includes(term)
                    )
                )).toBe(true);
            });
        });

        test('should have unique question IDs following Grade 8 convention', () => {
            const ids = dataset.questions.map(q => q.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(dataset.questions.length);

            // Check ID format: g8-PRIME_COMPOSITE_NUMBERS-{difficulty}-{number}
            dataset.questions.forEach(question => {
                expect(question.id).toMatch(/^g8-PRIME_COMPOSITE_NUMBERS-(easy|medium|hard)-\d+$/);
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

            // Easy questions should focus on basic identification
            const basicConcepts = easyQuestions.filter(q => 
                q.question.toLowerCase().includes('is') && 
                (q.question.toLowerCase().includes('prime') || q.question.toLowerCase().includes('composite'))
            );
            expect(basicConcepts.length).toBeGreaterThanOrEqual(3);

            // Hard questions should involve complex analysis
            const complexConcepts = hardQuestions.filter(q => 
                q.explanation.toLowerCase().includes('multiple') || 
                q.explanation.toLowerCase().includes('analyze') ||
                q.explanation.toLowerCase().includes('compare')
            );
            expect(complexConcepts.length).toBeGreaterThanOrEqual(2);
        });

        test('should align with Grade 8 NZ curriculum learning outcomes', () => {
            // Test that questions address core Grade 8 number theory concepts
            const curriculumAreas = [
                'prime number',
                'composite number', 
                'prime factor',
                'cube number',
                'powers of 10'
            ];

            curriculumAreas.forEach(area => {
                const relevantQuestions = dataset.questions.filter(q => {
                    const content = (q.question + ' ' + q.explanation + ' ' + q.curriculumSubtopic + ' ' + q.keywords.join(' ')).toLowerCase();
                    return content.includes(area.toLowerCase());
                });
                expect(relevantQuestions.length).toBeGreaterThanOrEqual(1);
            });
        });
    });
});