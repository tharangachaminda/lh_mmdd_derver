export var QuestionType;
(function (QuestionType) {
    // Basic Operations
    QuestionType["ADDITION"] = "addition";
    QuestionType["SUBTRACTION"] = "subtraction";
    QuestionType["MULTIPLICATION"] = "multiplication";
    QuestionType["DIVISION"] = "division";
    // Whole Number Operations (specific types used in curriculum)
    QuestionType["WHOLE_NUMBER_ADDITION"] = "whole_number_addition";
    QuestionType["WHOLE_NUMBER_SUBTRACTION"] = "whole_number_subtraction";
    QuestionType["WHOLE_NUMBER_MULTIPLICATION"] = "whole_number_multiplication";
    // Division with Remainders
    QuestionType["WHOLE_NUMBER_DIVISION"] = "whole_number_division";
    QuestionType["DIVISION_WITH_REMAINDERS"] = "division_with_remainders";
    QuestionType["LONG_DIVISION"] = "long_division";
    QuestionType["DECIMAL_DIVISION_EXACT"] = "decimal_division_exact";
    // Fraction Operations
    QuestionType["FRACTION_ADDITION"] = "fraction_addition";
    QuestionType["FRACTION_SUBTRACTION"] = "fraction_subtraction";
    QuestionType["FRACTION_MULTIPLICATION"] = "fraction_multiplication";
    QuestionType["FRACTION_DIVISION"] = "fraction_division";
    QuestionType["FRACTION_COMPARISON"] = "fraction_comparison";
    QuestionType["FRACTION_SIMPLIFICATION"] = "fraction_simplification";
    // Decimal Operations
    QuestionType["DECIMAL_ADDITION"] = "decimal_addition";
    QuestionType["DECIMAL_SUBTRACTION"] = "decimal_subtraction";
    QuestionType["DECIMAL_MULTIPLICATION"] = "decimal_multiplication";
    QuestionType["DECIMAL_DIVISION"] = "decimal_division";
    QuestionType["DECIMAL_COMPARISON"] = "decimal_comparison";
    QuestionType["DECIMAL_ROUNDING"] = "decimal_rounding";
    // Percentage
    QuestionType["PERCENTAGE_CALCULATION"] = "percentage_calculation";
    QuestionType["PERCENTAGE_OF_NUMBER"] = "percentage_of_number";
    QuestionType["PERCENTAGE_INCREASE"] = "percentage_increase";
    QuestionType["PERCENTAGE_DECREASE"] = "percentage_decrease";
    // Integer Operations
    QuestionType["INTEGER_ADDITION"] = "integer_addition";
    QuestionType["INTEGER_SUBTRACTION"] = "integer_subtraction";
    QuestionType["INTEGER_MULTIPLICATION"] = "integer_multiplication";
    QuestionType["INTEGER_DIVISION"] = "integer_division";
    // Algebra
    QuestionType["ALGEBRAIC_EXPRESSION"] = "algebraic_expression";
    QuestionType["SOLVING_EQUATIONS"] = "solving_equations";
    QuestionType["GRAPHING"] = "graphing";
    QuestionType["SLOPE_CALCULATION"] = "slope_calculation";
    // Geometry
    QuestionType["AREA_CALCULATION"] = "area_calculation";
    QuestionType["PERIMETER_CALCULATION"] = "perimeter_calculation";
    QuestionType["VOLUME_CALCULATION"] = "volume_calculation";
    QuestionType["ANGLE_MEASUREMENT"] = "angle_measurement";
    QuestionType["SHAPE_IDENTIFICATION"] = "shape_identification";
    // Ratios and Proportions
    QuestionType["RATIO_SIMPLIFICATION"] = "ratio_simplification";
    QuestionType["PROPORTION_SOLVING"] = "proportion_solving";
    QuestionType["UNIT_RATE"] = "unit_rate";
    QuestionType["SCALE_FACTOR"] = "scale_factor";
    // Statistics and Probability
    QuestionType["MEAN_CALCULATION"] = "mean_calculation";
    QuestionType["MEDIAN_CALCULATION"] = "median_calculation";
    QuestionType["MODE_CALCULATION"] = "mode_calculation";
    QuestionType["PROBABILITY_CALCULATION"] = "probability_calculation";
    QuestionType["DATA_INTERPRETATION"] = "data_interpretation";
    // Word Problems
    QuestionType["WORD_PROBLEM_ADDITION"] = "word_problem_addition";
    QuestionType["WORD_PROBLEM_SUBTRACTION"] = "word_problem_subtraction";
    QuestionType["WORD_PROBLEM_MULTIPLICATION"] = "word_problem_multiplication";
    QuestionType["WORD_PROBLEM_DIVISION"] = "word_problem_division";
    QuestionType["WORD_PROBLEM_MIXED"] = "word_problem_mixed";
    // Pattern Recognition
    QuestionType["PATTERN"] = "pattern";
    QuestionType["SEQUENCE"] = "sequence";
    QuestionType["FUNCTION_TABLE"] = "function_table";
    // Aggregated / Integrated Mastery Sets (Grade 7+ multi-domain)
    QuestionType["FRACTION_DECIMAL_MASTERY"] = "fraction_decimal_mastery";
    QuestionType["ALGEBRAIC_FOUNDATIONS"] = "algebraic_foundations";
    QuestionType["MULTI_UNIT_CONVERSIONS"] = "multi_unit_conversions";
    QuestionType["GEOMETRY_SPATIAL_REASONING"] = "geometry_spatial_reasoning";
    QuestionType["DATA_ANALYSIS_PROBABILITY"] = "data_analysis_probability";
})(QuestionType || (QuestionType = {}));
export var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel["EASY"] = "easy";
    DifficultyLevel["MEDIUM"] = "medium";
    DifficultyLevel["HARD"] = "hard";
})(DifficultyLevel || (DifficultyLevel = {}));
/**
 * Subject areas supported by the curriculum system
 */
export var Subject;
(function (Subject) {
    Subject["MATHEMATICS"] = "Mathematics";
    Subject["SCIENCE"] = "Science";
    Subject["ENGLISH"] = "English";
    Subject["SOCIAL_STUDIES"] = "Social Studies";
})(Subject || (Subject = {}));
/**
 * Mathematical topics covered in Grade 3-8 curriculum
 */
export var MathTopic;
(function (MathTopic) {
    // Number and Operations
    MathTopic["ADDITION"] = "Addition";
    MathTopic["SUBTRACTION"] = "Subtraction";
    MathTopic["MULTIPLICATION"] = "Multiplication";
    MathTopic["DIVISION"] = "Division";
    MathTopic["FRACTIONS"] = "Fractions";
    MathTopic["DECIMALS"] = "Decimals";
    MathTopic["PERCENTAGES"] = "Percentages";
    MathTopic["INTEGERS"] = "Integers";
    MathTopic["RATIONAL_NUMBERS"] = "Rational Numbers";
    MathTopic["NUMBER_SENSE"] = "Number Sense";
    MathTopic["PLACE_VALUE"] = "Place Value";
    // Algebra
    MathTopic["ALGEBRAIC_EXPRESSIONS"] = "Algebraic Expressions";
    MathTopic["EQUATIONS"] = "Equations";
    MathTopic["INEQUALITIES"] = "Inequalities";
    MathTopic["FUNCTIONS"] = "Functions";
    MathTopic["PATTERNS_AND_SEQUENCES"] = "Patterns and Sequences";
    MathTopic["COORDINATE_PLANE"] = "Coordinate Plane";
    // Geometry
    MathTopic["SHAPES_AND_SOLIDS"] = "Shapes and Solids";
    MathTopic["ANGLES"] = "Angles";
    MathTopic["AREA_AND_PERIMETER"] = "Area and Perimeter";
    MathTopic["VOLUME_AND_SURFACE_AREA"] = "Volume and Surface Area";
    MathTopic["TRANSFORMATIONS"] = "Transformations";
    MathTopic["SIMILARITY_AND_CONGRUENCE"] = "Similarity and Congruence";
    MathTopic["PYTHAGOREAN_THEOREM"] = "Pythagorean Theorem";
    // Measurement
    MathTopic["LENGTH_AND_DISTANCE"] = "Length and Distance";
    MathTopic["WEIGHT_AND_MASS"] = "Weight and Mass";
    MathTopic["CAPACITY_AND_VOLUME"] = "Capacity and Volume";
    MathTopic["TIME"] = "Time";
    MathTopic["TEMPERATURE"] = "Temperature";
    MathTopic["MONEY"] = "Money";
    // Statistics and Probability
    MathTopic["DATA_COLLECTION"] = "Data Collection";
    MathTopic["GRAPHS_AND_CHARTS"] = "Graphs and Charts";
    MathTopic["MEAN_MEDIAN_MODE"] = "Mean, Median, and Mode";
    MathTopic["PROBABILITY"] = "Probability";
    MathTopic["COMBINATIONS_AND_PERMUTATIONS"] = "Combinations and Permutations";
    // Ratios and Proportions
    MathTopic["RATIOS"] = "Ratios";
    MathTopic["PROPORTIONS"] = "Proportions";
    MathTopic["SCALE_FACTOR"] = "Scale Factor";
    MathTopic["UNIT_RATES"] = "Unit Rates";
})(MathTopic || (MathTopic = {}));
/**
 * Subtopics for Grade 3-8 mathematics curriculum organization
 */
export var MathSubtopic;
(function (MathSubtopic) {
    // Number Operations (Grades 3-5)
    MathSubtopic["MULTI_DIGIT_ADDITION"] = "Multi-Digit Addition";
    MathSubtopic["MULTI_DIGIT_SUBTRACTION"] = "Multi-Digit Subtraction";
    MathSubtopic["MULTIPLICATION_TABLES"] = "Multiplication Tables";
    MathSubtopic["MULTI_DIGIT_MULTIPLICATION"] = "Multi-Digit Multiplication";
    MathSubtopic["LONG_DIVISION"] = "Long Division";
    MathSubtopic["DIVISION_WITH_REMAINDERS"] = "Division with Remainders";
    // Fractions (Grades 3-6)
    MathSubtopic["FRACTION_BASICS"] = "Fraction Basics";
    MathSubtopic["EQUIVALENT_FRACTIONS"] = "Equivalent Fractions";
    MathSubtopic["COMPARING_FRACTIONS"] = "Comparing Fractions";
    MathSubtopic["ADDING_FRACTIONS"] = "Adding Fractions";
    MathSubtopic["SUBTRACTING_FRACTIONS"] = "Subtracting Fractions";
    MathSubtopic["MULTIPLYING_FRACTIONS"] = "Multiplying Fractions";
    MathSubtopic["DIVIDING_FRACTIONS"] = "Dividing Fractions";
    MathSubtopic["MIXED_NUMBERS"] = "Mixed Numbers";
    MathSubtopic["IMPROPER_FRACTIONS"] = "Improper Fractions";
    // Decimals (Grades 4-6)
    MathSubtopic["DECIMAL_PLACE_VALUE"] = "Decimal Place Value";
    MathSubtopic["COMPARING_DECIMALS"] = "Comparing Decimals";
    MathSubtopic["ADDING_DECIMALS"] = "Adding Decimals";
    MathSubtopic["SUBTRACTING_DECIMALS"] = "Subtracting Decimals";
    MathSubtopic["MULTIPLYING_DECIMALS"] = "Multiplying Decimals";
    MathSubtopic["DIVIDING_DECIMALS"] = "Dividing Decimals";
    MathSubtopic["ROUNDING_DECIMALS"] = "Rounding Decimals";
    // Percentages (Grades 5-8)
    MathSubtopic["PERCENT_BASICS"] = "Percent Basics";
    MathSubtopic["PERCENT_OF_NUMBER"] = "Percent of a Number";
    MathSubtopic["PERCENT_INCREASE_DECREASE"] = "Percent Increase and Decrease";
    MathSubtopic["SALES_TAX_AND_DISCOUNTS"] = "Sales Tax and Discounts";
    MathSubtopic["SIMPLE_INTEREST"] = "Simple Interest";
    // Integers (Grades 6-8)
    MathSubtopic["POSITIVE_AND_NEGATIVE_NUMBERS"] = "Positive and Negative Numbers";
    MathSubtopic["ADDING_INTEGERS"] = "Adding Integers";
    MathSubtopic["SUBTRACTING_INTEGERS"] = "Subtracting Integers";
    MathSubtopic["MULTIPLYING_INTEGERS"] = "Multiplying Integers";
    MathSubtopic["DIVIDING_INTEGERS"] = "Dividing Integers";
    MathSubtopic["INTEGER_ORDER"] = "Integer Order";
    // Algebra (Grades 6-8)
    MathSubtopic["VARIABLES_AND_EXPRESSIONS"] = "Variables and Expressions";
    MathSubtopic["EVALUATING_EXPRESSIONS"] = "Evaluating Expressions";
    MathSubtopic["COMBINING_LIKE_TERMS"] = "Combining Like Terms";
    MathSubtopic["SOLVING_ONE_STEP_EQUATIONS"] = "Solving One-Step Equations";
    MathSubtopic["SOLVING_TWO_STEP_EQUATIONS"] = "Solving Two-Step Equations";
    MathSubtopic["SOLVING_MULTI_STEP_EQUATIONS"] = "Solving Multi-Step Equations";
    MathSubtopic["GRAPHING_LINEAR_EQUATIONS"] = "Graphing Linear Equations";
    MathSubtopic["SLOPE"] = "Slope";
    // Geometry (Grades 3-8)
    MathSubtopic["BASIC_SHAPES"] = "Basic Shapes";
    MathSubtopic["ANGLES_AND_MEASUREMENT"] = "Angles and Measurement";
    MathSubtopic["TRIANGLES"] = "Triangles";
    MathSubtopic["QUADRILATERALS"] = "Quadrilaterals";
    MathSubtopic["CIRCLES"] = "Circles";
    MathSubtopic["AREA_OF_RECTANGLES"] = "Area of Rectangles";
    MathSubtopic["AREA_OF_TRIANGLES"] = "Area of Triangles";
    MathSubtopic["AREA_OF_CIRCLES"] = "Area of Circles";
    MathSubtopic["PERIMETER"] = "Perimeter";
    MathSubtopic["CIRCUMFERENCE"] = "Circumference";
    MathSubtopic["VOLUME_OF_RECTANGULAR_PRISMS"] = "Volume of Rectangular Prisms";
    MathSubtopic["VOLUME_OF_CYLINDERS"] = "Volume of Cylinders";
    MathSubtopic["SURFACE_AREA"] = "Surface Area";
    // Ratios and Proportions (Grades 6-8)
    MathSubtopic["RATIO_BASICS"] = "Ratio Basics";
    MathSubtopic["EQUIVALENT_RATIOS"] = "Equivalent Ratios";
    MathSubtopic["UNIT_RATES"] = "Unit Rates";
    MathSubtopic["PROPORTIONAL_RELATIONSHIPS"] = "Proportional Relationships";
    MathSubtopic["SOLVING_PROPORTIONS"] = "Solving Proportions";
    MathSubtopic["SCALE_DRAWINGS"] = "Scale Drawings";
    // Statistics (Grades 6-8)
    MathSubtopic["DATA_DISPLAYS"] = "Data Displays";
    MathSubtopic["BAR_GRAPHS"] = "Bar Graphs";
    MathSubtopic["LINE_GRAPHS"] = "Line Graphs";
    MathSubtopic["HISTOGRAMS"] = "Histograms";
    MathSubtopic["BOX_PLOTS"] = "Box Plots";
    MathSubtopic["SCATTER_PLOTS"] = "Scatter Plots";
    MathSubtopic["MEASURES_OF_CENTER"] = "Measures of Center";
    MathSubtopic["MEASURES_OF_SPREAD"] = "Measures of Spread";
    // Probability (Grades 7-8)
    MathSubtopic["PROBABILITY_BASICS"] = "Probability Basics";
    MathSubtopic["THEORETICAL_PROBABILITY"] = "Theoretical Probability";
    MathSubtopic["EXPERIMENTAL_PROBABILITY"] = "Experimental Probability";
    MathSubtopic["COMPOUND_EVENTS"] = "Compound Events";
    MathSubtopic["INDEPENDENT_EVENTS"] = "Independent Events";
    MathSubtopic["DEPENDENT_EVENTS"] = "Dependent Events";
})(MathSubtopic || (MathSubtopic = {}));
/**
 * Valid grade levels for elementary-middle school mathematics (focusing on Grades 3-8)
 */
export var Grade;
(function (Grade) {
    Grade[Grade["THIRD"] = 3] = "THIRD";
    Grade[Grade["FOURTH"] = 4] = "FOURTH";
    Grade[Grade["FIFTH"] = 5] = "FIFTH";
    Grade[Grade["SIXTH"] = 6] = "SIXTH";
    Grade[Grade["SEVENTH"] = 7] = "SEVENTH";
    Grade[Grade["EIGHTH"] = 8] = "EIGHTH";
})(Grade || (Grade = {}));
// Curriculum-related interfaces have been moved to curriculum.ts
