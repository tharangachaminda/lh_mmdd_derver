/**
 * Quick validation script for Phase 1 helper functions
 * Runs outside of Jest/Karma to verify implementation works
 */

// Import the functions (we'll run this with ts-node or similar)
import {
  getCategoryForQuestionType,
  getCategoryInfo,
  getQuestionTypesForCategory,
  getDisplayNameForQuestionType,
  getQuestionTypeFromDisplayName,
} from './src/app/core/models/question.model.js';

console.log('🧪 PHASE 1 GREEN PHASE VALIDATION');
console.log('='.repeat(70));

let passedTests = 0;
let failedTests = 0;

function test(description: string, testFn: () => boolean) {
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ PASS: ${description}`);
      passedTests++;
    } else {
      console.log(`❌ FAIL: ${description}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${description}`);
    console.log(`   ${error}`);
    failedTests++;
  }
}

console.log('\n📋 Testing getCategoryForQuestionType()');
console.log('-'.repeat(70));

test('ADDITION maps to number-operations', () => {
  return getCategoryForQuestionType('ADDITION') === 'number-operations';
});

test('ALGEBRAIC_MANIPULATION maps to algebra-patterns', () => {
  return getCategoryForQuestionType('ALGEBRAIC_MANIPULATION') === 'algebra-patterns';
});

test('COORDINATE_GEOMETRY maps to geometry-measurement', () => {
  return getCategoryForQuestionType('COORDINATE_GEOMETRY') === 'geometry-measurement';
});

test('FINANCIAL_LITERACY maps to financial-literacy', () => {
  return getCategoryForQuestionType('FINANCIAL_LITERACY') === 'financial-literacy';
});

test('Invalid type returns default category', () => {
  return getCategoryForQuestionType('INVALID_TYPE') === 'problem-solving-reasoning';
});

console.log('\n📋 Testing getCategoryInfo()');
console.log('-'.repeat(70));

test('Returns valid info for number-operations', () => {
  const info = getCategoryInfo('number-operations');
  return (
    info !== null &&
    info.name === 'Number Operations & Arithmetic' &&
    info.icon === 'calculate' &&
    info.skillsFocus.length > 0
  );
});

test('Returns valid info for algebra-patterns', () => {
  const info = getCategoryInfo('algebra-patterns');
  return info !== null && info.name === 'Algebra & Patterns' && info.icon === 'functions';
});

test('Returns null for invalid category', () => {
  return getCategoryInfo('invalid-category') === null;
});

console.log('\n📋 Testing getQuestionTypesForCategory()');
console.log('-'.repeat(70));

test('Returns types for number-operations', () => {
  const types = getQuestionTypesForCategory('number-operations');
  return (
    Array.isArray(types) &&
    types.length > 0 &&
    types.includes('ADDITION') &&
    types.includes('SUBTRACTION')
  );
});

test('Returns one type for financial-literacy', () => {
  const types = getQuestionTypesForCategory('financial-literacy');
  return Array.isArray(types) && types.length === 1 && types[0] === 'FINANCIAL_LITERACY';
});

test('Returns empty array for invalid category', () => {
  const types = getQuestionTypesForCategory('invalid-category');
  return Array.isArray(types) && types.length === 0;
});

console.log('\n📋 Testing getDisplayNameForQuestionType()');
console.log('-'.repeat(70));

test('ADDITION transforms to Addition', () => {
  return getDisplayNameForQuestionType('ADDITION') === 'Addition';
});

test('ALGEBRAIC_MANIPULATION transforms to Algebraic Expressions', () => {
  return getDisplayNameForQuestionType('ALGEBRAIC_MANIPULATION') === 'Algebraic Expressions';
});

test('FRACTION_DECIMAL_PERCENTAGE transforms correctly', () => {
  return (
    getDisplayNameForQuestionType('FRACTION_DECIMAL_PERCENTAGE') ===
    'Fractions, Decimals & Percentages'
  );
});

test('Unmapped type returns original', () => {
  return getDisplayNameForQuestionType('UNMAPPED_TYPE') === 'UNMAPPED_TYPE';
});

console.log('\n📋 Testing getQuestionTypeFromDisplayName()');
console.log('-'.repeat(70));

test('Addition transforms to ADDITION', () => {
  return getQuestionTypeFromDisplayName('Addition') === 'ADDITION';
});

test('Algebraic Expressions transforms to ALGEBRAIC_MANIPULATION', () => {
  return getQuestionTypeFromDisplayName('Algebraic Expressions') === 'ALGEBRAIC_MANIPULATION';
});

test('Fractions, Decimals & Percentages transforms correctly', () => {
  return (
    getQuestionTypeFromDisplayName('Fractions, Decimals & Percentages') ===
    'FRACTION_DECIMAL_PERCENTAGE'
  );
});

test('Unmapped display name returns null', () => {
  return getQuestionTypeFromDisplayName('Unmapped Display Name') === null;
});

console.log('\n📋 Testing bidirectional mapping');
console.log('-'.repeat(70));

test('ADDITION -> Addition -> ADDITION roundtrip', () => {
  const dbType = 'ADDITION';
  const displayName = getDisplayNameForQuestionType(dbType);
  const reversedType = getQuestionTypeFromDisplayName(displayName);
  return reversedType === dbType;
});

test('Category system consistency: MULTIPLICATION', () => {
  const dbType = 'MULTIPLICATION';
  const category = getCategoryForQuestionType(dbType);
  const typesInCategory = getQuestionTypesForCategory(category);
  return typesInCategory.includes(dbType);
});

console.log('\n' + '='.repeat(70));
console.log(`\n📊 TEST RESULTS:`);
console.log(`   ✅ Passed: ${passedTests}`);
console.log(`   ❌ Failed: ${failedTests}`);
console.log(
  `   📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`
);

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED! GREEN PHASE VALIDATED! ✅');
  process.exit(0);
} else {
  console.log('\n⚠️  SOME TESTS FAILED - GREEN PHASE NOT COMPLETE');
  process.exit(1);
}
