import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the questions data
const filePath = join(__dirname, 'grade5-comprehensive-questions.json');
const questionsData = JSON.parse(readFileSync(filePath, 'utf8'));

// Function to determine difficulty based on question ID and complexity
function determineDifficulty(question) {
    const id = question.id;
    
    // Clear difficulty based on ID prefix
    if (id.startsWith('g5-easy-')) return 'easy';
    if (id.startsWith('g5-medium-')) return 'medium';
    if (id.startsWith('g5-hard-')) return 'hard';
    
    // For g5-comp- questions, assign based on complexity
    if (id.startsWith('g5-comp-')) {
        const questionText = question.question.toLowerCase();
        const type = question.type;
        
        // Easy complexity indicators
        if (type.includes('basic') || 
            questionText.includes('what is') && questionText.length < 50 ||
            type === 'shape_identification' ||
            type === 'fraction_basics' ||
            type === 'decimal_comparison') {
            return 'easy';
        }
        
        // Hard complexity indicators  
        if (questionText.includes('calculate') && questionText.includes('×') ||
            questionText.includes('÷') && questionText.includes('remainder') ||
            type.includes('mixed') ||
            type.includes('multi') ||
            questionText.includes('supplementary') ||
            questionText.includes('parallelogram') ||
            type === 'mean_calculation' ||
            type === 'volume_calculation' ||
            questionText.split(' ').length > 20) {
            return 'hard';
        }
        
        // Default to medium for g5-comp questions
        return 'medium';
    }
    
    return 'medium'; // Default fallback
}

// Add difficulty field to each question
let updatedCount = 0;
questionsData.sampleQuestions.forEach(question => {
    if (!question.difficulty) {
        question.difficulty = determineDifficulty(question);
        updatedCount++;
    }
});

console.log(`🔧 DIFFICULTY FIELD ADDITION COMPLETE`);
console.log(`Updated ${updatedCount} questions with difficulty levels`);

// Count questions by difficulty
const difficultyCount = {};
questionsData.sampleQuestions.forEach(q => {
    difficultyCount[q.difficulty] = (difficultyCount[q.difficulty] || 0) + 1;
});

console.log('\n📊 DIFFICULTY DISTRIBUTION:');
Object.entries(difficultyCount).forEach(([difficulty, count]) => {
    console.log(`  ${difficulty}: ${count} questions`);
});

// Write updated data back to file
writeFileSync(filePath, JSON.stringify(questionsData, null, 4), 'utf8');

console.log('\n✅ File updated successfully!');
console.log('\n🎯 VECTOR DATABASE BENEFITS:');
console.log('- ✅ Each question now has consistent difficulty metadata');
console.log('- ✅ Enables difficulty-based filtering and retrieval');
console.log('- ✅ Supports adaptive learning pathways');
console.log('- ✅ Improves search precision for specific difficulty levels');
console.log('- ✅ Better indexing and query performance');