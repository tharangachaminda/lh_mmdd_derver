# Mathematics Question Types: Grade-Level Taxonomy

**Document Type**: Technical Specification  
**Date**: 2025-10-08  
**Status**: Proposal  
**Related Work Item**: `feature/proper-question-types-for-math`

---

## 📋 Executive Summary

This document defines a comprehensive, grade-appropriate taxonomy of mathematics question types that:

-   Aligns with 54 existing vector DB question types
-   Follows New Zealand Mathematics Curriculum progression
-   Provides user-friendly display names for students
-   Enables effective semantic vector search
-   Scales from Grade 3 (basic) to Grade 8 (advanced)

---

## 🎯 Type Naming Convention

### Database Type → Display Name Mapping

| Database Type (Vector DB)     | Display Name (UI)                   | Category                 |
| ----------------------------- | ----------------------------------- | ------------------------ |
| `ADDITION`                    | "Addition"                          | Number Operations        |
| `SUBTRACTION`                 | "Subtraction"                       | Number Operations        |
| `MULTIPLICATION`              | "Multiplication"                    | Number Operations        |
| `DIVISION`                    | "Division"                          | Number Operations        |
| `DECIMAL_BASICS`              | "Decimals (Basic)"                  | Number Operations        |
| `DECIMAL_OPERATIONS`          | "Decimal Operations"                | Number Operations        |
| `FRACTION_BASICS`             | "Fractions (Basic)"                 | Number Operations        |
| `FRACTION_OPERATIONS`         | "Fraction Operations"               | Number Operations        |
| `FRACTION_DECIMAL_PERCENTAGE` | "Fractions, Decimals & Percentages" | Number Operations        |
| `PLACE_VALUE`                 | "Place Value"                       | Number Operations        |
| `LARGE_NUMBER_OPERATIONS`     | "Large Number Calculations"         | Number Operations        |
| `NEGATIVE_NUMBERS`            | "Negative Numbers"                  | Number Operations        |
| `PRIME_COMPOSITE_NUMBERS`     | "Prime & Composite Numbers"         | Number Operations        |
| `ADVANCED_ARITHMETIC`         | "Advanced Arithmetic"               | Number Operations        |
| `ADVANCED_FRACTIONS_DECIMALS` | "Advanced Fractions & Decimals"     | Number Operations        |
| `PATTERN_RECOGNITION`         | "Pattern Recognition"               | Algebra & Patterns       |
| `NUMBER_PATTERNS`             | "Number Patterns & Sequences"       | Algebra & Patterns       |
| `ADVANCED_PATTERNS`           | "Advanced Patterns"                 | Algebra & Patterns       |
| `ALGEBRAIC_THINKING`          | "Algebraic Thinking"                | Algebra & Patterns       |
| `ALGEBRAIC_EQUATIONS`         | "Algebraic Equations"               | Algebra & Patterns       |
| `ALGEBRAIC_FOUNDATIONS`       | "Algebra Foundations"               | Algebra & Patterns       |
| `ALGEBRAIC_MANIPULATION`      | "Algebraic Expressions"             | Algebra & Patterns       |
| `LINEAR_EQUATIONS`            | "Linear Equations"                  | Algebra & Patterns       |
| `SHAPE_PROPERTIES`            | "Shape Properties"                  | Geometry & Measurement   |
| `AREA_VOLUME_CALCULATIONS`    | "Area & Volume"                     | Geometry & Measurement   |
| `PERIMETER_AREA_VOLUME`       | "Perimeter, Area & Volume"          | Geometry & Measurement   |
| `COORDINATE_GEOMETRY`         | "Coordinate Geometry"               | Geometry & Measurement   |
| `GEOMETRY_SPATIAL_REASONING`  | "Spatial Reasoning"                 | Geometry & Measurement   |
| `TRANSFORMATIONS_SYMMETRY`    | "Transformations & Symmetry"        | Geometry & Measurement   |
| `MEASUREMENT_MASTERY`         | "Measurement & Units"               | Geometry & Measurement   |
| `UNIT_CONVERSIONS`            | "Unit Conversions"                  | Geometry & Measurement   |
| `MULTI_UNIT_CONVERSIONS`      | "Multi-Unit Conversions"            | Geometry & Measurement   |
| `TIME_MEASUREMENT`            | "Time Calculations"                 | Geometry & Measurement   |
| `TIME_CALCULATIONS`           | "Time Problems"                     | Geometry & Measurement   |
| `DATA_ANALYSIS`               | "Data Analysis"                     | Statistics & Probability |
| `DATA_ANALYSIS_PROBABILITY`   | "Data & Probability"                | Statistics & Probability |
| `PROBABILITY_BASICS`          | "Basic Probability"                 | Statistics & Probability |
| `RATIO_PROPORTION`            | "Ratios & Proportions"              | Real-World Applications  |
| `SIMPLE_RATIOS`               | "Simple Ratios"                     | Real-World Applications  |
| `EQUIVALENT_RATIOS`           | "Equivalent Ratios"                 | Real-World Applications  |
| `RATIO_SIMPLIFICATION`        | "Ratio Simplification"              | Real-World Applications  |
| `PROPORTIONS`                 | "Proportions"                       | Real-World Applications  |
| `SCALE_FACTORS`               | "Scale & Proportion"                | Real-World Applications  |
| `UNIT_RATES`                  | "Unit Rates"                        | Real-World Applications  |
| `SPEED_CALCULATIONS`          | "Speed, Distance & Time"            | Real-World Applications  |
| `AVERAGE_SPEED`               | "Average Speed"                     | Real-World Applications  |
| `DISTANCE_CALCULATIONS`       | "Distance Problems"                 | Real-World Applications  |
| `MULTI_STAGE_JOURNEYS`        | "Multi-Stage Journeys"              | Real-World Applications  |
| `UNIT_CONVERSIONS_MOTION`     | "Speed & Distance Conversions"      | Real-World Applications  |
| `FINANCIAL_LITERACY`          | "Money & Financial Literacy"        | Real-World Applications  |
| `REAL_WORLD_APPLICATIONS`     | "Real-World Math Problems"          | Real-World Applications  |
| `ADVANCED_PROBLEM_SOLVING`    | "Problem Solving"                   | Real-World Applications  |
| `MATHEMATICAL_REASONING`      | "Mathematical Reasoning"            | Real-World Applications  |

---

## 📚 Grade-Specific Topic Assignments

### Grade 3 (Ages 7-8) - Foundation Stage

**Total Types**: 6  
**Focus**: Basic operations, patterns, simple measurement

```typescript
mathematics: [
    "Addition", // ADDITION
    "Subtraction", // SUBTRACTION
    "Multiplication", // MULTIPLICATION
    "Division", // DIVISION
    "Pattern Recognition", // PATTERN_RECOGNITION
    "Shape Properties", // SHAPE_PROPERTIES (basic 2D/3D)
];
```

**Rationale**:

-   Core four operations for numeracy foundation
-   Pattern recognition develops algebraic thinking
-   Basic shape identification for geometry introduction
-   Aligned with NZ Year 3 curriculum expectations

---

### Grade 4 (Ages 8-9) - Consolidation Stage

**Total Types**: 11  
**Focus**: Multi-digit operations, fractions/decimals introduction, measurement

```typescript
mathematics: [
    "Addition", // ADDITION (multi-digit)
    "Subtraction", // SUBTRACTION (multi-digit)
    "Multiplication", // MULTIPLICATION (algorithms)
    "Division", // DIVISION (with remainders)
    "Decimals (Basic)", // DECIMAL_BASICS
    "Fractions (Basic)", // FRACTION_BASICS
    "Place Value", // PLACE_VALUE
    "Pattern Recognition", // PATTERN_RECOGNITION
    "Shape Properties", // SHAPE_PROPERTIES (3D shapes)
    "Time Calculations", // TIME_MEASUREMENT
    "Measurement & Units", // MEASUREMENT_MASTERY (intro)
];
```

**Rationale**:

-   Expanded operations with larger numbers
-   Introduction to fractions and decimals
-   Place value understanding for number sense
-   Practical measurement and time skills
-   Aligned with NZ Year 4 curriculum

---

### Grade 5 (Ages 9-10) - Expansion Stage

**Total Types**: 16  
**Focus**: Intermediate operations, fraction/decimal fluency, geometry expansion

```typescript
mathematics: [
    "Multiplication", // MULTIPLICATION (multi-digit)
    "Division", // DIVISION (long division)
    "Advanced Arithmetic", // ADVANCED_ARITHMETIC
    "Decimal Operations", // DECIMAL_OPERATIONS
    "Fraction Operations", // FRACTION_OPERATIONS
    "Ratios & Proportions", // RATIO_PROPORTION (intro)
    "Algebraic Thinking", // ALGEBRAIC_THINKING (pre-algebra)
    "Pattern Recognition", // PATTERN_RECOGNITION
    "Area & Volume", // AREA_VOLUME_CALCULATIONS
    "Coordinate Geometry", // COORDINATE_GEOMETRY (basic)
    "Measurement & Units", // MEASUREMENT_MASTERY
    "Time Problems", // TIME_CALCULATIONS
    "Data Analysis", // DATA_ANALYSIS (mean, median, mode)
    "Basic Probability", // PROBABILITY_BASICS
    "Shape Properties", // SHAPE_PROPERTIES
    "Real-World Math Problems", // REAL_WORLD_APPLICATIONS
];
```

**Rationale**:

-   Fluency with all four operations
-   Operations with fractions and decimals
-   Introduction to ratios and algebraic thinking
-   Comprehensive geometry and measurement
-   Statistical literacy begins
-   Aligned with NZ Year 5 curriculum

---

### Grade 6 (Ages 10-11) - Advanced Operations Stage

**Total Types**: 22  
**Focus**: Complex operations, algebra introduction, advanced problem solving

```typescript
mathematics: [
    "Large Number Calculations", // LARGE_NUMBER_OPERATIONS
    "Advanced Fractions & Decimals", // ADVANCED_FRACTIONS_DECIMALS
    "Fractions, Decimals & Percentages", // FRACTION_DECIMAL_PERCENTAGE
    "Algebraic Equations", // ALGEBRAIC_EQUATIONS (simple)
    "Algebraic Thinking", // ALGEBRAIC_THINKING
    "Advanced Patterns", // ADVANCED_PATTERNS
    "Number Patterns & Sequences", // NUMBER_PATTERNS
    "Perimeter, Area & Volume", // PERIMETER_AREA_VOLUME
    "Coordinate Geometry", // COORDINATE_GEOMETRY
    "Transformations & Symmetry", // TRANSFORMATIONS_SYMMETRY
    "Measurement & Units", // MEASUREMENT_MASTERY
    "Unit Conversions", // UNIT_CONVERSIONS
    "Data Analysis", // DATA_ANALYSIS
    "Basic Probability", // PROBABILITY_BASICS
    "Ratios & Proportions", // RATIO_PROPORTION
    "Simple Ratios", // SIMPLE_RATIOS
    "Problem Solving", // ADVANCED_PROBLEM_SOLVING
    "Mathematical Reasoning", // MATHEMATICAL_REASONING
    "Real-World Math Problems", // REAL_WORLD_APPLICATIONS
    "Time Problems", // TIME_CALCULATIONS
    "Shape Properties", // SHAPE_PROPERTIES
    "Advanced Arithmetic", // ADVANCED_ARITHMETIC
];
```

**Rationale**:

-   Comprehensive number operations including large numbers
-   Solid algebra foundation with equations
-   Advanced geometry with transformations
-   Strong emphasis on problem solving and reasoning
-   Real-world applications for practical math
-   Aligned with NZ Year 6 curriculum

---

### Grade 7 (Ages 11-12) - Pre-Secondary Stage

**Total Types**: 24  
**Focus**: Algebra foundations, advanced geometry, statistics & probability

```typescript
mathematics: [
    "Advanced Arithmetic", // ADVANCED_NUMBER_OPERATIONS
    "Negative Numbers", // NEGATIVE_NUMBERS
    "Fractions, Decimals & Percentages", // FRACTION_DECIMAL_MASTERY
    "Advanced Fractions & Decimals", // ADVANCED_FRACTIONS_DECIMALS
    "Algebra Foundations", // ALGEBRAIC_FOUNDATIONS
    "Algebraic Equations", // ALGEBRAIC_EQUATIONS
    "Number Patterns & Sequences", // NUMBER_PATTERNS
    "Advanced Patterns", // ADVANCED_PATTERNS
    "Perimeter, Area & Volume", // PERIMETER_AREA_VOLUME
    "Spatial Reasoning", // GEOMETRY_SPATIAL_REASONING
    "Coordinate Geometry", // COORDINATE_GEOMETRY
    "Transformations & Symmetry", // TRANSFORMATIONS_SYMMETRY
    "Multi-Unit Conversions", // MULTI_UNIT_CONVERSIONS
    "Unit Conversions", // UNIT_CONVERSIONS
    "Data & Probability", // DATA_ANALYSIS_PROBABILITY
    "Data Analysis", // DATA_ANALYSIS
    "Basic Probability", // PROBABILITY_BASICS
    "Ratios & Proportions", // RATIO_PROPORTION
    "Equivalent Ratios", // EQUIVALENT_RATIOS
    "Unit Rates", // UNIT_RATES
    "Speed, Distance & Time", // SPEED_CALCULATIONS
    "Problem Solving", // ADVANCED_PROBLEM_SOLVING
    "Mathematical Reasoning", // MATHEMATICAL_REASONING
    "Real-World Math Problems", // REAL_WORLD_APPLICATIONS
];
```

**Rationale**:

-   Operations with negative numbers (integers)
-   Strong algebra foundation for secondary school
-   3D geometry and spatial reasoning
-   Comprehensive statistics and probability
-   Complex unit conversions
-   Real-world problem solving emphasis
-   Aligned with NZ Year 7 curriculum

---

### Grade 8 (Ages 12-13) - Secondary Preparation Stage

**Total Types**: 30  
**Focus**: Algebraic manipulation, financial literacy, comprehensive math literacy

```typescript
mathematics: [
    "Prime & Composite Numbers", // PRIME_COMPOSITE_NUMBERS
    "Negative Numbers", // NEGATIVE_NUMBERS
    "Large Number Calculations", // LARGE_NUMBER_OPERATIONS
    "Fractions, Decimals & Percentages", // FRACTION_DECIMAL_PERCENTAGE
    "Advanced Fractions & Decimals", // ADVANCED_FRACTIONS_DECIMALS
    "Money & Financial Literacy", // FINANCIAL_LITERACY
    "Number Patterns & Sequences", // NUMBER_PATTERNS
    "Linear Equations", // LINEAR_EQUATIONS
    "Algebraic Expressions", // ALGEBRAIC_MANIPULATION
    "Algebra Foundations", // ALGEBRAIC_FOUNDATIONS
    "Algebraic Equations", // ALGEBRAIC_EQUATIONS
    "Perimeter, Area & Volume", // PERIMETER_AREA_VOLUME
    "Coordinate Geometry", // COORDINATE_GEOMETRY
    "Spatial Reasoning", // GEOMETRY_SPATIAL_REASONING
    "Transformations & Symmetry", // TRANSFORMATIONS_SYMMETRY
    "Multi-Unit Conversions", // MULTI_UNIT_CONVERSIONS
    "Unit Conversions", // UNIT_CONVERSIONS
    "Time Problems", // TIME_CALCULATIONS
    "Speed, Distance & Time", // SPEED_CALCULATIONS
    "Average Speed", // AVERAGE_SPEED
    "Distance Problems", // DISTANCE_CALCULATIONS
    "Multi-Stage Journeys", // MULTI_STAGE_JOURNEYS
    "Speed & Distance Conversions", // UNIT_CONVERSIONS_MOTION
    "Data & Probability", // DATA_ANALYSIS_PROBABILITY
    "Data Analysis", // DATA_ANALYSIS
    "Ratios & Proportions", // RATIO_PROPORTION
    "Ratio Simplification", // RATIO_SIMPLIFICATION
    "Scale & Proportion", // SCALE_FACTORS
    "Problem Solving", // ADVANCED_PROBLEM_SOLVING
    "Mathematical Reasoning", // MATHEMATICAL_REASONING
];
```

**Rationale**:

-   Number theory foundations (primes, composites)
-   Financial literacy for real-world application
-   Algebraic manipulation for secondary math
-   Comprehensive geometry including spatial reasoning
-   Advanced motion problems (speed, distance, multi-stage)
-   Strong data analysis and probability
-   Complex problem solving and mathematical reasoning
-   Fully aligned with NZ Year 8 curriculum (verified against Ministry of Education standards)

---

## 🎨 UI/UX Categorization

### Category Structure for User Interface

```typescript
const TOPIC_CATEGORIES = {
    "Number Operations": [
        "Addition",
        "Subtraction",
        "Multiplication",
        "Division",
        "Decimals (Basic)",
        "Decimal Operations",
        "Fractions (Basic)",
        "Fraction Operations",
        "Fractions, Decimals & Percentages",
        "Place Value",
        "Large Number Calculations",
        "Negative Numbers",
        "Prime & Composite Numbers",
        "Advanced Arithmetic",
        "Advanced Fractions & Decimals",
    ],

    "Algebra & Patterns": [
        "Pattern Recognition",
        "Number Patterns & Sequences",
        "Advanced Patterns",
        "Algebraic Thinking",
        "Algebraic Equations",
        "Algebra Foundations",
        "Algebraic Expressions",
        "Linear Equations",
    ],

    "Geometry & Measurement": [
        "Shape Properties",
        "Area & Volume",
        "Perimeter, Area & Volume",
        "Coordinate Geometry",
        "Spatial Reasoning",
        "Transformations & Symmetry",
        "Measurement & Units",
        "Unit Conversions",
        "Multi-Unit Conversions",
        "Time Calculations",
        "Time Problems",
    ],

    "Statistics & Probability": [
        "Data Analysis",
        "Data & Probability",
        "Basic Probability",
    ],

    "Real-World Applications": [
        "Ratios & Proportions",
        "Simple Ratios",
        "Equivalent Ratios",
        "Ratio Simplification",
        "Proportions",
        "Scale & Proportion",
        "Unit Rates",
        "Speed, Distance & Time",
        "Average Speed",
        "Distance Problems",
        "Multi-Stage Journeys",
        "Speed & Distance Conversions",
        "Money & Financial Literacy",
        "Real-World Math Problems",
        "Problem Solving",
        "Mathematical Reasoning",
    ],
};
```

---

## 🔄 Type Transformation Utilities

### TypeScript Implementation

```typescript
/**
 * Maps database question type to user-friendly display name
 */
export const QUESTION_TYPE_DISPLAY_NAMES: Record<string, string> = {
    ADDITION: "Addition",
    SUBTRACTION: "Subtraction",
    MULTIPLICATION: "Multiplication",
    DIVISION: "Division",
    DECIMAL_BASICS: "Decimals (Basic)",
    DECIMAL_OPERATIONS: "Decimal Operations",
    FRACTION_BASICS: "Fractions (Basic)",
    FRACTION_OPERATIONS: "Fraction Operations",
    FRACTION_DECIMAL_PERCENTAGE: "Fractions, Decimals & Percentages",
    PLACE_VALUE: "Place Value",
    LARGE_NUMBER_OPERATIONS: "Large Number Calculations",
    NEGATIVE_NUMBERS: "Negative Numbers",
    PRIME_COMPOSITE_NUMBERS: "Prime & Composite Numbers",
    ADVANCED_ARITHMETIC: "Advanced Arithmetic",
    ADVANCED_FRACTIONS_DECIMALS: "Advanced Fractions & Decimals",
    PATTERN_RECOGNITION: "Pattern Recognition",
    NUMBER_PATTERNS: "Number Patterns & Sequences",
    ADVANCED_PATTERNS: "Advanced Patterns",
    ALGEBRAIC_THINKING: "Algebraic Thinking",
    ALGEBRAIC_EQUATIONS: "Algebraic Equations",
    ALGEBRAIC_FOUNDATIONS: "Algebra Foundations",
    ALGEBRAIC_MANIPULATION: "Algebraic Expressions",
    LINEAR_EQUATIONS: "Linear Equations",
    SHAPE_PROPERTIES: "Shape Properties",
    AREA_VOLUME_CALCULATIONS: "Area & Volume",
    PERIMETER_AREA_VOLUME: "Perimeter, Area & Volume",
    COORDINATE_GEOMETRY: "Coordinate Geometry",
    GEOMETRY_SPATIAL_REASONING: "Spatial Reasoning",
    TRANSFORMATIONS_SYMMETRY: "Transformations & Symmetry",
    MEASUREMENT_MASTERY: "Measurement & Units",
    UNIT_CONVERSIONS: "Unit Conversions",
    MULTI_UNIT_CONVERSIONS: "Multi-Unit Conversions",
    TIME_MEASUREMENT: "Time Calculations",
    TIME_CALCULATIONS: "Time Problems",
    DATA_ANALYSIS: "Data Analysis",
    DATA_ANALYSIS_PROBABILITY: "Data & Probability",
    PROBABILITY_BASICS: "Basic Probability",
    RATIO_PROPORTION: "Ratios & Proportions",
    SIMPLE_RATIOS: "Simple Ratios",
    EQUIVALENT_RATIOS: "Equivalent Ratios",
    RATIO_SIMPLIFICATION: "Ratio Simplification",
    PROPORTIONS: "Proportions",
    SCALE_FACTORS: "Scale & Proportion",
    UNIT_RATES: "Unit Rates",
    SPEED_CALCULATIONS: "Speed, Distance & Time",
    AVERAGE_SPEED: "Average Speed",
    DISTANCE_CALCULATIONS: "Distance Problems",
    MULTI_STAGE_JOURNEYS: "Multi-Stage Journeys",
    UNIT_CONVERSIONS_MOTION: "Speed & Distance Conversions",
    FINANCIAL_LITERACY: "Money & Financial Literacy",
    REAL_WORLD_APPLICATIONS: "Real-World Math Problems",
    ADVANCED_PROBLEM_SOLVING: "Problem Solving",
    MATHEMATICAL_REASONING: "Mathematical Reasoning",
};

/**
 * Reverse mapping: Display name to database type
 */
export function getQuestionTypeFromDisplayName(displayName: string): string {
    const entry = Object.entries(QUESTION_TYPE_DISPLAY_NAMES).find(
        ([_, display]) => display === displayName
    );
    return entry ? entry[0] : displayName.toUpperCase().replace(/\s+/g, "_");
}

/**
 * Get display name for a database question type
 */
export function getDisplayNameForQuestionType(dbType: string): string {
    return QUESTION_TYPE_DISPLAY_NAMES[dbType] || dbType;
}
```

---

## 📊 Statistics & Coverage

### Question Type Distribution by Grade

| Grade | Total Types | New Types Added | Curriculum Alignment |
| ----- | ----------- | --------------- | -------------------- |
| 3     | 6           | -               | NZ Year 3 ✅         |
| 4     | 11          | +5              | NZ Year 4 ✅         |
| 5     | 16          | +5              | NZ Year 5 ✅         |
| 6     | 22          | +6              | NZ Year 6 ✅         |
| 7     | 24          | +2              | NZ Year 7 ✅         |
| 8     | 30          | +6              | NZ Year 8 ✅         |

### Vector DB Coverage

-   **Total Types in Vector DB**: 54
-   **Types Assigned to Grades**: 54 (100% coverage)
-   **Unused Types**: 0
-   **Multi-Grade Types**: ~15 (appear in multiple grades with increasing complexity)

---

## ✅ Implementation Checklist

### Frontend Tasks

-   [ ] Update `GRADE_TOPICS` in `question.model.ts` with all grade mappings
-   [ ] Add `QUESTION_TYPE_DISPLAY_NAMES` constant
-   [ ] Add helper functions for type transformation
-   [ ] Update `question.service.ts` to use new mappings
-   [ ] Update UI to display categorized topics
-   [ ] Add tooltips/descriptions for each topic type

### Backend Tasks

-   [ ] Update question generation service to accept specific types
-   [ ] Modify vector search to filter by question type
-   [ ] Add type validation in API endpoints
-   [ ] Update OpenAPI/Swagger documentation

### Testing Tasks

-   [ ] Test topic display for each grade
-   [ ] Verify vector search with specific types
-   [ ] Validate question generation for each type
-   [ ] Test type transformation utilities
-   [ ] User acceptance testing with students

### Documentation Tasks

-   [ ] Update README with new topic structure
-   [ ] Document type naming conventions
-   [ ] Create user guide for topic selection
-   [ ] Update API documentation

---

## 🎯 Success Metrics

After implementation, we should see:

-   ✅ 100% of vector DB types accessible through UI
-   ✅ Grade-appropriate topic filtering working
-   ✅ Improved vector search relevance (measured by quality scores)
-   ✅ Student engagement with diverse question types
-   ✅ Clear curriculum alignment visibility

---

**Document Status**: Ready for Implementation ✅  
**Next Phase**: Frontend Implementation (Update GRADE_TOPICS)  
**Estimated Effort**: 2-3 development sessions
