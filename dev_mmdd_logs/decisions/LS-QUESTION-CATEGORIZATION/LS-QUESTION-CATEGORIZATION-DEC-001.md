# Decision Record: Frontend UI/UX Design Approach

**Decision ID**: `LS-QUESTION-CATEGORIZATION-DEC-001`  
**Date**: 2025-10-08  
**Status**: ✅ Approved  
**Decision Maker**: User (tharanga)  
**Documented By**: AI Agent (dev-mmtdd)

---

## 🎯 Context

The AI Question Generator currently uses a simple dropdown-based interface that doesn't showcase:

-   The rich categorization of 54+ question types
-   Educational context (category descriptions, skills)
-   Student progress tracking
-   Grade-appropriate content filtering

We needed to design a new multi-view navigation structure that is:

-   Visually engaging for students (ages 8-13)
-   Educational (shows learning objectives)
-   Progressive (guides students through logical flow)
-   Scalable (supports future features like progress tracking)

---

## 🤔 Options Considered

### 1. Navigation Structure

**Option A: Multi-Page Routing**

-   Separate routes for each view level
-   Pros: Clean URLs, browser back button, shareable links
-   Cons: More complex state management

**Option B: Single-Page Stepper**

-   All views in one component with step state
-   Pros: Simple state management
-   Cons: No browser history, not shareable

**Option C: Hybrid Routed Tabs** ✅ SELECTED

-   Main views as routes, sub-content as components
-   `/student/ai-generator` → subjects
-   `/student/ai-generator/:subject` → categories
-   `/student/ai-generator/:subject/:category` → types
-   Pros: Natural navigation, browser back works, testable
-   Rationale: Best balance of user experience and implementation simplicity

---

### 2. Category Display

**Option A: Card Grid Layout** ✅ SELECTED

```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Category│ │ Category│ │ Category│
│   1     │ │   2     │ │   3     │
└─────────┘ └─────────┘ └─────────┘
```

-   Pros: Visual, engaging, shows all categories, good for touch
-   Cons: More vertical space

**Option B: Tabbed Interface**

-   Horizontal tabs with one active category
-   Pros: Compact, familiar pattern
-   Cons: Hides other categories, requires extra clicks

**Rationale**: Card layout better suits:

-   Primary audience (young learners, ages 8-13)
-   Touch devices (tablets commonly used in schools)
-   Progress visibility (see all category progress at once)
-   Visual hierarchy (icons + colors + progress indicators)

---

### 3. Icon Style

**Option A: Emoji Icons** (🔢, 🧮, 📐, 📊)

-   Pros: Colorful, no additional dependencies
-   Cons: Inconsistent rendering across platforms

**Option B: Material Design Icons** ✅ SELECTED

-   Pros: Consistent, professional, already in Angular Material
-   Cons: Requires icon mapping
-   Rationale: Better cross-platform consistency, professional appearance

---

### 4. Progress Data

**Option A: Skip Progress Display**

-   Don't show progress until tracking implemented
-   Pros: Simpler initial implementation
-   Cons: Less engaging, misses opportunity for motivation

**Option B: Mock Progress Data** ✅ SELECTED

-   Display placeholder data (e.g., "0/100 questions")
-   Pros: Tests UI layout, shows intent, easy to replace later
-   Cons: Shows "fake" data initially
-   Rationale:
    -   Validates design with real-looking data
    -   Easy to replace with actual API calls later
    -   Motivates students even with zeros (shows potential)

---

### 5. Implementation Pace

**Option A: Implement All Phases at Once**

-   Complete all 4 phases, then review
-   Pros: Faster delivery of complete feature
-   Cons: Higher risk, harder to course-correct

**Option B: Phase-by-Phase Review** ✅ SELECTED

-   Complete Phase 1 → User Reviews → Approve → Phase 2
-   Pros: Early feedback, lower risk, easier to adjust
-   Cons: Takes slightly longer
-   Rationale: MMDD methodology emphasizes developer control and iterative review

---

## ✅ Final Decisions

1. **Navigation**: Hybrid routed tabs (`/ai-generator/:subject/:category`)
2. **Category Display**: Card grid layout (2-3 columns responsive)
3. **Icons**: Material Design icons (calculate, functions, straighten, bar_chart, etc.)
4. **Progress**: Mock data initially ("0/100 questions" format)
5. **Review Process**: Phase-by-phase approval
6. **Flow Addition**: Persona selection view (View 4) between type selection and question display
7. **Question Display**: No changes to existing interface

---

## 🎨 Design Specifications

### View Flow

```
View 1: Subject Selection (cards)
    ↓
View 2: Category Selection (cards with metadata)
    ↓
View 3: Question Type Selection (chip grid)
    ↓
View 4: Persona Selection (existing pattern, future: move to profile)
    ↓
View 5: Question Display (existing, unchanged)
```

### Category Card Layout

```
┌───────────────────────────────────────┐
│ [Icon]  Category Name            [%]  │
├───────────────────────────────────────┤
│ Description: 1-2 sentences about      │
│ what this category covers             │
├───────────────────────────────────────┤
│ Skills: • Skill 1 • Skill 2 • Skill 3 │
├───────────────────────────────────────┤
│ Progress: 0/100 questions             │
│ Recommended: 100 questions            │
└───────────────────────────────────────┘
```

### Material Design Icon Mapping

-   Number Operations: `calculate`
-   Algebra & Patterns: `functions`
-   Geometry & Measurement: `straighten`
-   Statistics & Probability: `bar_chart`
-   Ratios, Rates & Proportions: `balance`
-   Motion & Distance: `directions_run`
-   Financial Literacy: `attach_money`
-   Problem Solving: `psychology`

---

## 📦 Implementation Phases

**Phase 1: Data Models & Service Updates** (2-3 hours)

-   Update `question.model.ts` with categories + mappings
-   Update `question.service.ts` with new methods
-   Add TypeScript interfaces

**Phase 2: Subject Selection View** (2-3 hours)

-   Create `SubjectSelectionComponent`
-   Create `SubjectCardComponent`
-   Implement routing

**Phase 3: Category Selection View** (3-4 hours)

-   Create `CategorySelectionComponent`
-   Create `CategoryCardComponent`
-   Add breadcrumb navigation

**Phase 4: Question Type Selection View** (2-3 hours)

-   Create `QuestionTypeSelectionComponent`
-   Implement chip/button grid
-   Connect to existing persona selection

---

## 🔄 Reversibility Plan

If design doesn't work as expected:

1. All code in feature branch (`feature/integrate-agentic-question-generation-with-front-end`)
2. Each phase committed separately
3. Can revert to previous phase easily
4. Original question generator still functional during development
5. Can toggle between old/new UI via feature flag if needed

---

## 📊 Success Metrics

**User Experience:**

-   Students can find question types faster (< 3 clicks)
-   Visual hierarchy is clear (tested with users ages 8-13)
-   Navigation is intuitive (minimal confusion)

**Technical:**

-   All 54 question types accessible through UI
-   Grade-specific filtering works correctly
-   Performance acceptable (< 500ms per view load)

**Educational:**

-   Students understand what skills they're practicing
-   Category descriptions provide context
-   Progress indicators motivate continued practice

---

## 🔗 Related Documents

-   Session Log: `dev_mmdd_logs/sessions/LS-QUESTION-CATEGORIZATION/2025-10-08-session-02-frontend-design.md`
-   Category System: `MATH_QUESTION_TYPES_CATEGORIZED.md`
-   Investigation: `dev_mmdd_logs/sessions/LS-QUESTION-CATEGORIZATION/2025-10-08-session-01-investigation.md`

---

**Approved By**: User (tharanga)  
**Date**: 2025-10-08  
**Next Action**: Begin Phase 1 implementation with TDD approach
