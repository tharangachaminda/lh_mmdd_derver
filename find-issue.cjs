const fs = require('fs');
const data = JSON.parse(fs.readFileSync('question_bank/grade8/grade8_algebraic_manipulation_questions.json', 'utf8'));
data.questions.forEach((q, i) => {
  if (!q.contentForEmbedding.includes('expand') && !q.contentForEmbedding.includes('simplify')) {
    console.log(`Question ${i+1}: ${q.contentForEmbedding}`);
  }
});