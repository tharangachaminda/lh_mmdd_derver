/**
 * Test suite for Question Model Helper Functions
 *
 * Tests category system, question type mappings, and utility functions
 *
 * TDD Phase: 🔴 RED - These tests should FAIL initially
 */

import {
  getCategoryForQuestionType,
  getCategoryInfo,
  getQuestionTypesForCategory,
  getDisplayNameForQuestionType,
  getQuestionTypeFromDisplayName,
  CategoryInfo,
} from './question.model';

describe('Question Model Helper Functions', () => {
  describe('getCategoryForQuestionType()', () => {
    it('should return correct category for ADDITION', () => {
      const result = getCategoryForQuestionType('ADDITION');
      expect(result).toBe('number-operations');
    });

    it('should return correct category for ALGEBRAIC_MANIPULATION', () => {
      const result = getCategoryForQuestionType('ALGEBRAIC_MANIPULATION');
      expect(result).toBe('algebra-patterns');
    });

    it('should return correct category for COORDINATE_GEOMETRY', () => {
      const result = getCategoryForQuestionType('COORDINATE_GEOMETRY');
      expect(result).toBe('geometry-measurement');
    });

    it('should return correct category for DATA_ANALYSIS', () => {
      const result = getCategoryForQuestionType('DATA_ANALYSIS');
      expect(result).toBe('statistics-probability');
    });

    it('should return correct category for SIMPLE_RATIOS', () => {
      const result = getCategoryForQuestionType('SIMPLE_RATIOS');
      expect(result).toBe('ratios-rates-proportions');
    });

    it('should return correct category for SPEED_CALCULATIONS', () => {
      const result = getCategoryForQuestionType('SPEED_CALCULATIONS');
      expect(result).toBe('motion-distance');
    });

    it('should return correct category for FINANCIAL_LITERACY', () => {
      const result = getCategoryForQuestionType('FINANCIAL_LITERACY');
      expect(result).toBe('financial-literacy');
    });

    it('should return default category for invalid type', () => {
      const result = getCategoryForQuestionType('INVALID_TYPE');
      expect(result).toBe('problem-solving-reasoning');
    });

    it('should return default category for empty string', () => {
      const result = getCategoryForQuestionType('');
      expect(result).toBe('problem-solving-reasoning');
    });
  });

  describe('getCategoryInfo()', () => {
    it('should return category metadata for number-operations', () => {
      const result = getCategoryInfo('number-operations');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Number Operations & Arithmetic');
      expect(result?.description).toContain('computational skills');
      expect(result?.skillsFocus).toBeInstanceOf(Array);
      expect(result?.skillsFocus.length).toBeGreaterThan(0);
      expect(result?.icon).toBeDefined();
      expect(result?.curriculumStrand).toBe('Number and Algebra');
    });

    it('should return category metadata for algebra-patterns', () => {
      const result = getCategoryInfo('algebra-patterns');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Algebra & Patterns');
      expect(result?.description).toContain('Algebraic thinking');
    });

    it('should return category metadata for geometry-measurement', () => {
      const result = getCategoryInfo('geometry-measurement');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Geometry & Measurement');
      expect(result?.curriculumStrand).toBe('Measurement and Geometry');
    });

    it('should return category metadata for statistics-probability', () => {
      const result = getCategoryInfo('statistics-probability');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Statistics & Probability');
    });

    it('should return category metadata for financial-literacy', () => {
      const result = getCategoryInfo('financial-literacy');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Financial Literacy');
      expect(result?.skillsFocus).toContain('Money calculation and budgeting');
    });

    it('should return null for invalid category key', () => {
      const result = getCategoryInfo('invalid-category');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getCategoryInfo('');
      expect(result).toBeNull();
    });
  });

  describe('getQuestionTypesForCategory()', () => {
    it('should return array of types for number-operations category', () => {
      const result = getQuestionTypesForCategory('number-operations');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('ADDITION');
      expect(result).toContain('SUBTRACTION');
      expect(result).toContain('MULTIPLICATION');
      expect(result).toContain('DIVISION');
    });

    it('should return array of types for algebra-patterns category', () => {
      const result = getQuestionTypesForCategory('algebra-patterns');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('PATTERN_RECOGNITION');
      expect(result).toContain('ALGEBRAIC_MANIPULATION');
    });

    it('should return array of types for geometry-measurement category', () => {
      const result = getQuestionTypesForCategory('geometry-measurement');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('COORDINATE_GEOMETRY');
      expect(result).toContain('PERIMETER_AREA_VOLUME');
    });

    it('should return array with one type for financial-literacy category', () => {
      const result = getQuestionTypesForCategory('financial-literacy');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result).toContain('FINANCIAL_LITERACY');
    });

    it('should return empty array for invalid category', () => {
      const result = getQuestionTypesForCategory('invalid-category');
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });

    it('should return empty array for empty string', () => {
      const result = getQuestionTypesForCategory('');
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });
  });

  describe('getDisplayNameForQuestionType()', () => {
    it('should transform ADDITION to friendly display name', () => {
      const result = getDisplayNameForQuestionType('ADDITION');
      expect(result).toBe('Addition');
    });

    it('should transform ALGEBRAIC_MANIPULATION to friendly display name', () => {
      const result = getDisplayNameForQuestionType('ALGEBRAIC_MANIPULATION');
      expect(result).toBe('Algebraic Expressions');
    });

    it('should transform FRACTION_DECIMAL_PERCENTAGE to friendly display name', () => {
      const result = getDisplayNameForQuestionType('FRACTION_DECIMAL_PERCENTAGE');
      expect(result).toBe('Fractions, Decimals & Percentages');
    });

    it('should transform COORDINATE_GEOMETRY to friendly display name', () => {
      const result = getDisplayNameForQuestionType('COORDINATE_GEOMETRY');
      expect(result).toBe('Coordinate Geometry');
    });

    it('should transform FINANCIAL_LITERACY to friendly display name', () => {
      const result = getDisplayNameForQuestionType('FINANCIAL_LITERACY');
      expect(result).toBe('Money & Financial Literacy');
    });

    it('should return original type for unmapped DB type', () => {
      const result = getDisplayNameForQuestionType('UNMAPPED_TYPE');
      expect(result).toBe('UNMAPPED_TYPE');
    });

    it('should return empty string for empty input', () => {
      const result = getDisplayNameForQuestionType('');
      expect(result).toBe('');
    });
  });

  describe('getQuestionTypeFromDisplayName()', () => {
    it('should transform Addition to ADDITION', () => {
      const result = getQuestionTypeFromDisplayName('Addition');
      expect(result).toBe('ADDITION');
    });

    it('should transform Algebraic Expressions to ALGEBRAIC_MANIPULATION', () => {
      const result = getQuestionTypeFromDisplayName('Algebraic Expressions');
      expect(result).toBe('ALGEBRAIC_MANIPULATION');
    });

    it('should transform Fractions, Decimals & Percentages to FRACTION_DECIMAL_PERCENTAGE', () => {
      const result = getQuestionTypeFromDisplayName('Fractions, Decimals & Percentages');
      expect(result).toBe('FRACTION_DECIMAL_PERCENTAGE');
    });

    it('should transform Money & Financial Literacy to FINANCIAL_LITERACY', () => {
      const result = getQuestionTypeFromDisplayName('Money & Financial Literacy');
      expect(result).toBe('FINANCIAL_LITERACY');
    });

    it('should return null for unmapped display name', () => {
      const result = getQuestionTypeFromDisplayName('Unmapped Display Name');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = getQuestionTypeFromDisplayName('');
      expect(result).toBeNull();
    });
  });

  describe('Integration: Category system consistency', () => {
    it('should have bidirectional mapping for all question types', () => {
      const dbType = 'ADDITION';
      const displayName = getDisplayNameForQuestionType(dbType);
      const reversedType = getQuestionTypeFromDisplayName(displayName);

      expect(reversedType).toBe(dbType);
    });

    it('should categorize all mapped question types', () => {
      const dbType = 'MULTIPLICATION';
      const category = getCategoryForQuestionType(dbType);
      const typesInCategory = getQuestionTypesForCategory(category);

      expect(typesInCategory).toContain(dbType);
    });

    it('should provide complete metadata for all categories', () => {
      const categories = [
        'number-operations',
        'algebra-patterns',
        'geometry-measurement',
        'statistics-probability',
        'ratios-rates-proportions',
        'motion-distance',
        'financial-literacy',
        'problem-solving-reasoning',
      ];

      categories.forEach((categoryKey) => {
        const info = getCategoryInfo(categoryKey);
        expect(info).not.toBeNull();
        expect(info?.name).toBeDefined();
        expect(info?.description).toBeDefined();
        expect(info?.skillsFocus.length).toBeGreaterThan(0);
        expect(info?.icon).toBeDefined();
        expect(info?.curriculumStrand).toBeDefined();
      });
    });
  });
});
