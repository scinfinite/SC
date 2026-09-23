# AGENTS.md — SC Calculator Continuous Development Workflow

## Mission

Build and maintain SC Calculator as a production-quality calculator web application. Work continuously through the roadmap while keeping the repository runnable, tested, documented, and synchronized with main.

Canonical product specification: docs/SC-CALCULATOR.md  
Canonical delivery plan: docs/ROADMAP.md

## Operating rules

1. Read README.md, docs/SC-CALCULATOR.md, and docs/ROADMAP.md before substantial work.
2. Determine the current phase from docs/ROADMAP.md.
3. Inspect the existing implementation before changing architecture.
4. Prefer small coherent changes over speculative rewrites.
5. Keep the application runnable after each meaningful step.
6. Never mark work complete without verification.
7. Fix root causes rather than masking failures.
8. Update documentation when behavior, architecture, commands, or status changes.
9. Never knowingly push a failing build to main.
10. Preserve unrelated functionality.

## Continuous loop

### 1. Inspect
- Read current README and roadmap.
- Inspect relevant source, tests, configuration, and CI.
- Choose the smallest useful next slice.

### 2. Implement
- Implement the selected slice.
- Keep UI, state, calculation logic, and utilities separated appropriately.
- Maintain responsive and accessible behavior.
- Add or update tests with behavior changes.

### 3. Verify locally

Run every applicable project command, normally:
- formatter check;
- lint;
- type check;
- unit/component tests;
- end-to-end tests;
- production build.

If a command does not exist for the current stack, document that fact rather than inventing a result.

### 4. Diagnose and repair

When verification fails:
1. Read the complete failure.
2. Identify the root cause.
3. Fix it.
4. Re-run the failed check.
5. Re-run the relevant full suite.
6. Repeat until green or a genuine external blocker is documented.

Never bypass a test simply to obtain a green result.

### 5. Review

Before committing:
- Review the diff.
- Check for accidental files or secrets.
- Check responsive behavior.
- Check keyboard/focus behavior.
- Check animation and reduced-motion behavior.
- Check calculator correctness for affected operations.
- Confirm documentation consistency.

### 6. Commit

Use focused commit messages such as:
- feat: build core calculator engine
- feat: add calculator history
- feat: polish glassmorphism motion
- fix: handle division by zero
- test: expand calculator edge cases
- docs: update roadmap status

### 7. Push and main verification

When permissions and branch policy allow:
- Push the verified change.
- If working on a feature branch, use the repository's pull-request policy.
- Verify the resulting main commit.
- Inspect CI status for that commit.
- If CI fails, return to diagnosis and repair.

Do not claim a push, merge, or CI result unless actually verified.

## Automatic phase transition

When every exit criterion in the current phase is satisfied:

1. Update docs/ROADMAP.md to the next phase.
2. Mark the previous phase as passed.
3. Update README.md with the new status.
4. Run applicable documentation checks.
5. Commit the status transition.
6. Push/merge to main according to repository policy.
7. Verify main and CI.
8. Begin the next phase from its first incomplete item.

If any exit criterion fails, do not transition phases.

## Issue handling

- Identify whether an issue blocks the current phase.
- Fix blockers before advancing.
- Add regression tests where practical.
- Keep non-blocking improvements scoped.
- Record important follow-up work in the roadmap or issue tracker.

## CI expectations

The intended pipeline is:

Install → Format check → Lint → Type check → Unit/component tests → E2E tests → Production build → Main/release verification

If CI does not exist, introduce it during foundation work. Use the actual package manager and commands of the project.

## Calculator correctness

- Never use unrestricted eval for calculator expressions.
- Keep expression evaluation deterministic and testable.
- Explicitly test divide-by-zero and invalid syntax.
- Separate display formatting from calculation state.
- Document intentional calculator-semantic decisions.

## UI quality bar

SC Calculator should feel premium and intentional:
- consistent glass surfaces;
- controlled blur and shadows;
- clear hierarchy;
- smooth but restrained animation;
- responsive layout;
- strong focus states;
- reduced-motion support;
- no animation that blocks input;
- no visual polish that compromises readability or performance.

## Completion standard

A task is complete only when implementation works, important behavior is tested, quality checks pass, documentation is current, the repository remains buildable, and the change is committed. Main must be verified green whenever the workflow requires a main-branch update.

Continuous workflow:

Inspect → Implement → Test → Fix → Review → Commit → Push/Merge → Verify CI → Transition phase when green → Repeat
