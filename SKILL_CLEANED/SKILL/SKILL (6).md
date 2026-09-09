---
name: codebase-cleaner
description: Audits a codebase for dead code, duplication, unused components, unnecessary complexity, and accumulated technical debt; produces an evidence-based cleanup plan and can safely apply low-risk cleanup when explicitly requested.
---

# Codebase Cleaner

## Overview

Systematically audit a codebase for accumulated technical debt without changing intended behavior.

Focus on:

- Dead and unreachable code
- Unused files, modules, functions, variables, exports, and dependencies
- Duplicate or near-duplicate logic
- Abandoned UI components, views, routes, hooks, services, and backend modules
- Over-engineered abstractions and unnecessary indirection
- Redundant configuration and stale assets
- Opportunities to simplify code while preserving behavior

The goal is **less code, fewer moving parts, clearer ownership, and the same functionality**.

---

## Core Principles

1. **Evidence over assumptions** — Do not label something unused unless repository evidence supports it.
2. **Preserve behavior** — Cleanup must not silently alter externally observable behavior.
3. **Prefer deletion over abstraction** — Remove unnecessary code before introducing another layer.
4. **Consolidate carefully** — Refactor duplication only when the shared behavior is genuinely the same.
5. **Respect dynamic usage** — Account for reflection, dynamic imports, framework conventions, generated code, configuration-driven references, CLI entry points, and runtime discovery.
6. **Separate findings from actions** — First identify and justify cleanup opportunities; then recommend or perform changes according to the requested scope.
7. **Minimize churn** — Avoid unrelated formatting, renaming, dependency upgrades, or architectural rewrites.
8. **Verify before declaring success** — Run the most relevant tests, type checks, linters, builds, and static analysis available in the project.

---

# Audit Workflow

## 1. Establish Project Context

Before auditing, inspect the repository structure and determine:

- Primary language(s) and framework(s)
- Package/build system
- Application entry points
- Test setup
- Linting and formatting configuration
- Type-checking configuration
- Build configuration
- Generated-code directories
- Monorepo/workspace boundaries
- Runtime environments and deployment targets
- Framework-specific conventions for automatic discovery

Read relevant project documentation such as:

- `README`
- Contribution/development guides
- Architecture documentation
- Package manifests
- Build scripts
- CI configuration
- Relevant configuration files

Do not treat generated files, vendored code, build output, caches, or dependencies as ordinary application source unless the project explicitly does so.

---

## 2. Build a Usage Map

Trace relationships between:

- Files
- Imports
- Exports
- Functions
- Classes
- Components
- Hooks
- Routes
- Services
- Utilities
- Configuration entries
- Environment variables
- Scripts
- Tests
- Assets
- Dependencies

Use repository-wide search and language-aware/static-analysis tools where available.

Pay particular attention to:

- Entry points
- Public APIs
- Package exports
- Route registration
- Dependency injection
- Plugin systems
- Dynamic imports
- String-based references
- Reflection
- Framework conventions
- Configuration-driven loading
- Test-only utilities
- CLI commands
- Build-time code generation

A lack of a direct import is **not automatically proof of dead code**.

---

# Audit Categories

## 3. Dead Code Detection

Look for:

### Files and Modules

- Files with no inbound references
- Obsolete modules replaced by newer implementations
- Duplicate legacy implementations
- Old migration scripts that are no longer part of supported workflows
- Abandoned experiments or prototypes
- Stale generated artifacts committed accidentally

### Functions and Classes

- Functions never called
- Classes never instantiated or extended
- Unused methods
- Unused exports
- Legacy compatibility wrappers with no consumers
- Feature-specific helpers whose feature was removed

### Variables and Constants

- Unused local variables
- Unused constants
- Unused configuration values
- Stale feature flags
- Environment variables with no consumers

### Unreachable Logic

Identify:

- Impossible branches
- Conditions made redundant by earlier validation
- Unreachable switch cases
- Return paths that can never execute
- Exception handlers for impossible conditions
- Feature flags that are permanently enabled/disabled

For each finding, distinguish between:

- **Confirmed dead**
- **Likely dead**
- **Potentially dynamic / requires verification**

Never present uncertain findings as safe deletions.

---

## 4. Duplicate Logic Analysis

Search for:

- Repeated utility functions
- Copy-pasted validation
- Repeated API/request handling
- Duplicate data transformations
- Similar state-management logic
- Repeated error handling
- Repeated formatting/parsing code
- Near-identical UI components
- Repeated constants or configuration
- Multiple implementations of the same business rule

For each duplication, determine whether it is:

1. **Exact duplication** — same behavior and purpose
2. **Structural duplication** — same algorithm with superficial differences
3. **Conceptual similarity** — similar code serving intentionally different purposes

Only recommend consolidation for cases where doing so reduces maintenance without creating an overly generic abstraction.

Prefer a small, domain-specific shared helper over a large "universal" utility.

---

## 5. Unused Components Audit

Inspect UI and application-layer components for:

- Components never rendered
- Routes no longer registered
- Views no longer reachable
- Hooks with no consumers
- Services no longer injected/called
- State stores with no consumers
- Context providers no longer needed
- Modal/dialog components left from previous implementations
- Deprecated pages
- Duplicate components created during redesigns
- Story/demo/example components that are no longer useful

Check both direct references and framework-specific registration mechanisms.

---

## 6. Dependency & Asset Audit

Inspect project dependencies for:

- Packages with no imports/usages
- Duplicate packages serving the same purpose
- Dependencies only needed by removed features
- Runtime dependencies incorrectly placed in development dependencies
- Development dependencies no longer used
- Duplicate icon/UI libraries
- Stale fonts
- Unused images
- Abandoned CSS
- Unused translation keys
- Stale schemas or fixtures

Do not remove a dependency solely because a simple text search finds no import; account for scripts, configuration, plugins, peer dependencies, generated code, and tooling.

---

# Complexity Reduction

## 7. Identify Unnecessary Complexity

Look for:

- Abstractions used only once without a clear boundary
- Wrapper functions that add no meaningful behavior
- Excessive nesting
- Deep conditional chains
- Redundant state
- Derived state stored unnecessarily
- Repeated conversions between equivalent data structures
- Excessive callback/promise nesting
- Unnecessary classes where functions would suffice
- Multiple layers for simple operations
- Overly generic utilities
- Premature design patterns
- Configuration that duplicates code
- Multiple sources of truth
- State machines or abstractions used for trivial state
- Error handling that obscures the real failure path

When suggesting simplification, explain what becomes easier to understand or maintain.

Do not recommend complexity reduction merely because code is sophisticated. Complexity is a problem when it is **unnecessary, misleading, fragile, or costly to maintain**.

---

# Risk Classification

Classify each cleanup candidate:

### Low Risk
Safe to remove/refactor with strong repository evidence.

Examples:

- Confirmed unused local variable
- Confirmed unused private helper
- Clearly unused import
- Duplicate code with identical behavior and complete test coverage

### Medium Risk
Likely safe but requires targeted verification.

Examples:

- Unused exported symbol
- Suspected unused component
- Dependency used indirectly
- Shared helper consolidation

### High Risk
Do not remove automatically.

Examples:

- Public API
- Plugin/extension point
- Dynamically loaded module
- Configuration-driven behavior
- Reflection-based usage
- Deployment/infrastructure code
- Code with unclear external consumers

---

# Finding Format

Every significant finding should include:

- **Location** — file and symbol/section
- **Category** — dead code, duplication, unused component, dependency, complexity, etc.
- **Evidence** — what repository evidence supports the finding
- **Confidence** — confirmed / likely / uncertain
- **Risk** — low / medium / high
- **Impact** — maintenance, readability, build size, runtime, developer experience, etc.
- **Recommendation** — remove, consolidate, simplify, investigate, or keep
- **Verification** — tests/checks required after the change

Example:

```text
### `src/utils/legacyParser.ts`

- Category: Unused file
- Evidence: No imports, exports, route references, scripts, or dynamic references found.
- Confidence: Confirmed
- Risk: Low
- Impact: Removes obsolete parsing logic.
- Recommendation: Delete the file.
- Verification: Run unit tests and production build.
```

---

# Prioritization

Rank findings using:

**Priority = confidence × impact × safety**

Prioritize:

1. Confirmed dead code with low removal risk
2. Obsolete dependencies and assets
3. Exact duplication
4. Redundant abstractions
5. Unreachable logic
6. Larger architectural simplifications
7. Uncertain or dynamically referenced code

Do not spend disproportionate effort on trivial cosmetic cleanup while significant technical debt remains.

---

# Cleanup Plan

Produce an actionable plan grouped into phases.

## Phase 1 — Safe Deletions

- Remove confirmed unused files
- Remove unused imports/variables
- Remove obsolete exports
- Remove clearly unused dependencies
- Remove stale assets

## Phase 2 — Consolidation

- Merge genuinely duplicated helpers
- Consolidate repeated validation
- Share common UI behavior
- Remove redundant implementations

## Phase 3 — Simplification

- Flatten unnecessary control flow
- Remove redundant state
- Reduce needless abstractions
- Simplify data transformations
- Eliminate duplicate sources of truth

## Phase 4 — Verification

Run the strongest applicable checks:

- Unit tests
- Integration tests
- End-to-end tests
- Type checking
- Linting
- Formatting checks
- Production build
- Static analysis
- Dependency validation

If a check cannot be run, state why.

---

# Execution Rules

If the user asks only for an audit:

- **Do not modify files.**
- Return findings and a cleanup plan.

If the user explicitly asks to perform cleanup:

1. Start with low-risk, high-confidence changes.
2. Make focused edits.
3. Avoid unrelated refactoring.
4. Preserve public behavior and APIs unless explicitly authorized.
5. Run available verification checks.
6. Report exactly what changed.
7. Report any remaining uncertain findings.

If a proposed deletion could break dynamic behavior and that behavior cannot be verified, do not delete it automatically.

---

# Final Report Format

Return the audit using this structure:

## Executive Summary

Briefly state:

- Overall codebase cleanliness
- Biggest sources of technical debt
- Estimated cleanup impact
- Highest-priority actions

## Unused Files & Dead Code

| Location | Finding | Evidence | Confidence | Risk | Action |
|---|---|---|---|---|---|

## Duplicate Logic

| Locations | Duplication | Recommended Consolidation | Risk |
|---|---|---|---|

## Unused Components & Dependencies

| Location/Package | Finding | Evidence | Confidence | Action |
|---|---|---|---|---|

## Complexity & Cleanup Actions

| Location | Problem | Simplification | Expected Benefit |
|---|---|---|---|

## Recommended Cleanup Order

1. ...
2. ...
3. ...

## Verification Plan

- [ ] Tests
- [ ] Type check
- [ ] Lint
- [ ] Build
- [ ] Static/dependency analysis
- [ ] Manual verification where necessary

## Risks & Uncertainties

Explicitly list anything that could not be proven unused or safe to change.

## Definition of Done

The cleanup is complete when:

- Confirmed dead code is removed
- Unnecessary duplication is consolidated
- Abandoned components are removed
- Unused dependencies/assets are addressed
- Unnecessary complexity is reduced
- Tests/type checks/lint/build pass where applicable
- No unexplained behavior changes are introduced
- Remaining uncertain findings are documented
