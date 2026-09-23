# SC Calculator Roadmap

## Status

**Current phase: Phase 1 — Foundation & Core Calculator**

The roadmap has three detailed phases. Each phase produces a usable increment and ends with verification before the workflow advances.

## Phase 1 — Foundation & Core Calculator

### Objective

Create the production foundation, calculator engine, responsive glassmorphism shell, and essential interactions.

### Work items

#### Repository and architecture
- Establish framework and build tooling appropriate to the repository.
- Define maintainable source structure.
- Establish formatting, linting, testing, and build commands.
- Add baseline CI when the application stack is ready.
- Document local development and verification commands.

#### Visual foundation
- Establish design tokens for colors, glass opacity, borders, blur, shadows, radius, spacing, typography, and motion.
- Build responsive app shell.
- Implement premium glass calculator surface.
- Create display panel and keypad grid.
- Add hover, press, and focus states.

#### Calculator engine
- Expression state.
- Addition, subtraction, multiplication, division.
- Decimal input.
- Percentage and sign toggle.
- Clear and delete.
- Equals.
- Operator precedence.
- Safe error states.
- Numeric formatting.

#### Input
- Mouse/pointer input.
- Touch input.
- Keyboard input.
- Reject unsupported keyboard characters.

#### Testing
- Unit tests for arithmetic and edge cases.
- Component tests for core interactions.
- End-to-end smoke coverage where supported.

### Phase 1 exit criteria

- App runs locally.
- Core arithmetic is correct.
- Keyboard and touch input work.
- Responsive layout works on mobile and desktop.
- Core accessibility requirements are implemented.
- Lint/type/test/build checks pass.
- No known blocker remains.

**Advance rule:** after all exit criteria pass, update the roadmap to Phase 2 and begin Phase 2.

## Phase 2 — Advanced Features, History & Motion Polish

### Objective

Turn the core calculator into a feature-complete daily calculator and refine interaction quality.

### Work items

#### Advanced calculator
- Square root, square, reciprocal, and powers.
- Parentheses.
- pi and e.
- Scientific functions through an expandable mode.
- Memory: MC, MR, M+, M-, MS.
- Consistent unary and percentage behavior.

#### History
- History panel/drawer.
- Local persistence.
- Reuse expression/result.
- Clear history.
- Empty and error states.
- Bounded history size.

#### Settings
- Theme preference.
- System theme where practical.
- Reduced-motion behavior.
- Persist supported preferences.

#### Motion
- Entrance animation.
- Key press feedback.
- Display/result transitions.
- Operator-state transitions.
- History drawer transitions.
- Settings transitions.
- Reduced-motion alternatives.

#### Quality
- Expand unit/component coverage.
- Accessibility assertions.
- Persistence/reload tests.
- Error recovery tests.
- Verify animations never block input.

### Phase 2 exit criteria

- Advanced features are correct and tested.
- History is reliable.
- Preferences persist safely.
- Motion is consistent.
- Reduced motion works.
- CI passes.
- No known blocker remains.

**Advance rule:** after all exit criteria pass, update the roadmap to Phase 3 and begin Phase 3.

## Phase 3 — Production Hardening & Release

### Objective

Make SC Calculator release-ready through comprehensive verification, performance work, accessibility hardening, and release documentation.

### Work items

#### UX refinement
- Review mobile, tablet, and desktop states.
- Fix spacing, typography, contrast, and alignment.
- Refine empty/error states.
- Verify focus behavior.
- Remove unfinished visual details.

#### Accessibility
- Keyboard-only audit.
- Screen-reader audit.
- Focus-visible audit.
- Contrast audit.
- Reduced-motion audit.
- Semantic/ARIA cleanup.

#### Performance
- Review production bundle.
- Remove unnecessary dependencies.
- Optimize expensive effects.
- Reduce unnecessary renders.
- Review backdrop blur and animation cost.
- Check lower-powered mobile performance.

#### Reliability
- Expand end-to-end coverage.
- Test unusual expressions and numerical edge cases.
- Test local-storage failures.
- Test rapid input.
- Test repeated equals/operator sequences.
- Test viewport and orientation changes.

#### CI/CD and release
- Ensure pull requests run all quality gates.
- Keep main green.
- Verify production build.
- Verify deployment configuration if enabled.
- Add release/readiness documentation.
- Record final status in README and roadmap.

### Phase 3 exit criteria

- Full test suite passes.
- Lint/type checks pass.
- Production build passes.
- Accessibility checks pass for supported scope.
- Performance has been reviewed.
- Documentation is current.
- Main is verified green.
- Release readiness is explicitly recorded.

**Completion rule:** Phase 3 is complete only after every exit criterion passes.

## Continuous phase transition protocol

At every phase boundary:

1. Run the complete applicable verification suite.
2. Fix failures at their root.
3. Re-run verification.
4. Review changed files and documentation.
5. Commit the completed work.
6. Push/merge to main according to repository policy.
7. Verify the resulting main commit and CI status.
8. Update this roadmap's current phase and checklist.
9. Start the next phase only after the previous phase is green.

Never advance because work is merely mostly finished.
