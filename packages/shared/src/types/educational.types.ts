/**
 * Subject-Agnostic Educational Platform Models
 *
 * Core types and interfaces for multi-subject educational content management.
 * Designed to support Mathematics, Science, English, Social Studies, and future subjects.
 *
 * @fileoverview Core educational domain models for the Learning Hub platform
 * @version 2.0.0 - Subject-agnostic refactor
 */

/**
 * Educational subjects supported by the platform
 */
export enum Subject {
    MATHEMATICS = "mathematics",
    SCIENCE = "science",
    ENGLISH = "english",
    SOCIAL_STUDIES = "social_studies",
    // Future subjects can be easily added here
}

/**
 * Educational frameworks/curricula supported
 */
export enum CurriculumFramework {
    NEW_ZEALAND = "new_zealand",
    AUSTRALIA = "australia",
    UK = "uk",
    US_COMMON_CORE = "us_common_core",
    // Additional frameworks can be added
}

/**
 * Difficulty levels across all subjects
 */
export enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
    ADVANCED = "advanced",
}

/**
 * Question types that can apply across subjects
 */
export enum QuestionFormat {
    MULTIPLE_CHOICE = "multiple_choice",
    SHORT_ANSWER = "short_answer",
    LONG_ANSWER = "long_answer",
    TRUE_FALSE = "true_false",
    FILL_IN_BLANK = "fill_in_blank",
    MATCHING = "matching",
    ORDERING = "ordering",
    DRAWING = "drawing",
    CALCULATION = "calculation",
}

/**
 * Base interface for all educational content
 */
export interface EducationalContent {
    id: string;
    subject: Subject;
    grade: number;
    framework: CurriculumFramework;
    createdAt: Date;
    updatedAt: Date;
    metadata: ContentMetadata;
}

/**
 * Metadata for educational content
 */
export interface ContentMetadata {
    version: string;
    author: string;
    reviewedBy?: string;
    tags: string[];
    keywords: string[];
    estimatedDuration?: number; // minutes
    prerequisites?: string[];
    learningObjectives: string[];
}

/**
 * Core question interface - subject agnostic
 */
export interface EducationalQuestion extends EducationalContent {
    title: string;
    question: string;
    answer: string | string[];
    explanation: string;
    difficulty: DifficultyLevel;
    format: QuestionFormat;
    topic: string;
    subtopic?: string;
    hints?: string[];
    resources?: ResourceLink[];
    assessmentCriteria?: AssessmentCriterion[];
    subjectSpecific: SubjectSpecificData;
}

/**
 * Subject-specific data extension point
 */
export interface SubjectSpecificData {
    // Mathematics specific
    mathematicsData?: MathematicsQuestionData;
    // Science specific
    scienceData?: ScienceQuestionData;
    // English specific
    englishData?: EnglishQuestionData;
    // Social Studies specific
    socialStudiesData?: SocialStudiesQuestionData;
}

/**
 * Mathematics-specific question data
 */
export interface MathematicsQuestionData {
    mathType: MathematicsQuestionType;
    formula?: string;
    units?: string;
    calculationSteps?: string[];
    visualAids?: string[];
    realWorldContext?: string;
}

/**
 * Mathematics question types (from existing system)
 */
export enum MathematicsQuestionType {
    // Basic Operations
    ADDITION = "addition",
    SUBTRACTION = "subtraction",
    MULTIPLICATION = "multiplication",
    DIVISION = "division",

    // Fractions & Decimals
    FRACTION_OPERATIONS = "fraction_operations",
    DECIMAL_OPERATIONS = "decimal_operations",
    PERCENTAGE_CALCULATION = "percentage_calculation",

    // Algebra
    LINEAR_EQUATIONS = "linear_equations",
    ALGEBRAIC_MANIPULATION = "algebraic_manipulation",
    PATTERNS = "patterns",

    // Geometry & Measurement
    AREA_CALCULATION = "area_calculation",
    PERIMETER_CALCULATION = "perimeter_calculation",
    VOLUME_CALCULATION = "volume_calculation",
    UNIT_CONVERSIONS = "unit_conversions",

    // Ratios & Proportions
    RATIOS_AND_PROPORTIONS = "ratios_and_proportions",
    SCALE_FACTOR = "scale_factor",

    // Financial Mathematics
    FINANCIAL_LITERACY = "financial_literacy",

    // Data & Statistics
    DATA_ANALYSIS_PROBABILITY = "data_analysis_probability",
}

/**
 * Science-specific question data (placeholder for future)
 */
export interface ScienceQuestionData {
    scienceType: ScienceQuestionType;
    experimentData?: ExperimentData;
    safetyNotes?: string[];
    materials?: string[];
}

export enum ScienceQuestionType {
    PHYSICS = "physics",
    CHEMISTRY = "chemistry",
    BIOLOGY = "biology",
    EARTH_SCIENCE = "earth_science",
}

export interface ExperimentData {
    hypothesis: string;
    variables: Variable[];
    procedure: string[];
    expectedResults: string;
}

export interface Variable {
    name: string;
    type: "independent" | "dependent" | "controlled";
    description: string;
}

/**
 * English-specific question data (placeholder for future)
 */
export interface EnglishQuestionData {
    englishType: EnglishQuestionType;
    textPassage?: string;
    grammarFocus?: string[];
    vocabularyLevel?: string;
}

export enum EnglishQuestionType {
    READING_COMPREHENSION = "reading_comprehension",
    GRAMMAR = "grammar",
    VOCABULARY = "vocabulary",
    WRITING = "writing",
    LITERATURE = "literature",
}

/**
 * Social Studies-specific question data (placeholder for future)
 */
export interface SocialStudiesQuestionData {
    socialStudiesType: SocialStudiesQuestionType;
    historicalPeriod?: string;
    geographicalRegion?: string;
    primarySources?: string[];
}

export enum SocialStudiesQuestionType {
    HISTORY = "history",
    GEOGRAPHY = "geography",
    CIVICS = "civics",
    ECONOMICS = "economics",
}

/**
 * Resource links for additional learning materials
 */
export interface ResourceLink {
    title: string;
    url: string;
    type: "video" | "article" | "interactive" | "worksheet";
    description?: string;
}

/**
 * Assessment criteria for grading
 */
export interface AssessmentCriterion {
    criterion: string;
    points: number;
    description: string;
    rubric?: RubricLevel[];
}

export interface RubricLevel {
    level: string;
    points: number;
    description: string;
}

/**
 * Curriculum alignment information
 */
export interface CurriculumAlignment {
    framework: CurriculumFramework;
    subject: Subject;
    grade: number;
    strand: string;
    subStrand?: string;
    standards: CurriculumStandard[];
    achievementObjectives: string[];
}

export interface CurriculumStandard {
    code: string;
    title: string;
    description: string;
    level: number;
}

/**
 * Question collection/dataset interface
 */
export interface QuestionDataset extends EducationalContent {
    name: string;
    description: string;
    questions: EducationalQuestion[];
    totalQuestions: number;
    difficultyDistribution: DifficultyDistribution;
    curriculumAlignment: CurriculumAlignment;
    qualityMetrics: QualityMetrics;
}

export interface DifficultyDistribution {
    easy: number;
    medium: number;
    hard: number;
    advanced?: number;
}

export interface QualityMetrics {
    reviewStatus: "draft" | "reviewed" | "approved" | "published";
    testCoverage: number;
    pedagogicalAlignment: number;
    accessibilityScore: number;
    lastQualityCheck: Date;
}

/**
 * Legacy compatibility - maps old math-specific types to new system
 * @deprecated Use MathematicsQuestionType within SubjectSpecificData instead
 */
export const QuestionType = MathematicsQuestionType;

export default {
    Subject,
    CurriculumFramework,
    DifficultyLevel,
    QuestionFormat,
    MathematicsQuestionType,
    ScienceQuestionType,
    EnglishQuestionType,
    SocialStudiesQuestionType,
};
