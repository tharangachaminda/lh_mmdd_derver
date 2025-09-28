import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { OpenSearchService } from '../services/opensearch.service.js';

// Mock client for testing enhanced schema
const mockClient = {
    indices: {
        exists: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    index: jest.fn(),
    search: jest.fn(),
    deleteByQuery: jest.fn(),
    cluster: {
        health: jest.fn(),
    },
};

describe('OpenSearchService - Enhanced Question Schema', () => {
    let service: OpenSearchService;

    beforeEach(() => {
        service = new OpenSearchService(mockClient as any);
        jest.clearAllMocks();
    });

    describe('Enhanced Index Schema', () => {
        it('should create index with enhanced metadata fields', async () => {
            // RED Phase: This test will fail because enhanced schema doesn't exist yet
            mockClient.indices.exists.mockResolvedValue({ body: false });
            mockClient.indices.create.mockResolvedValue({ 
                body: { acknowledged: true } 
            });

            await service.initializeEnhancedIndex();

            expect(mockClient.indices.create).toHaveBeenCalledWith({
                index: 'enhanced-math-questions',
                body: {
                    settings: {
                        index: {
                            knn: true,
                        },
                    },
                    mappings: {
                        properties: {
                            // Enhanced question fields
                            id: { type: 'keyword' },
                            question: { type: 'text' },
                            answer: { type: 'text' },
                            explanation: { type: 'text' },
                            type: { type: 'keyword' },
                            difficulty: { type: 'keyword' },
                            keywords: { type: 'keyword' },
                            
                            // Enhanced curriculum metadata
                            grade: { type: 'integer' },
                            subject: { type: 'keyword' },
                            conceptName: { type: 'text' },
                            prerequisites: { type: 'text' },
                            learningObjectives: { type: 'text' },
                            gradeLevelStandards: {
                                type: 'object',
                                properties: {
                                    strand: { type: 'keyword' },
                                    standard: { type: 'text' },
                                    description: { type: 'text' }
                                }
                            },
                            
                            // Enhanced search fields
                            fullText: { type: 'text' },
                            searchKeywords: { type: 'text' },
                            contentForEmbedding: { type: 'text' },
                            
                            // Vector embedding
                            embedding: {
                                type: 'knn_vector',
                                dimension: 1536,
                                method: {
                                    name: 'hnsw',
                                    space_type: 'cosinesimil',
                                    engine: 'lucene',
                                },
                            },
                            
                            // Metadata
                            createdAt: { type: 'date' },
                            updatedAt: { type: 'date' },
                        },
                    },
                },
            });
        });

        it('should store enhanced question with complete metadata', async () => {
            // RED Phase: This test will fail because storeEnhancedQuestion doesn't exist
            const enhancedQuestion = {
                id: 'g5-easy-001',
                question: 'Calculate: 4,567 + 2,834',
                answer: 7401,
                explanation: 'Adding the numbers column by column...',
                type: 'whole_number_addition',
                difficulty: 'easy',
                keywords: ['addition', 'multi-digit', 'carrying'],
                grade: 5,
                subject: 'Mathematics',
                conceptName: 'Grade 5 Comprehensive Mathematics Concepts',
                prerequisites: ['Basic addition', 'Place value understanding'],
                learningObjectives: ['Add multi-digit numbers with regrouping'],
                gradeLevelStandards: {
                    strand: 'Number and Algebra',
                    standard: 'NA5-3',
                    description: 'Add and subtract whole numbers'
                },
                fullText: 'Calculate: 4,567 + 2,834 Adding the numbers column by column...',
                searchKeywords: 'addition multi-digit carrying regrouping mathematics',
                contentForEmbedding: 'Calculate: 4,567 + 2,834. Addition problem requiring carrying across multiple place values.',
                embedding: Array(1536).fill(0.1)
            };

            mockClient.index.mockResolvedValue({ 
                body: { result: 'created', _id: 'test-id' } 
            });

            await service.storeEnhancedQuestion(enhancedQuestion);

            expect(mockClient.index).toHaveBeenCalledWith({
                index: 'enhanced-math-questions',
                body: {
                    ...enhancedQuestion,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                },
            });
        });

        it('should search with enhanced filters', async () => {
            // RED Phase: This test will fail because enhanced search doesn't exist
            const searchQuery = {
                grade: 5,
                difficulty: 'easy',
                subject: 'Mathematics',
                type: 'whole_number_addition'
            };

            const mockResults = {
                body: {
                    hits: {
                        hits: [
                            {
                                _score: 0.95,
                                _source: {
                                    id: 'g5-easy-001',
                                    question: 'Calculate: 4,567 + 2,834',
                                    difficulty: 'easy',
                                    grade: 5,
                                    type: 'whole_number_addition'
                                }
                            }
                        ]
                    }
                }
            };

            mockClient.search.mockResolvedValue(mockResults);

            const results = await service.searchEnhancedQuestions({
                embedding: Array(1536).fill(0.1),
                filters: searchQuery,
                size: 5
            });

            expect(mockClient.search).toHaveBeenCalledWith({
                index: 'enhanced-math-questions',
                body: {
                    size: 5,
                    query: {
                        bool: {
                            must: [
                                {
                                    knn: {
                                        embedding: {
                                            vector: Array(1536).fill(0.1),
                                            k: 5,
                                        },
                                    },
                                },
                            ],
                            filter: [
                                { term: { grade: 5 } },
                                { term: { difficulty: 'easy' } },
                                { term: { subject: 'Mathematics' } },
                                { term: { type: 'whole_number_addition' } }
                            ]
                        },
                    },
                },
            });

            expect(results).toHaveLength(1);
            expect(results[0]).toMatchObject({
                id: 'g5-easy-001',
                score: 0.95,
                difficulty: 'easy'
            });
        });
    });
});