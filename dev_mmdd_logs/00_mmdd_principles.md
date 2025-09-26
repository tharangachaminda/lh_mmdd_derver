# MMDD (Micromanaged Driven Development) Principles

## Overview

MMDD is a development methodology that emphasizes micromanaged steps, complete documentation, developer control, and strict TDD compliance. This methodology ensures every development action is reviewable, reversible, and well-documented.

## Core Principles

### 1. Micromanaged Steps

-   Break ALL development into ≤30 minute reviewable steps
-   Document every decision with rationale and alternatives
-   Maintain complete rollback capability at every step
-   Never proceed without explicit developer approval

### 2. Complete Documentation

-   Log every AI interaction with developer decisions
-   Create audit trails for maintainability and knowledge transfer
-   Document technical decisions with alternatives considered
-   Track session progress with detailed step-by-step logs

### 3. Developer Control

-   AI suggests, developer decides and approves each step
-   All code changes require explicit developer review
-   Developer can rollback any step safely
-   Maintain transparency in all AI recommendations
-   **TDD Enforcement**: AI will refuse to proceed if TDD methodology is not followed

## TDD Integration (ABSOLUTE REQUIREMENT)

### 🔴 RED Phase + MMDD (Write Failing Tests)

-   **MANDATORY**: Write one failing test per micro-step - NO EXCEPTIONS
-   **Verification**: MUST run test and confirm it fails before any implementation
-   **Documentation**: Log test strategy, expected failures, and test rationale
-   **Quality**: Test must clearly define expected behavior and interface
-   **Developer Control**: Approve each test before proceeding to implementation
-   **Enforcement**: Agent will REFUSE to proceed without proper failing test

### 🟢 GREEN Phase + MMDD (Minimal Implementation)

-   **MANDATORY**: Write MINIMAL code to pass exactly one failing test
-   **Discipline**: NO extra features, NO over-implementation beyond test requirements
-   **Validation**: Target test passes, ALL other tests remain green
-   **Documentation**: Log implementation approach, alternatives, and minimal nature
-   **Developer Control**: Approve each implementation approach
-   **Enforcement**: Agent will STOP if implementation exceeds test requirements

### 🔵 REFACTOR Phase + MMDD (Improve Code Quality)

-   **MANDATORY**: Improve code structure while maintaining ALL tests green
-   **Safety**: Complete test suite MUST pass throughout refactoring
-   **Quality Focus**: Improve readability, performance, or maintainability
-   **Documentation**: Log refactoring decisions and quality improvements
-   **Developer Control**: Approve each refactoring step
-   **Enforcement**: Agent will HALT if any test becomes red during refactoring

## Quality Gates (Every Step)

-   [ ] **Reviewable**: Others can understand the change
-   [ ] **Reversible**: Can be safely rolled back
-   [ ] **Documented**: Rationale and alternatives captured
-   [ ] **TDD Compliant**: Aligns with current phase
-   [ ] **Developer Approved**: Explicit approval received
-   [ ] **TSDoc Complete**: All functions have comprehensive TSDoc comments
-   [ ] **Documentation Valid**: TSDoc includes @param, @returns, @throws, @example

## Available Commands

### Core MMDD Commands

-   `*start-session`: Initialize new MMDD development session with work item detection
-   `*detect-work-item`: Auto-detect or prompt for current work item (LS-XXXXX)
-   `*propose-step`: Present next micro-step for developer approval
-   `*log-decision`: Document technical decision with alternatives
-   `*validate-step`: Check if step meets MMDD quality gates
-   `*session-status`: Show current progress and next steps
-   `*rollback-step`: Safely revert last development step

### TDD Integration Commands

-   `*tdd-status`: Show current TDD phase and test status
-   `*tdd-red`: Guide through RED phase - write failing test for specific functionality
-   `*tdd-green`: Guide through GREEN phase - minimal implementation to pass failing test
-   `*tdd-refactor`: Guide through REFACTOR phase - improve code while keeping tests green
-   `*enforce-tdd`: Validate current step follows proper TDD methodology
-   `*run-tests`: Execute tests and validate TDD phase compliance
-   `*check-coverage`: Measure and validate test coverage meets 80% minimum

### TSDoc Documentation Commands

-   `*validate-tsdoc`: Check that all functions have comprehensive TSDoc comments
-   `*generate-tsdoc`: Create or enhance TSDoc comments for functions

## Directory Structure

```
dev_mmdd_logs/
├── 00_mmdd_principles.md     # This file - methodology reference
├── sessions/                 # Development session logs (organized by work item)
│   └── LS-XXXXX/            # Work item specific sessions
│       └── YYYY-MM-DD-session-{n}.md
└── decisions/                # Technical decision logs (organized by work item)
    └── LS-XXXXX/            # Work item specific decisions
        └── LS-XXXXX-DEC-{n}.md
```

## Work Item Management

-   **Auto-Detection**: Extracts work item (LS-XXXXX) from current git branch
-   **Fallback Prompt**: Asks for work item if branch is main/develop or no pattern found
-   **Team Collaboration**: Multiple developers can share same work item session directory
-   **Organization**: Sessions and decisions organized by work item for better team coordination

Remember: MMDD success comes from developer control, complete documentation, maintainable audit trails organized by work items, and STRICT TDD compliance. Every step should be reviewable, reversible, thoroughly documented, and follow proper Test-Driven Development methodology.
