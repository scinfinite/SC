# SC Calculator — Product & Technical Specification

## Overview

SC Calculator is a premium, fully functional calculator web application with a polished glassmorphism interface. It should be fast, responsive, accessible, maintainable, and production-ready on mobile, tablet, and desktop.

## Product goals

- Reliable everyday arithmetic with deterministic behavior.
- Premium glassmorphism visual design without sacrificing usability.
- Common advanced/scientific calculator operations.
- Calculation history and useful local preferences.
- Keyboard, touch, and pointer support.
- Smooth, purposeful animation with reduced-motion support.
- Automated verification before changes reach main.

## Core features

### Essential operations

- Addition, subtraction, multiplication, and division.
- Decimal input.
- Percentage.
- Sign toggle.
- Clear all and clear entry.
- Delete/backspace.
- Equals/evaluate.
- Operator precedence.
- Parentheses.
- Division-by-zero and invalid-expression handling.

### Advanced operations

- Square and square root.
- Reciprocal.
- Exponent/power.
- Memory: MC, MR, M+, M-, MS.
- Constants such as pi and e.
- Optional scientific functions: sin, cos, tan, inverse trig, log, ln, factorial, and absolute value.

Advanced functions should live in a compact scientific/advanced mode so the default calculator remains clean.

### History

- Store recent calculations locally.
- Show expression and result.
- Reuse a history item.
- Clear history.
- Handle empty history gracefully.
- Bound storage so it cannot grow without limit.

### Preferences

- Light/dark/system appearance where practical.
- Reduced-motion behavior.
- Persist non-sensitive UI preferences locally.

## Visual and UX direction

Use a premium glassmorphism system:

- Translucent surfaces.
- Backdrop blur with graceful fallback.
- Soft borders and layered shadows.
- Subtle radial/linear background lighting.
- High-contrast display area.
- Distinct hierarchy for numbers, operators, actions, and equals.
- Consistent radius, spacing, and typography.
- Controlled glow and gradients rather than excessive decoration.

Recommended structure:

1. App shell and brand area.
2. Display panel with expression and result.
3. Utility/action row.
4. Calculator keypad.
5. Optional scientific panel.
6. History drawer/panel.
7. Settings/theme controls.

The keypad must remain comfortable on narrow screens without horizontal scrolling.

## Animation system

Animations should communicate state and hierarchy:

- App entrance fade/scale.
- Glass panel reveal.
- Button hover lift on pointer devices.
- Button press feedback.
- Result transition after evaluation.
- Operator-state highlighting.
- History drawer slide/fade.
- Theme transition.
- Toast/notification transitions.
- Subtle ambient background motion only when performant.

Prefer transform and opacity. Avoid layout-thrashing animations. Respect prefers-reduced-motion. Keep interaction feedback short and never make the user wait before input is accepted.

## Calculator engine

Keep calculation logic separate from UI rendering.

Responsibilities:

- Tokenization/parsing.
- Operator precedence.
- Unary operators.
- Parentheses.
- Function calls.
- Constants.
- Numeric formatting.
- Error normalization.

Never evaluate arbitrary input with unrestricted eval-style execution. Use a controlled parser/evaluator or a vetted expression engine with a restricted function set.

Floating-point edge cases require explicit tests. Formatting must not mutate the underlying calculation state.

## Accessibility

The application must provide:

- Semantic buttons.
- Accessible names for icon-only controls.
- Visible focus indicators.
- Logical keyboard navigation.
- Sufficient contrast.
- Screen-reader-friendly display updates.
- Reduced motion.
- Comfortable touch targets.
- State communication that does not rely on color alone.
- Recoverable, understandable error messages.

Keyboard support should include numbers, decimal point, operators, Enter/equals, Escape/clear, Backspace/delete, and parentheses where applicable.

## Responsive behavior

Target small phones, large phones, tablets, laptops, desktops, and wide displays. Support portrait and landscape. Avoid fixed dimensions that cause clipping. Use responsive grid/flex layouts and sensible max-width constraints.

## Performance

- Keep the initial bundle lean.
- Avoid unnecessary animation dependencies.
- Lazy-load nonessential panels where useful.
- Limit expensive backdrop-filter layers on low-power devices.
- Prefer efficient transforms for motion.
- Avoid unnecessary component re-renders.

## Error handling

Handle division by zero, invalid syntax, unbalanced parentheses, invalid function arguments, unsupported numeric results, and local-storage failures without leaving the calculator stuck.

## Testing strategy

### Unit tests

Cover arithmetic, precedence, parentheses, decimals, unary operations, percentage semantics, advanced functions, memory, formatting, and error states.

### UI/component tests

Cover pointer/touch input, keyboard input, clear/delete behavior, history, settings, accessibility labels, and focus behavior.

### End-to-end tests

Cover opening the app, entering an expression, evaluating, verifying the result, opening history, reusing a result, changing supported settings, and reloading persisted state.

## CI quality gates

Every implementation change should pass applicable:

- Formatting check.
- Lint.
- Type checking.
- Unit/component tests.
- End-to-end tests.
- Production build.
- Appropriate dependency/security checks.

A phase is complete only when implementation and verification gates pass.

## Definition of done

A feature is done when it matches the UX system, works with relevant input methods, has appropriate tests, is responsive and accessible, handles failure states, passes CI, and introduces no known blocking regression.

## Suggested structure

Use the framework's conventions, while keeping concerns separated:

docs/
  SC-CALCULATOR.md
  ROADMAP.md
src/
  components/
  calculator/
  hooks/
  styles/
  utils/
  tests/
public/
.github/
  workflows/
AGENTS.md
README.md

## Delivery principle

Build in vertical slices rather than creating a large unfinished UI first. Keep the application runnable. Prefer small reviewable commits and verify the repository after each meaningful change.

The visual target is premium and polished, but correctness is non-negotiable: a beautiful calculator that produces incorrect results is not complete.
