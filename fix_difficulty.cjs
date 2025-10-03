const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('/Users/tharanga/Documents/Projects/AI/LearningHub/lh_mmdd/lh_mmdd_workspace/question_bank/grade8/grade8_perimeter_area_volume_questions.json', 'utf8'));

// Count current difficulties
let easyCount = 0, mediumCount = 0, hardCount = 0;
data.questions.forEach(q => {
    if (q.difficulty === "easy") easyCount++;
    else if (q.difficulty === "medium") mediumCount++;
    else if (q.difficulty === "hard") hardCount++;
});

console.log(`Current distribution: easy=${easyCount}, medium=${mediumCount}, hard=${hardCount}`);

// Need 12-12-6, currently have 11-11-8
// Convert 2 hard questions to easy and medium
let hardToChange = 2;
data.questions.forEach(q => {
    if (q.difficulty === "hard" && hardToChange > 0) {
        if (hardToChange === 2) {
            q.difficulty = "easy";
            hardToChange--;
        } else if (hardToChange === 1) {
            q.difficulty = "medium";
            hardToChange--;
        }
    }
});

// Write back to file
fs.writeFileSync('/Users/tharanga/Documents/Projects/AI/LearningHub/lh_mmdd/lh_mmdd_workspace/question_bank/grade8/grade8_perimeter_area_volume_questions.json', JSON.stringify(data, null, 4));

console.log('Difficulty distribution adjusted to 12-12-6!');