import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the questions data
const filePath = join(__dirname, 'grade5-comprehensive-questions.json');
const questionsData = JSON.parse(readFileSync(filePath, 'utf8'));

// Extract common metadata from the curriculum structure
const commonMetadata = {
    grade: questionsData.grade,
    subject: questionsData.subject,
    curriculumId: questionsData.id,
    curriculumTopic: questionsData.topic,
    curriculumSubtopic: questionsData.subtopic,
    conceptId: questionsData.concept.id,
    conceptName: questionsData.concept.name,
    conceptDescription: questionsData.concept.description,
    prerequisites: questionsData.prerequisites,
    learningObjectives: questionsData.learningObjectives,
    gradeLevelStandards: questionsData.gradeLevelStandards,
    createdAt: questionsData.createdAt,
    updatedAt: questionsData.updatedAt,
    version: questionsData.version
};

// Enhanced questions array for vector database
const enhancedQuestions = questionsData.sampleQuestions.map(question => ({
    // Original question data
    ...question,
    
    // Add common curriculum metadata to each question
    ...commonMetadata,
    
    // Enhanced metadata for better retrieval
    fullText: `${question.question} ${question.explanation}`,
    searchKeywords: [
        ...question.keywords,
        ...questionsData.concept.keywords,
        question.difficulty,
        `grade-${questionsData.grade}`,
        question.type.replace(/_/g, ' ')
    ].join(' '),
    
    // Vector database optimized fields
    documentType: 'question',
    difficulty: question.difficulty,
    grade: questionsData.grade,
    subject: questionsData.subject,
    
    // Content for embedding generation
    contentForEmbedding: [
        question.question,
        question.explanation,
        question.keywords.join(' '),
        question.type.replace(/_/g, ' '),
        question.difficulty,
        `grade ${questionsData.grade}`,
        questionsData.subject
    ].join(' ')
}));

// Create a new structure optimized for vector database storage
const vectorDbOptimizedData = {
    metadata: {
        datasetId: questionsData.id,
        datasetName: "Grade 5 Comprehensive Mathematics Questions",
        grade: questionsData.grade,
        subject: questionsData.subject,
        totalQuestions: enhancedQuestions.length,
        difficultyDistribution: {
            easy: enhancedQuestions.filter(q => q.difficulty === 'easy').length,
            medium: enhancedQuestions.filter(q => q.difficulty === 'medium').length,
            hard: enhancedQuestions.filter(q => q.difficulty === 'hard').length
        },
        questionTypes: [...new Set(enhancedQuestions.map(q => q.type))],
        createdAt: questionsData.createdAt,
        updatedAt: questionsData.updatedAt,
        version: questionsData.version,
        curriculumAlignment: questionsData.gradeLevelStandards
    },
    questions: enhancedQuestions
};

// Write the vector database optimized version
const vectorDbFilePath = join(__dirname, 'grade5-questions-vector-ready.json');
writeFileSync(vectorDbFilePath, JSON.stringify(vectorDbOptimizedData, null, 2), 'utf8');

console.log('🚀 VECTOR DATABASE OPTIMIZATION COMPLETE');
console.log('===========================================');
console.log(`✅ Enhanced ${enhancedQuestions.length} questions with full metadata`);
console.log(`✅ Created vector-ready file: grade5-questions-vector-ready.json`);
console.log('\n📊 OPTIMIZATION BENEFITS:');
console.log('- 🎯 Self-contained questions with complete curriculum context');
console.log('- 🔍 Enhanced search keywords for better semantic matching');
console.log('- 📈 Optimized content fields for embedding generation');
console.log('- 🏷️  Consistent metadata across all questions');
console.log('- 🎓 Complete curriculum alignment information per question');

console.log('\n📋 METADATA ADDED TO EACH QUESTION:');
console.log('- ✅ Grade level and subject');
console.log('- ✅ Curriculum alignment standards');
console.log('- ✅ Prerequisites and learning objectives');
console.log('- ✅ Concept information and descriptions');
console.log('- ✅ Enhanced keywords for semantic search');
console.log('- ✅ Full text content for embedding generation');

console.log('\n🎯 DIFFICULTY DISTRIBUTION:');
Object.entries(vectorDbOptimizedData.metadata.difficultyDistribution).forEach(([level, count]) => {
    console.log(`  ${level}: ${count} questions (${Math.round(count/enhancedQuestions.length*100)}%)`);
});

console.log('\n📁 FILES READY FOR VECTOR DATABASE:');
console.log('  📄 grade5-questions-vector-ready.json - Optimized for vector storage');
console.log('  📄 grade5-comprehensive-questions.json - Original with difficulty fields added');

console.log('\n🎉 READY FOR VECTOR DATABASE INGESTION!');