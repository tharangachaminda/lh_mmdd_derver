# Question Types Reference Guide

This document provides the standard question types for each grade level based on the New Zealand Mathematics Curriculum.

## Available Question Types

### Grade 3 Question Types

-   `ADDITION` - Basic addition with regrouping
-   `SUBTRACTION` - Basic subtraction with regrouping
-   `MULTIPLICATION` - Simple multiplication facts
-   `WHOLE_NUMBER_DIVISION` - Simple division
-   `FRACTION_BASICS` - Halves, quarters, eighths
-   `SHAPE_IDENTIFICATION` - 2D shapes and properties
-   `AREA_CALCULATION` - Simple area concepts
-   `PERIMETER_CALCULATION` - Simple perimeter
-   `TIME_CALCULATION` - Time to nearest minute
-   `MONEY_CALCULATION` - Money calculations
-   `PATTERN_RECOGNITION` - Number and shape patterns

### Grade 4 Question Types

-   `ADDITION` - Multi-digit addition
-   `SUBTRACTION` - Multi-digit subtraction
-   `MULTIPLICATION` - Multiplication facts and algorithms
-   `DIVISION` - Division with remainders
-   `FRACTION_ADDITION` - Adding simple fractions
-   `DECIMAL_BASICS` - Basic decimal concepts
-   `PLACE_VALUE` - Place value to 10,000
-   `MEASUREMENT_UNITS` - Converting units
-   `SHAPE_PROPERTIES` - 3D shapes and properties
-   `DATA_INTERPRETATION` - Reading charts and graphs

### Grade 5 Question Types

-   `MULTIPLICATION` - Multi-digit multiplication
-   `DIVISION` - Long division
-   `FRACTION_ADDITION` - Adding fractions with different denominators
-   `FRACTION_SUBTRACTION` - Subtracting fractions
-   `DECIMAL_ADDITION` - Adding decimals
-   `DECIMAL_SUBTRACTION` - Subtracting decimals
-   `RATIO_PROBLEMS` - Simple ratio problems
-   `AREA_CALCULATION` - Area of rectangles and triangles
-   `VOLUME_CALCULATION` - Volume of rectangular prisms
-   `ANGLE_MEASUREMENT` - Measuring and drawing angles
-   `COORDINATE_GEOMETRY` - Plotting points on coordinate plane
-   `DATA_ANALYSIS` - Analyzing data sets

### Grade 6 Question Types

-   `INTEGER_OPERATIONS` - Operations with positive and negative numbers
-   `ORDER_OF_OPERATIONS` - BODMAS/PEMDAS
-   `RATIO_PROBLEMS` - Ratios and rates
-   `PERCENTAGE_CALCULATION` - Percentage calculations
-   `AREA_CALCULATION` - Area of complex shapes
-   `VOLUME_CALCULATION` - Volume formulas
-   `TRANSFORMATIONS` - Translations, rotations, reflections
-   `PROBABILITY_BASIC` - Basic probability concepts
-   `ALGEBRAIC_THINKING` - Simple algebraic expressions
-   `COORDINATE_GEOMETRY` - Coordinate plane work

### Grade 7 Question Types

-   `FRACTION_OPERATIONS` - All fraction operations
-   `DECIMAL_OPERATIONS` - All decimal operations
-   `PERCENTAGE_PROBLEMS` - Complex percentage problems
-   `BASIC_ALGEBRA` - Solving simple equations
-   `RATES_AND_RATIOS` - Complex rate and ratio problems
-   `SURFACE_AREA` - Surface area calculations
-   `VOLUME_CALCULATION` - Volume of various shapes
-   `GEOMETRY_THEOREMS` - Basic geometry theorems
-   `STATISTICAL_ANALYSIS` - Statistical measures
-   `PROBABILITY_CALCULATION` - Probability calculations

### Grade 8 Question Types

-   `NUMBER_PATTERNS` - Identifying and extending patterns
-   `LINEAR_EQUATIONS` - Solving linear equations
-   `SCIENTIFIC_NOTATION` - Scientific notation operations
-   `PYTHAGORAS_THEOREM` - Pythagorean theorem applications
-   `BASIC_TRIGONOMETRY` - Introduction to trigonometry
-   `BIVARIATE_DATA` - Analyzing bivariate data
-   `ALGEBRAIC_MANIPULATION` - Algebraic expression manipulation
-   `COORDINATE_GEOMETRY` - Advanced coordinate geometry
-   `STATISTICAL_INFERENCE` - Making statistical inferences
-   `PROBABILITY_COMPOUND` - Compound probability

## Difficulty Levels

Each question should be assigned one of these difficulty levels:

-   `easy` - Basic application of concepts (40% of questions recommended)
-   `medium` - Standard application requiring some thinking (40% of questions recommended)
-   `hard` - Complex application or multi-step problems (20% of questions recommended)

## Question Structure Requirements

Each question must include:

1. **Unique ID**: Format `g{grade}-{type}-{difficulty}-{number}`
2. **Question Text**: Clear, mathematically appropriate question
3. **Answer**: Correct answer (string or number)
4. **Explanation**: Step-by-step solution explanation
5. **Metadata**: Type, difficulty, grade, curriculum alignment
6. **Keywords**: Relevant search keywords
7. **Content for Embedding**: Combined question and explanation text

## Quality Guidelines

-   Questions should be age-appropriate for the target grade
-   Use clear, simple language without unnecessary complexity
-   Include real-world contexts where appropriate
-   Ensure mathematical accuracy
-   Provide detailed explanations showing the solution process
-   Align with New Zealand Curriculum learning objectives

## Example Usage

1. Choose appropriate question types for your target grade
2. Create questions following the JSON template structure
3. Ensure proper difficulty distribution (40% easy, 40% medium, 20% hard)
4. Validate questions using the validation script
5. Ingest into vector database using the ingestion script

## Validation Command

```bash
node validate-and-ingest-questions.mjs --file your-questions.json
```

This will validate the structure and mathematical content before storing in the vector database.
