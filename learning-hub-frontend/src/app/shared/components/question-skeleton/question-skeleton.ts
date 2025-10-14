import { Component } from '@angular/core';

/**
 * Question Skeleton Loading Component
 *
 * Displays an animated skeleton placeholder that matches the question card layout.
 * Used during streaming question generation to provide visual feedback while
 * questions are being generated in the background.
 *
 * **Features:**
 * - Matches exact layout of real question card
 * - Pulse/shimmer animation for loading effect
 * - Standalone component for easy reuse
 * - Responsive design matching parent container
 *
 * **Usage:**
 * ```html
 * <!-- Show skeleton while question is loading -->
 * @if (questionLoading) {
 *   <app-question-skeleton />
 * }
 *
 * <!-- Show real question once loaded -->
 * @if (question && !questionLoading) {
 *   <div class="question-card">...</div>
 * }
 * ```
 *
 * @since Session 1 - Streaming Implementation
 * @version 1.0.0
 */
@Component({
  selector: 'app-question-skeleton',
  imports: [],
  templateUrl: './question-skeleton.html',
  styleUrl: './question-skeleton.scss',
  standalone: true,
})
export class QuestionSkeletonComponent {
  // No logic needed - pure presentation component
}
