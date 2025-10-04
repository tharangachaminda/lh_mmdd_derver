/**
 * User Role Definitions
 *
 * Defines the two main user types in the Learning Hub platform:
 * - STUDENT: Primary users who generate questions and submit answers
 * - ADMIN: Content managers who oversee questions and users
 */

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

/**
 * Student Profile Information
 *
 * Contains student-specific data for personalized learning experience
 */
export interface StudentProfile {
  grade: number;
  preferredSubjects: string[];
  learningProgress: LearningProgress;
  aiPreferences: AIPreferences;
}

/**
 * Admin Profile Information
 *
 * Contains admin-specific permissions and access levels
 */
export interface AdminProfile {
  permissions: AdminPermission[];
  managedInstitutions: string[];
  accessLevel: AdminAccessLevel;
}

/**
 * Complete User Interface
 *
 * Represents both student and admin users with role-specific profiles
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date;

  // Student-specific properties (only present for students)
  studentProfile?: StudentProfile;

  // Admin-specific properties (only present for admins)
  adminProfile?: AdminProfile;
}

/**
 * Learning Progress Tracking
 *
 * Tracks student's learning journey and performance metrics
 */
export interface LearningProgress {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  subjectProgress: SubjectProgress[];
  currentDifficultyLevel: string;
  lastActivityDate: Date;
  streakDays: number;
  achievementsEarned: Achievement[];
}

/**
 * Subject-specific Progress
 *
 * Detailed progress tracking for each subject
 */
export interface SubjectProgress {
  subject: string;
  questionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  difficultyProgression: string[];
  topicsCompleted: string[];
  timeSpent: number; // in minutes
  lastStudied: Date;
}

/**
 * AI Preferences for Personalized Learning
 *
 * Student preferences for AI question generation and correction
 */
export interface AIPreferences {
  preferredQuestionTypes: QuestionType[];
  difficultyPreference: 'adaptive' | 'fixed';
  feedbackStyle: 'detailed' | 'concise';
  reminderFrequency: 'daily' | 'weekly' | 'none';
  allowChallengeMode: boolean;
}

/**
 * Question Types Supported by the Platform
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  OPEN_TEXT = 'open-text',
  NUMERIC = 'numeric',
  TRUE_FALSE = 'true-false',
  FILL_IN_BLANK = 'fill-in-blank',
  MATCHING = 'matching',
}

/**
 * Admin Permissions
 *
 * Granular permissions for admin users
 */
export enum AdminPermission {
  MANAGE_QUESTIONS = 'manage-questions',
  MANAGE_USERS = 'manage-users',
  VIEW_ANALYTICS = 'view-analytics',
  SYSTEM_ADMIN = 'system-admin',
  BULK_OPERATIONS = 'bulk-operations',
  CONTENT_APPROVAL = 'content-approval',
}

/**
 * Admin Access Levels
 */
export enum AdminAccessLevel {
  CONTENT_MANAGER = 'content-manager',
  USER_MANAGER = 'user-manager',
  SYSTEM_ADMIN = 'system-admin',
  SUPER_ADMIN = 'super-admin',
}

/**
 * Achievement System
 *
 * Gamification elements for student engagement
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedDate: Date;
  category: AchievementCategory;
}

export enum AchievementCategory {
  STREAK = 'streak',
  ACCURACY = 'accuracy',
  SUBJECT_MASTERY = 'subject-mastery',
  DIFFICULTY_PROGRESSION = 'difficulty-progression',
  SOCIAL = 'social',
}

/**
 * Authentication Related Interfaces
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface StudentRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  grade: number;
  preferredSubjects: string[];
}
