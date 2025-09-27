export enum QuestionType {
    // Basic Operations
    ADDITION = "addition",
    SUBTRACTION = "subtraction",
    MULTIPLICATION = "multiplication",
    DIVISION = "division",
    
    // Fraction Operations
    FRACTION_ADDITION = "fraction_addition",
    FRACTION_SUBTRACTION = "fraction_subtraction",
    FRACTION_MULTIPLICATION = "fraction_multiplication",
    FRACTION_DIVISION = "fraction_division",
    FRACTION_COMPARISON = "fraction_comparison",
    FRACTION_SIMPLIFICATION = "fraction_simplification",
    
    // Decimal Operations
    DECIMAL_ADDITION = "decimal_addition",
    DECIMAL_SUBTRACTION = "decimal_subtraction",
    DECIMAL_MULTIPLICATION = "decimal_multiplication",
    DECIMAL_DIVISION = "decimal_division",
    DECIMAL_COMPARISON = "decimal_comparison",
    DECIMAL_ROUNDING = "decimal_rounding",
    
    // Percentage
    PERCENTAGE_CALCULATION = "percentage_calculation",
    PERCENTAGE_OF_NUMBER = "percentage_of_number",
    PERCENTAGE_INCREASE = "percentage_increase",
    PERCENTAGE_DECREASE = "percentage_decrease",
    
    // Integer Operations
    INTEGER_ADDITION = "integer_addition",
    INTEGER_SUBTRACTION = "integer_subtraction",
    INTEGER_MULTIPLICATION = "integer_multiplication",
    INTEGER_DIVISION = "integer_division",
    
    // Algebra
    ALGEBRAIC_EXPRESSION = "algebraic_expression",
    SOLVING_EQUATIONS = "solving_equations",
    GRAPHING = "graphing",
    SLOPE_CALCULATION = "slope_calculation",
    
    // Geometry
    AREA_CALCULATION = "area_calculation",
    PERIMETER_CALCULATION = "perimeter_calculation",
    VOLUME_CALCULATION = "volume_calculation",
    ANGLE_MEASUREMENT = "angle_measurement",
    SHAPE_IDENTIFICATION = "shape_identification",
    
    // Ratios and Proportions
    RATIO_SIMPLIFICATION = "ratio_simplification",
    PROPORTION_SOLVING = "proportion_solving",
    UNIT_RATE = "unit_rate",
    SCALE_FACTOR = "scale_factor",
    
    // Statistics and Probability
    MEAN_CALCULATION = "mean_calculation",
    MEDIAN_CALCULATION = "median_calculation",
    MODE_CALCULATION = "mode_calculation",
    PROBABILITY_CALCULATION = "probability_calculation",
    DATA_INTERPRETATION = "data_interpretation",
    
    // Word Problems
    WORD_PROBLEM_ADDITION = "word_problem_addition",
    WORD_PROBLEM_SUBTRACTION = "word_problem_subtraction",
    WORD_PROBLEM_MULTIPLICATION = "word_problem_multiplication",
    WORD_PROBLEM_DIVISION = "word_problem_division",
    WORD_PROBLEM_MIXED = "word_problem_mixed",
    
    // Pattern Recognition
    PATTERN = "pattern",
    SEQUENCE = "sequence",
    FUNCTION_TABLE = "function_table",
}

export enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
}

/**
 * Subject areas supported by the curriculum system
 */
export enum Subject {
    MATHEMATICS = "Mathematics",
    SCIENCE = "Science",
    ENGLISH = "English",
    SOCIAL_STUDIES = "Social Studies",
}

/**
 * Mathematical topics covered in Grade 3-8 curriculum
 */
export enum MathTopic {
    // Number and Operations
    ADDITION = "Addition",
    SUBTRACTION = "Subtraction",
    MULTIPLICATION = "Multiplication",
    DIVISION = "Division",
    FRACTIONS = "Fractions",
    DECIMALS = "Decimals",
    PERCENTAGES = "Percentages",
    INTEGERS = "Integers",
    RATIONAL_NUMBERS = "Rational Numbers",
    NUMBER_SENSE = "Number Sense",
    PLACE_VALUE = "Place Value",
    
    // Algebra
    ALGEBRAIC_EXPRESSIONS = "Algebraic Expressions",
    EQUATIONS = "Equations",
    INEQUALITIES = "Inequalities",
    FUNCTIONS = "Functions",
    PATTERNS_AND_SEQUENCES = "Patterns and Sequences",
    COORDINATE_PLANE = "Coordinate Plane",
    
    // Geometry
    SHAPES_AND_SOLIDS = "Shapes and Solids",
    ANGLES = "Angles",
    AREA_AND_PERIMETER = "Area and Perimeter",
    VOLUME_AND_SURFACE_AREA = "Volume and Surface Area",
    TRANSFORMATIONS = "Transformations",
    SIMILARITY_AND_CONGRUENCE = "Similarity and Congruence",
    PYTHAGOREAN_THEOREM = "Pythagorean Theorem",
    
    // Measurement
    LENGTH_AND_DISTANCE = "Length and Distance",
    WEIGHT_AND_MASS = "Weight and Mass",
    CAPACITY_AND_VOLUME = "Capacity and Volume",
    TIME = "Time",
    TEMPERATURE = "Temperature",
    MONEY = "Money",
    
    // Statistics and Probability
    DATA_COLLECTION = "Data Collection",
    GRAPHS_AND_CHARTS = "Graphs and Charts",
    MEAN_MEDIAN_MODE = "Mean, Median, and Mode",
    PROBABILITY = "Probability",
    COMBINATIONS_AND_PERMUTATIONS = "Combinations and Permutations",
    
    // Ratios and Proportions
    RATIOS = "Ratios",
    PROPORTIONS = "Proportions",
    SCALE_FACTOR = "Scale Factor",
    UNIT_RATES = "Unit Rates",
}

/**
 * Subtopics for Grade 3-8 mathematics curriculum organization
 */
export enum MathSubtopic {
    // Number Operations (Grades 3-5)
    MULTI_DIGIT_ADDITION = "Multi-Digit Addition",
    MULTI_DIGIT_SUBTRACTION = "Multi-Digit Subtraction",
    MULTIPLICATION_TABLES = "Multiplication Tables",
    MULTI_DIGIT_MULTIPLICATION = "Multi-Digit Multiplication",
    LONG_DIVISION = "Long Division",
    DIVISION_WITH_REMAINDERS = "Division with Remainders",
    
    // Fractions (Grades 3-6)
    FRACTION_BASICS = "Fraction Basics",
    EQUIVALENT_FRACTIONS = "Equivalent Fractions",
    COMPARING_FRACTIONS = "Comparing Fractions",
    ADDING_FRACTIONS = "Adding Fractions",
    SUBTRACTING_FRACTIONS = "Subtracting Fractions",
    MULTIPLYING_FRACTIONS = "Multiplying Fractions",
    DIVIDING_FRACTIONS = "Dividing Fractions",
    MIXED_NUMBERS = "Mixed Numbers",
    IMPROPER_FRACTIONS = "Improper Fractions",
    
    // Decimals (Grades 4-6)
    DECIMAL_PLACE_VALUE = "Decimal Place Value",
    COMPARING_DECIMALS = "Comparing Decimals",
    ADDING_DECIMALS = "Adding Decimals",
    SUBTRACTING_DECIMALS = "Subtracting Decimals",
    MULTIPLYING_DECIMALS = "Multiplying Decimals",
    DIVIDING_DECIMALS = "Dividing Decimals",
    ROUNDING_DECIMALS = "Rounding Decimals",
    
    // Percentages (Grades 5-8)
    PERCENT_BASICS = "Percent Basics",
    PERCENT_OF_NUMBER = "Percent of a Number",
    PERCENT_INCREASE_DECREASE = "Percent Increase and Decrease",
    SALES_TAX_AND_DISCOUNTS = "Sales Tax and Discounts",
    SIMPLE_INTEREST = "Simple Interest",
    
    // Integers (Grades 6-8)
    POSITIVE_AND_NEGATIVE_NUMBERS = "Positive and Negative Numbers",
    ADDING_INTEGERS = "Adding Integers",
    SUBTRACTING_INTEGERS = "Subtracting Integers",
    MULTIPLYING_INTEGERS = "Multiplying Integers",
    DIVIDING_INTEGERS = "Dividing Integers",
    INTEGER_ORDER = "Integer Order",
    
    // Algebra (Grades 6-8)
    VARIABLES_AND_EXPRESSIONS = "Variables and Expressions",
    EVALUATING_EXPRESSIONS = "Evaluating Expressions",
    COMBINING_LIKE_TERMS = "Combining Like Terms",
    SOLVING_ONE_STEP_EQUATIONS = "Solving One-Step Equations",
    SOLVING_TWO_STEP_EQUATIONS = "Solving Two-Step Equations",
    SOLVING_MULTI_STEP_EQUATIONS = "Solving Multi-Step Equations",
    GRAPHING_LINEAR_EQUATIONS = "Graphing Linear Equations",
    SLOPE = "Slope",
    
    // Geometry (Grades 3-8)
    BASIC_SHAPES = "Basic Shapes",
    ANGLES_AND_MEASUREMENT = "Angles and Measurement",
    TRIANGLES = "Triangles",
    QUADRILATERALS = "Quadrilaterals",
    CIRCLES = "Circles",
    AREA_OF_RECTANGLES = "Area of Rectangles",
    AREA_OF_TRIANGLES = "Area of Triangles",
    AREA_OF_CIRCLES = "Area of Circles",
    PERIMETER = "Perimeter",
    CIRCUMFERENCE = "Circumference",
    VOLUME_OF_RECTANGULAR_PRISMS = "Volume of Rectangular Prisms",
    VOLUME_OF_CYLINDERS = "Volume of Cylinders",
    SURFACE_AREA = "Surface Area",
    
    // Ratios and Proportions (Grades 6-8)
    RATIO_BASICS = "Ratio Basics",
    EQUIVALENT_RATIOS = "Equivalent Ratios",
    UNIT_RATES = "Unit Rates",
    PROPORTIONAL_RELATIONSHIPS = "Proportional Relationships",
    SOLVING_PROPORTIONS = "Solving Proportions",
    SCALE_DRAWINGS = "Scale Drawings",
    
    // Statistics (Grades 6-8)
    DATA_DISPLAYS = "Data Displays",
    BAR_GRAPHS = "Bar Graphs",
    LINE_GRAPHS = "Line Graphs",
    HISTOGRAMS = "Histograms",
    BOX_PLOTS = "Box Plots",
    SCATTER_PLOTS = "Scatter Plots",
    MEASURES_OF_CENTER = "Measures of Center",
    MEASURES_OF_SPREAD = "Measures of Spread",
    
    // Probability (Grades 7-8)
    PROBABILITY_BASICS = "Probability Basics",
    THEORETICAL_PROBABILITY = "Theoretical Probability",
    EXPERIMENTAL_PROBABILITY = "Experimental Probability",
    COMPOUND_EVENTS = "Compound Events",
    INDEPENDENT_EVENTS = "Independent Events",
    DEPENDENT_EVENTS = "Dependent Events",
}

/**
 * Valid grade levels for elementary-middle school mathematics (focusing on Grades 3-8)
 */
export enum Grade {
    THIRD = 3,
    FOURTH = 4,
    FIFTH = 5,
    SIXTH = 6,
    SEVENTH = 7,
    EIGHTH = 8,
}

/**
 * Type for grade level as number (focusing on Grades 3-8)
 */
export type GradeLevel = 3 | 4 | 5 | 6 | 7 | 8;

export interface Question {
    id: string;
    type: QuestionType;
    difficulty: DifficultyLevel;
    grade: number;
    question: string;
    answer: number;
    context?: string;
    hints?: string[];
    createdAt: Date;
}

export interface QuestionValidationResult {
    correct: boolean;
    feedback: string;
    nextQuestionSuggestion?: {
        type: QuestionType;
        difficulty: DifficultyLevel;
    };
}

// Curriculum-related interfaces have been moved to curriculum.ts
