# Mathematics Question Types: Categorized Taxonomy by Grade

**Document Type**: Educational Taxonomy & Implementation Guide  
**Date**: 2025-10-08  
**Status**: Approved for Implementation  
**Related Work Item**: `feature/proper-question-types-for-math`

---

## 📋 Executive Summary

This document defines a comprehensive, categorized taxonomy of mathematics question types organized by educational domains. Each category includes:

-   Pedagogical purpose and learning objectives
-   Skills students will develop
-   Grade-appropriate progression
-   Database type mappings for implementation

---

## 🎓 Category Definitions

### Category 1: Number Operations & Arithmetic

**What is this category about?**  
This category focuses on fundamental computational skills with numbers, including whole numbers, fractions, decimals, and integers. It forms the foundation of mathematical literacy and numerical fluency.

**Skills students will improve:**

-   Computational accuracy and speed
-   Number sense and magnitude understanding
-   Mental math strategies
-   Place value comprehension
-   Fraction/decimal/percentage conversions
-   Working with negative numbers
-   Understanding number properties (prime, composite)

**Question Types in this Category:**

| Database Type                 | Display Name                      | Grades | Description                                                 |
| ----------------------------- | --------------------------------- | ------ | ----------------------------------------------------------- |
| `ADDITION`                    | Addition                          | 3-4    | Basic and multi-digit addition with regrouping              |
| `SUBTRACTION`                 | Subtraction                       | 3-4    | Basic and multi-digit subtraction with regrouping           |
| `MULTIPLICATION`              | Multiplication                    | 3-5    | Times tables, algorithms, multi-digit multiplication        |
| `DIVISION`                    | Division                          | 3-5    | Division facts, remainders, long division                   |
| `DECIMAL_BASICS`              | Decimals (Basic)                  | 4      | Introduction to decimal notation and concepts               |
| `DECIMAL_OPERATIONS`          | Decimal Operations                | 5      | Adding, subtracting, multiplying, dividing decimals         |
| `FRACTION_BASICS`             | Fractions (Basic)                 | 4      | Understanding fractions, equivalence, comparison            |
| `FRACTION_OPERATIONS`         | Fraction Operations               | 5      | Adding, subtracting fractions with like/unlike denominators |
| `FRACTION_DECIMAL_PERCENTAGE` | Fractions, Decimals & Percentages | 6-8    | Converting between forms, operations with all three         |
| `PLACE_VALUE`                 | Place Value                       | 4      | Understanding digit positions and value                     |
| `LARGE_NUMBER_OPERATIONS`     | Large Number Calculations         | 6, 8   | Operations with numbers in thousands/millions               |
| `NEGATIVE_NUMBERS`            | Negative Numbers                  | 7-8    | Integer operations, number line, real-world contexts        |
| `PRIME_COMPOSITE_NUMBERS`     | Prime & Composite Numbers         | 8      | Number theory, factors, primes, composites, powers          |
| `ADVANCED_ARITHMETIC`         | Advanced Arithmetic               | 5-7    | Multi-step calculations, order of operations                |
| `ADVANCED_FRACTIONS_DECIMALS` | Advanced Fractions & Decimals     | 6-8    | Complex operations, problem solving with rational numbers   |

**Total Types**: 15  
**Grade Range**: 3-8  
**Curriculum Alignment**: NZ Curriculum - Number and Algebra (Strand 1)

---

### Category 2: Algebra & Patterns

**What is this category about?**  
This category develops algebraic thinking, pattern recognition, and abstract reasoning. Students learn to generalize mathematical relationships, work with variables, and solve equations.

**Skills students will improve:**

-   Pattern recognition and prediction
-   Abstract and symbolic thinking
-   Equation solving techniques
-   Variable manipulation
-   Understanding mathematical relationships
-   Generalizing from specific cases
-   Developing algebraic proof strategies

**Question Types in this Category:**

| Database Type            | Display Name                | Grades | Description                                            |
| ------------------------ | --------------------------- | ------ | ------------------------------------------------------ |
| `PATTERN_RECOGNITION`    | Pattern Recognition         | 3-5    | Identifying and extending number and shape patterns    |
| `NUMBER_PATTERNS`        | Number Patterns & Sequences | 6-8    | Arithmetic/geometric sequences, sequence rules         |
| `ADVANCED_PATTERNS`      | Advanced Patterns           | 6-7    | Complex patterns, multi-step sequences                 |
| `ALGEBRAIC_THINKING`     | Algebraic Thinking          | 5-6    | Pre-algebra concepts, function machines, variables     |
| `ALGEBRAIC_EQUATIONS`    | Algebraic Equations         | 6-8    | Solving simple and complex equations                   |
| `ALGEBRAIC_FOUNDATIONS`  | Algebra Foundations         | 7-8    | Algebraic expressions, substitution                    |
| `ALGEBRAIC_MANIPULATION` | Algebraic Expressions       | 8      | Expanding, factoring, simplifying expressions          |
| `LINEAR_EQUATIONS`       | Linear Equations            | 8      | Solving linear equations, word problems with variables |

**Total Types**: 8  
**Grade Range**: 3-8  
**Curriculum Alignment**: NZ Curriculum - Number and Algebra (Strand 1 - Patterns & Relationships)

---

### Category 3: Geometry & Measurement

**What is this category about?**  
This category covers spatial reasoning, shapes, measurements, coordinates, and geometric transformations. Students learn to visualize, measure, and manipulate geometric objects in 2D and 3D space.

**Skills students will improve:**

-   Spatial visualization and reasoning
-   Measurement accuracy and estimation
-   Understanding geometric properties
-   Coordinate system navigation
-   Shape transformation (rotation, reflection, translation)
-   Unit conversion proficiency
-   Time and calendar calculations
-   Real-world measurement applications

**Question Types in this Category:**

| Database Type                | Display Name               | Grades | Description                                    |
| ---------------------------- | -------------------------- | ------ | ---------------------------------------------- |
| `SHAPE_PROPERTIES`           | Shape Properties           | 3-6    | 2D/3D shapes, faces, edges, vertices, angles   |
| `AREA_VOLUME_CALCULATIONS`   | Area & Volume              | 5-6    | Calculating area and volume of standard shapes |
| `PERIMETER_AREA_VOLUME`      | Perimeter, Area & Volume   | 6-8    | Comprehensive measurement of 2D/3D shapes      |
| `COORDINATE_GEOMETRY`        | Coordinate Geometry        | 5-8    | Plotting points, coordinates, Cartesian plane  |
| `GEOMETRY_SPATIAL_REASONING` | Spatial Reasoning          | 7-8    | 3D visualization, nets, cross-sections         |
| `TRANSFORMATIONS_SYMMETRY`   | Transformations & Symmetry | 6-8    | Translations, rotations, reflections, symmetry |
| `MEASUREMENT_MASTERY`        | Measurement & Units        | 4-6    | Length, mass, volume, temperature measurements |
| `UNIT_CONVERSIONS`           | Unit Conversions           | 6-8    | Converting metric and time units               |
| `MULTI_UNIT_CONVERSIONS`     | Multi-Unit Conversions     | 7-8    | Complex conversions across multiple units      |
| `TIME_MEASUREMENT`           | Time Calculations          | 4      | Reading clocks, elapsed time, AM/PM            |
| `TIME_CALCULATIONS`          | Time Problems              | 5-8    | Time word problems, schedules, duration        |

**Total Types**: 11  
**Grade Range**: 3-8  
**Curriculum Alignment**: NZ Curriculum - Measurement and Geometry (Strand 2)

---

### Category 4: Statistics & Probability

**What is this category about?**  
This category introduces data handling, statistical analysis, and probability concepts. Students learn to collect, organize, analyze, and interpret data, as well as understand chance and likelihood.

**Skills students will improve:**

-   Data collection and organization
-   Graph and chart interpretation
-   Statistical measure calculation (mean, median, mode, range)
-   Probability reasoning and calculation
-   Critical analysis of data
-   Making predictions based on data
-   Understanding experimental vs theoretical probability
-   Real-world data application

**Question Types in this Category:**

| Database Type               | Display Name       | Grades | Description                                             |
| --------------------------- | ------------------ | ------ | ------------------------------------------------------- |
| `DATA_ANALYSIS`             | Data Analysis      | 5-8    | Mean, median, mode, range, interpreting graphs/charts   |
| `DATA_ANALYSIS_PROBABILITY` | Data & Probability | 7-8    | Combined statistical analysis and probability           |
| `PROBABILITY_BASICS`        | Basic Probability  | 5-7    | Simple probability, fractions, experimental probability |

**Total Types**: 3  
**Grade Range**: 5-8  
**Curriculum Alignment**: NZ Curriculum - Statistics and Probability (Strand 3)

---

### Category 5: Ratios, Rates & Proportions

**What is this category about?**  
This category focuses on proportional relationships, ratios, rates, and scaling. Students learn to compare quantities, understand equivalent relationships, and apply proportional reasoning to real-world scenarios.

**Skills students will improve:**

-   Proportional reasoning
-   Ratio comparison and simplification
-   Rate calculations (speed, unit rates)
-   Scale factor applications
-   Equivalent ratio identification
-   Real-world proportion problems
-   Cross-multiplication techniques
-   Understanding direct relationships

**Question Types in this Category:**

| Database Type          | Display Name         | Grades | Description                                         |
| ---------------------- | -------------------- | ------ | --------------------------------------------------- |
| `RATIO_PROPORTION`     | Ratios & Proportions | 5-8    | Understanding and solving ratio/proportion problems |
| `SIMPLE_RATIOS`        | Simple Ratios        | 6      | Basic ratio concepts, part-to-part, part-to-whole   |
| `EQUIVALENT_RATIOS`    | Equivalent Ratios    | 7      | Finding equivalent ratios, scaling up/down          |
| `RATIO_SIMPLIFICATION` | Ratio Simplification | 8      | Simplifying ratios to lowest terms                  |
| `PROPORTIONS`          | Proportions          | 6      | Solving proportion equations                        |
| `SCALE_FACTORS`        | Scale & Proportion   | 8      | Map scales, model scales, enlargement/reduction     |
| `UNIT_RATES`           | Unit Rates           | 7      | Calculating unit rates (price per item, speed)      |

**Total Types**: 7  
**Grade Range**: 5-8  
**Curriculum Alignment**: NZ Curriculum - Number and Algebra (Strand 1 - Ratios & Proportions)

---

### Category 6: Motion & Distance

**What is this category about?**  
This specialized category deals with problems involving speed, distance, time, and motion. Students apply mathematical reasoning to real-world travel and movement scenarios.

**Skills students will improve:**

-   Speed-distance-time relationship understanding
-   Formula application (speed = distance/time)
-   Unit conversion for motion problems
-   Average speed calculations
-   Multi-stage journey planning
-   Graph interpretation for motion
-   Real-world transportation problem solving
-   Time management and scheduling

**Question Types in this Category:**

| Database Type             | Display Name                 | Grades | Description                                            |
| ------------------------- | ---------------------------- | ------ | ------------------------------------------------------ |
| `SPEED_CALCULATIONS`      | Speed, Distance & Time       | 7-8    | Calculating speed, distance, or time given two values  |
| `AVERAGE_SPEED`           | Average Speed                | 8      | Finding average speed over multiple segments           |
| `DISTANCE_CALCULATIONS`   | Distance Problems            | 8      | Complex distance calculations, meeting problems        |
| `MULTI_STAGE_JOURNEYS`    | Multi-Stage Journeys         | 8      | Journey problems with multiple legs/modes of transport |
| `UNIT_CONVERSIONS_MOTION` | Speed & Distance Conversions | 8      | Converting km/h to m/s, miles to km, etc.              |

**Total Types**: 5  
**Grade Range**: 7-8  
**Curriculum Alignment**: NZ Curriculum - Measurement (Strand 2 - Applied Problems)

---

### Category 7: Financial Literacy

**What is this category about?**  
This category teaches practical money management, budgeting, and financial decision-making skills. Students learn to apply mathematics to real-world financial situations they'll encounter in daily life.

**Skills students will improve:**

-   Money calculation and budgeting
-   Interest calculation (simple interest)
-   Percentage applications (discounts, tax, tips)
-   Financial planning and decision-making
-   Cost comparison and best value analysis
-   Savings and investment basics
-   Understanding financial terminology
-   Critical consumer mathematics

**Question Types in this Category:**

| Database Type        | Display Name               | Grades | Description                                               |
| -------------------- | -------------------------- | ------ | --------------------------------------------------------- |
| `FINANCIAL_LITERACY` | Money & Financial Literacy | 8      | Budgets, savings, interest, discounts, financial planning |

**Total Types**: 1  
**Grade Range**: 8  
**Curriculum Alignment**: NZ Curriculum - Number and Algebra (Strand 1 - Financial Literacy) - Year 8 Specific

**Note**: This is a specialized Grade 8 topic emphasizing real-world financial applications as per NZ Ministry of Education guidelines.

---

### Category 8: Problem Solving & Reasoning

**What is this category about?**  
This category encompasses multi-step problems, mathematical reasoning, and real-world applications that don't fit neatly into other categories. It develops critical thinking and integrates multiple mathematical concepts.

**Skills students will improve:**

-   Multi-step problem solving strategies
-   Logical reasoning and deduction
-   Mathematical communication
-   Integration of multiple concepts
-   Real-world application of mathematics
-   Critical thinking and analysis
-   Problem decomposition
-   Solution verification

**Question Types in this Category:**

| Database Type              | Display Name             | Grades | Description                                       |
| -------------------------- | ------------------------ | ------ | ------------------------------------------------- |
| `REAL_WORLD_APPLICATIONS`  | Real-World Math Problems | 5-6    | Practical problems requiring multiple concepts    |
| `ADVANCED_PROBLEM_SOLVING` | Problem Solving          | 6-8    | Complex, multi-step mathematical challenges       |
| `MATHEMATICAL_REASONING`   | Mathematical Reasoning   | 6-8    | Logic, proof concepts, mathematical argumentation |

**Total Types**: 3  
**Grade Range**: 5-8  
**Curriculum Alignment**: NZ Curriculum - All Strands (Cross-Curricular Problem Solving)

---

## 📊 Category Summary Table

| Category                           | Total Types | Grade Range | Primary Curriculum Strand  | Focus                        |
| ---------------------------------- | ----------- | ----------- | -------------------------- | ---------------------------- |
| **Number Operations & Arithmetic** | 15          | 3-8         | Number and Algebra         | Computational fluency        |
| **Algebra & Patterns**             | 8           | 3-8         | Number and Algebra         | Abstract reasoning           |
| **Geometry & Measurement**         | 11          | 3-8         | Measurement and Geometry   | Spatial & measurement skills |
| **Statistics & Probability**       | 3           | 5-8         | Statistics and Probability | Data literacy                |
| **Ratios, Rates & Proportions**    | 7           | 5-8         | Number and Algebra         | Proportional thinking        |
| **Motion & Distance**              | 5           | 7-8         | Measurement                | Applied motion problems      |
| **Financial Literacy**             | 1           | 8           | Number and Algebra         | Money management             |
| **Problem Solving & Reasoning**    | 3           | 5-8         | Cross-Curricular           | Critical thinking            |

**Total Question Types**: 53 (54 with one duplicate mapping)  
**Total Categories**: 8  
**Complete Grade Coverage**: 3-8 (6 grades)

---

## 🎯 Grade-Specific Category Distribution

### Grade 3 (Foundation Stage) - 6 Topics

**Categories Available**: 2

-   **Number Operations** (4 types): Addition, Subtraction, Multiplication, Division
-   **Algebra & Patterns** (1 type): Pattern Recognition
-   **Geometry & Measurement** (1 type): Shape Properties

**Focus**: Basic operations and pattern foundations

---

### Grade 4 (Consolidation Stage) - 11 Topics

**Categories Available**: 3

-   **Number Operations** (7 types): Addition, Subtraction, Multiplication, Division, Decimals (Basic), Fractions (Basic), Place Value
-   **Algebra & Patterns** (1 type): Pattern Recognition
-   **Geometry & Measurement** (3 types): Shape Properties, Time Calculations, Measurement & Units

**Focus**: Expanding operations and introducing fractions/decimals

---

### Grade 5 (Expansion Stage) - 16 Topics

**Categories Available**: 6

-   **Number Operations** (4 types): Multiplication, Division, Advanced Arithmetic, Decimal Operations, Fraction Operations
-   **Algebra & Patterns** (2 types): Algebraic Thinking, Pattern Recognition
-   **Geometry & Measurement** (5 types): Area & Volume, Coordinate Geometry, Measurement & Units, Time Problems, Shape Properties
-   **Statistics & Probability** (2 types): Data Analysis, Basic Probability
-   **Ratios, Rates & Proportions** (1 type): Ratios & Proportions
-   **Problem Solving & Reasoning** (1 type): Real-World Math Problems

**Focus**: Intermediate concepts across multiple domains

---

### Grade 6 (Advanced Operations Stage) - 22 Topics

**Categories Available**: 7

-   **Number Operations** (4 types): Large Number Calculations, Advanced Fractions & Decimals, Fractions/Decimals/Percentages, Advanced Arithmetic
-   **Algebra & Patterns** (4 types): Algebraic Equations, Algebraic Thinking, Advanced Patterns, Number Patterns & Sequences
-   **Geometry & Measurement** (7 types): Perimeter/Area/Volume, Coordinate Geometry, Transformations & Symmetry, Measurement & Units, Unit Conversions, Time Problems, Shape Properties
-   **Statistics & Probability** (2 types): Data Analysis, Basic Probability
-   **Ratios, Rates & Proportions** (3 types): Ratios & Proportions, Simple Ratios, Proportions
-   **Problem Solving & Reasoning** (2 types): Problem Solving, Mathematical Reasoning, Real-World Math Problems

**Focus**: Complex operations and algebra introduction

---

### Grade 7 (Pre-Secondary Stage) - 24 Topics

**Categories Available**: 7

-   **Number Operations** (4 types): Advanced Arithmetic, Negative Numbers, Fractions/Decimals/Percentages, Advanced Fractions & Decimals
-   **Algebra & Patterns** (4 types): Algebra Foundations, Algebraic Equations, Number Patterns & Sequences, Advanced Patterns
-   **Geometry & Measurement** (7 types): Perimeter/Area/Volume, Spatial Reasoning, Coordinate Geometry, Transformations & Symmetry, Multi-Unit Conversions, Unit Conversions
-   **Statistics & Probability** (3 types): Data & Probability, Data Analysis, Basic Probability
-   **Ratios, Rates & Proportions** (3 types): Ratios & Proportions, Equivalent Ratios, Unit Rates
-   **Motion & Distance** (1 type): Speed, Distance & Time
-   **Problem Solving & Reasoning** (2 types): Problem Solving, Mathematical Reasoning, Real-World Math Problems

**Focus**: Pre-algebra and statistical reasoning

---

### Grade 8 (Secondary Preparation Stage) - 30 Topics

**Categories Available**: 8 (All Categories)

-   **Number Operations** (6 types): Prime & Composite Numbers, Negative Numbers, Large Numbers, Fractions/Decimals/Percentages, Advanced Fractions & Decimals
-   **Algebra & Patterns** (5 types): Number Patterns & Sequences, Linear Equations, Algebraic Expressions, Algebra Foundations, Algebraic Equations
-   **Geometry & Measurement** (8 types): Perimeter/Area/Volume, Coordinate Geometry, Spatial Reasoning, Transformations & Symmetry, Multi-Unit Conversions, Unit Conversions, Time Problems
-   **Statistics & Probability** (2 types): Data & Probability, Data Analysis
-   **Ratios, Rates & Proportions** (3 types): Ratios & Proportions, Ratio Simplification, Scale & Proportion
-   **Motion & Distance** (5 types): Speed/Distance/Time, Average Speed, Distance Problems, Multi-Stage Journeys, Speed & Distance Conversions
-   **Financial Literacy** (1 type): Money & Financial Literacy
-   **Problem Solving & Reasoning** (2 types): Problem Solving, Mathematical Reasoning

**Focus**: Comprehensive secondary readiness across all domains

---

## 💻 Implementation: TypeScript Configuration

### Complete Type Mappings

```typescript
/**
 * Maps database question type to user-friendly display name
 */
export const QUESTION_TYPE_DISPLAY_NAMES: Record<string, string> = {
    // Number Operations & Arithmetic
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

    // Algebra & Patterns
    PATTERN_RECOGNITION: "Pattern Recognition",
    NUMBER_PATTERNS: "Number Patterns & Sequences",
    ADVANCED_PATTERNS: "Advanced Patterns",
    ALGEBRAIC_THINKING: "Algebraic Thinking",
    ALGEBRAIC_EQUATIONS: "Algebraic Equations",
    ALGEBRAIC_FOUNDATIONS: "Algebra Foundations",
    ALGEBRAIC_MANIPULATION: "Algebraic Expressions",
    LINEAR_EQUATIONS: "Linear Equations",

    // Geometry & Measurement
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

    // Statistics & Probability
    DATA_ANALYSIS: "Data Analysis",
    DATA_ANALYSIS_PROBABILITY: "Data & Probability",
    PROBABILITY_BASICS: "Basic Probability",

    // Ratios, Rates & Proportions
    RATIO_PROPORTION: "Ratios & Proportions",
    SIMPLE_RATIOS: "Simple Ratios",
    EQUIVALENT_RATIOS: "Equivalent Ratios",
    RATIO_SIMPLIFICATION: "Ratio Simplification",
    PROPORTIONS: "Proportions",
    SCALE_FACTORS: "Scale & Proportion",
    UNIT_RATES: "Unit Rates",

    // Motion & Distance
    SPEED_CALCULATIONS: "Speed, Distance & Time",
    AVERAGE_SPEED: "Average Speed",
    DISTANCE_CALCULATIONS: "Distance Problems",
    MULTI_STAGE_JOURNEYS: "Multi-Stage Journeys",
    UNIT_CONVERSIONS_MOTION: "Speed & Distance Conversions",

    // Financial Literacy
    FINANCIAL_LITERACY: "Money & Financial Literacy",

    // Problem Solving & Reasoning
    REAL_WORLD_APPLICATIONS: "Real-World Math Problems",
    ADVANCED_PROBLEM_SOLVING: "Problem Solving",
    MATHEMATICAL_REASONING: "Mathematical Reasoning",
};

/**
 * Category metadata with descriptions
 */
export interface CategoryInfo {
    name: string;
    description: string;
    skillsFocus: string[];
    icon: string;
    curriculumStrand: string;
}

export const QUESTION_CATEGORIES: Record<string, CategoryInfo> = {
    "number-operations": {
        name: "Number Operations & Arithmetic",
        description:
            "Fundamental computational skills with whole numbers, fractions, decimals, and integers.",
        skillsFocus: [
            "Computational accuracy and speed",
            "Number sense and magnitude understanding",
            "Fraction/decimal/percentage conversions",
            "Working with negative numbers",
        ],
        icon: "🔢",
        curriculumStrand: "Number and Algebra",
    },
    "algebra-patterns": {
        name: "Algebra & Patterns",
        description:
            "Algebraic thinking, pattern recognition, and abstract reasoning with variables and equations.",
        skillsFocus: [
            "Pattern recognition and prediction",
            "Abstract and symbolic thinking",
            "Equation solving techniques",
            "Variable manipulation",
        ],
        icon: "🧮",
        curriculumStrand: "Number and Algebra",
    },
    "geometry-measurement": {
        name: "Geometry & Measurement",
        description:
            "Spatial reasoning, shapes, measurements, coordinates, and geometric transformations.",
        skillsFocus: [
            "Spatial visualization and reasoning",
            "Measurement accuracy and estimation",
            "Coordinate system navigation",
            "Unit conversion proficiency",
        ],
        icon: "📐",
        curriculumStrand: "Measurement and Geometry",
    },
    "statistics-probability": {
        name: "Statistics & Probability",
        description:
            "Data handling, statistical analysis, and probability concepts for understanding chance and data.",
        skillsFocus: [
            "Data collection and organization",
            "Statistical measure calculation",
            "Probability reasoning",
            "Critical analysis of data",
        ],
        icon: "📊",
        curriculumStrand: "Statistics and Probability",
    },
    "ratios-rates-proportions": {
        name: "Ratios, Rates & Proportions",
        description:
            "Proportional relationships, ratios, rates, and scaling for comparing quantities.",
        skillsFocus: [
            "Proportional reasoning",
            "Ratio comparison and simplification",
            "Rate calculations",
            "Scale factor applications",
        ],
        icon: "⚖️",
        curriculumStrand: "Number and Algebra",
    },
    "motion-distance": {
        name: "Motion & Distance",
        description:
            "Speed, distance, time problems applying mathematics to real-world travel scenarios.",
        skillsFocus: [
            "Speed-distance-time relationships",
            "Formula application",
            "Multi-stage journey planning",
            "Unit conversion for motion",
        ],
        icon: "🚀",
        curriculumStrand: "Measurement",
    },
    "financial-literacy": {
        name: "Financial Literacy",
        description:
            "Practical money management, budgeting, and financial decision-making skills.",
        skillsFocus: [
            "Money calculation and budgeting",
            "Interest calculation",
            "Financial planning",
            "Cost comparison analysis",
        ],
        icon: "💰",
        curriculumStrand: "Number and Algebra",
    },
    "problem-solving-reasoning": {
        name: "Problem Solving & Reasoning",
        description:
            "Multi-step problems and mathematical reasoning integrating multiple concepts.",
        skillsFocus: [
            "Multi-step problem solving",
            "Logical reasoning and deduction",
            "Integration of multiple concepts",
            "Solution verification",
        ],
        icon: "🧠",
        curriculumStrand: "All Strands (Cross-Curricular)",
    },
};

/**
 * Maps question types to their categories
 */
export const QUESTION_TYPE_TO_CATEGORY: Record<string, string> = {
    // Number Operations & Arithmetic
    ADDITION: "number-operations",
    SUBTRACTION: "number-operations",
    MULTIPLICATION: "number-operations",
    DIVISION: "number-operations",
    DECIMAL_BASICS: "number-operations",
    DECIMAL_OPERATIONS: "number-operations",
    FRACTION_BASICS: "number-operations",
    FRACTION_OPERATIONS: "number-operations",
    FRACTION_DECIMAL_PERCENTAGE: "number-operations",
    PLACE_VALUE: "number-operations",
    LARGE_NUMBER_OPERATIONS: "number-operations",
    NEGATIVE_NUMBERS: "number-operations",
    PRIME_COMPOSITE_NUMBERS: "number-operations",
    ADVANCED_ARITHMETIC: "number-operations",
    ADVANCED_FRACTIONS_DECIMALS: "number-operations",

    // Algebra & Patterns
    PATTERN_RECOGNITION: "algebra-patterns",
    NUMBER_PATTERNS: "algebra-patterns",
    ADVANCED_PATTERNS: "algebra-patterns",
    ALGEBRAIC_THINKING: "algebra-patterns",
    ALGEBRAIC_EQUATIONS: "algebra-patterns",
    ALGEBRAIC_FOUNDATIONS: "algebra-patterns",
    ALGEBRAIC_MANIPULATION: "algebra-patterns",
    LINEAR_EQUATIONS: "algebra-patterns",

    // Geometry & Measurement
    SHAPE_PROPERTIES: "geometry-measurement",
    AREA_VOLUME_CALCULATIONS: "geometry-measurement",
    PERIMETER_AREA_VOLUME: "geometry-measurement",
    COORDINATE_GEOMETRY: "geometry-measurement",
    GEOMETRY_SPATIAL_REASONING: "geometry-measurement",
    TRANSFORMATIONS_SYMMETRY: "geometry-measurement",
    MEASUREMENT_MASTERY: "geometry-measurement",
    UNIT_CONVERSIONS: "geometry-measurement",
    MULTI_UNIT_CONVERSIONS: "geometry-measurement",
    TIME_MEASUREMENT: "geometry-measurement",
    TIME_CALCULATIONS: "geometry-measurement",

    // Statistics & Probability
    DATA_ANALYSIS: "statistics-probability",
    DATA_ANALYSIS_PROBABILITY: "statistics-probability",
    PROBABILITY_BASICS: "statistics-probability",

    // Ratios, Rates & Proportions
    RATIO_PROPORTION: "ratios-rates-proportions",
    SIMPLE_RATIOS: "ratios-rates-proportions",
    EQUIVALENT_RATIOS: "ratios-rates-proportions",
    RATIO_SIMPLIFICATION: "ratios-rates-proportions",
    PROPORTIONS: "ratios-rates-proportions",
    SCALE_FACTORS: "ratios-rates-proportions",
    UNIT_RATES: "ratios-rates-proportions",

    // Motion & Distance
    SPEED_CALCULATIONS: "motion-distance",
    AVERAGE_SPEED: "motion-distance",
    DISTANCE_CALCULATIONS: "motion-distance",
    MULTI_STAGE_JOURNEYS: "motion-distance",
    UNIT_CONVERSIONS_MOTION: "motion-distance",

    // Financial Literacy
    FINANCIAL_LITERACY: "financial-literacy",

    // Problem Solving & Reasoning
    REAL_WORLD_APPLICATIONS: "problem-solving-reasoning",
    ADVANCED_PROBLEM_SOLVING: "problem-solving-reasoning",
    MATHEMATICAL_REASONING: "problem-solving-reasoning",
};

/**
 * Get category for a question type
 */
export function getCategoryForQuestionType(dbType: string): string {
    return QUESTION_TYPE_TO_CATEGORY[dbType] || "problem-solving-reasoning";
}

/**
 * Get category info
 */
export function getCategoryInfo(categoryKey: string): CategoryInfo | null {
    return QUESTION_CATEGORIES[categoryKey] || null;
}

/**
 * Get all question types in a category
 */
export function getQuestionTypesInCategory(categoryKey: string): string[] {
    return Object.entries(QUESTION_TYPE_TO_CATEGORY)
        .filter(([_, cat]) => cat === categoryKey)
        .map(([type, _]) => type);
}

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

## 📚 Complete GRADE_TOPICS Configuration

```typescript
/**
 * Grade-specific topics organized by subject and category
 */
export const GRADE_TOPICS: GradeTopics = {
    3: {
        mathematics: [
            "Addition",
            "Subtraction",
            "Multiplication",
            "Division",
            "Pattern Recognition",
            "Shape Properties",
        ],
    },
    4: {
        mathematics: [
            "Addition",
            "Subtraction",
            "Multiplication",
            "Division",
            "Decimals (Basic)",
            "Fractions (Basic)",
            "Place Value",
            "Pattern Recognition",
            "Shape Properties",
            "Time Calculations",
            "Measurement & Units",
        ],
    },
    5: {
        mathematics: [
            "Multiplication",
            "Division",
            "Advanced Arithmetic",
            "Decimal Operations",
            "Fraction Operations",
            "Ratios & Proportions",
            "Algebraic Thinking",
            "Pattern Recognition",
            "Area & Volume",
            "Coordinate Geometry",
            "Measurement & Units",
            "Time Problems",
            "Data Analysis",
            "Basic Probability",
            "Shape Properties",
            "Real-World Math Problems",
        ],
    },
    6: {
        mathematics: [
            "Large Number Calculations",
            "Advanced Fractions & Decimals",
            "Fractions, Decimals & Percentages",
            "Algebraic Equations",
            "Algebraic Thinking",
            "Advanced Patterns",
            "Number Patterns & Sequences",
            "Perimeter, Area & Volume",
            "Coordinate Geometry",
            "Transformations & Symmetry",
            "Measurement & Units",
            "Unit Conversions",
            "Data Analysis",
            "Basic Probability",
            "Ratios & Proportions",
            "Simple Ratios",
            "Proportions",
            "Problem Solving",
            "Mathematical Reasoning",
            "Real-World Math Problems",
            "Time Problems",
            "Shape Properties",
        ],
    },
    7: {
        mathematics: [
            "Advanced Arithmetic",
            "Negative Numbers",
            "Fractions, Decimals & Percentages",
            "Advanced Fractions & Decimals",
            "Algebra Foundations",
            "Algebraic Equations",
            "Number Patterns & Sequences",
            "Advanced Patterns",
            "Perimeter, Area & Volume",
            "Spatial Reasoning",
            "Coordinate Geometry",
            "Transformations & Symmetry",
            "Multi-Unit Conversions",
            "Unit Conversions",
            "Data & Probability",
            "Data Analysis",
            "Basic Probability",
            "Ratios & Proportions",
            "Equivalent Ratios",
            "Unit Rates",
            "Speed, Distance & Time",
            "Problem Solving",
            "Mathematical Reasoning",
            "Real-World Math Problems",
        ],
    },
    8: {
        mathematics: [
            "Prime & Composite Numbers",
            "Negative Numbers",
            "Large Number Calculations",
            "Fractions, Decimals & Percentages",
            "Advanced Fractions & Decimals",
            "Money & Financial Literacy",
            "Number Patterns & Sequences",
            "Linear Equations",
            "Algebraic Expressions",
            "Algebra Foundations",
            "Algebraic Equations",
            "Perimeter, Area & Volume",
            "Coordinate Geometry",
            "Spatial Reasoning",
            "Transformations & Symmetry",
            "Multi-Unit Conversions",
            "Unit Conversions",
            "Time Problems",
            "Speed, Distance & Time",
            "Average Speed",
            "Distance Problems",
            "Multi-Stage Journeys",
            "Speed & Distance Conversions",
            "Data & Probability",
            "Data Analysis",
            "Ratios & Proportions",
            "Ratio Simplification",
            "Scale & Proportion",
            "Problem Solving",
            "Mathematical Reasoning",
        ],
    },
};
```

---

## ✅ Implementation Checklist

### Frontend Tasks

-   [ ] Add category metadata to `question.model.ts`
-   [ ] Implement category grouping in UI
-   [ ] Add category icons and descriptions
-   [ ] Create category filter/tabs
-   [ ] Add tooltips with skills focus

### Backend Tasks

-   [ ] Support category-based filtering in API
-   [ ] Add category metadata to question responses
-   [ ] Update vector search to accept category filters

### Documentation Tasks

-   [ ] Update README with category explanations
-   [ ] Create user guide showing categories
-   [ ] Document category-based learning paths

---

**Document Status**: ✅ Complete with Categorization  
**Total Categories**: 8  
**Total Question Types**: 53  
**Implementation Ready**: Yes
