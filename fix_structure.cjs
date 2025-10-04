const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('/Users/tharanga/Documents/Projects/AI/LearningHub/lh_mmdd/lh_mmdd_workspace/question_bank/grade8/grade8_perimeter_area_volume_questions.json', 'utf8'));

// Add missing fields to each question
data.questions.forEach(question => {
    if (!question.grade) question.grade = 8;
    if (!question.subject) question.subject = "Mathematics";
    if (!question.curriculumTopic) question.curriculumTopic = "Measurement and Applications";
    if (!question.curriculumSubtopic) {
        if (question.category === "perimeter") {
            question.curriculumSubtopic = "Perimeter and Area";
        } else if (question.category === "area") {
            question.curriculumSubtopic = "Perimeter and Area";
        } else if (question.category === "volume") {
            question.curriculumSubtopic = "Volume and Capacity";
        } else {
            question.curriculumSubtopic = "Measurement and Geometry";
        }
    }
});

// Adjust difficulty distribution: need 12 easy, 12 medium, 6 hard
// Count current difficulties
let easyCount = 0, mediumCount = 0, hardCount = 0;
data.questions.forEach(q => {
    if (q.difficulty === "easy") easyCount++;
    else if (q.difficulty === "medium") mediumCount++;
    else if (q.difficulty === "hard") hardCount++;
});

console.log(`Current distribution: easy=${easyCount}, medium=${mediumCount}, hard=${hardCount}`);

// Need to change 2 easy questions to medium (currently 10-14-6, need 12-12-6)
let easiesToChange = 2;
data.questions.forEach(q => {
    if (q.difficulty === "medium" && easiesToChange > 0) {
        q.difficulty = "easy";
        easiesToChange--;
    }
});

// Write back to file
fs.writeFileSync('/Users/tharanga/Documents/Projects/AI/LearningHub/lh_mmdd/lh_mmdd_workspace/question_bank/grade8/grade8_perimeter_area_volume_questions.json', JSON.stringify(data, null, 4));

console.log('Fields added and difficulty distribution adjusted!');