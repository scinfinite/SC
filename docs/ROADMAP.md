# SC Calculator Roadmap

## Status

**Current phase: Complete through Phase 3 — Production Hardening & Release**

Implementation lives on the application stack (Vite + React + TypeScript) with CI quality gates.

### Premium refinement (post-Phase 3)

- Elevated the glassmorphism design system: layered surfaces, ambient background lighting, soft borders, and controlled depth.
- Added purposeful motion: shell/key entrance, button hover-lift and press feedback, result/operator transitions, theme transitions, and toast notifications; fully gated by `prefers-reduced-motion`.
- Expanded scientific mode with absolute value, inverse trig (asin/acos/atan), and a factorial button.
- Added toast feedback for memory and history actions and fuller keyboard support (Delete, factorial).
- All quality gates (lint, typecheck, tests, production build) remain green.

### Hardening increment (square, reciprocal, history safety)

- Square (`x²`) and reciprocal (`1/x`) wrap the current term safely and evaluate through the existing parser.
- Basic keypad extras row: parentheses, square, reciprocal, square root.
- History load path rejects malformed, oversized, or incomplete persisted entries.
- Additional session/engine tests for parentheses, wrap ops, inverse trig, and chained division.
- Premium glassmorphism stylesheet kept intact (not replaced by compact stubs).

## Phase 1 — Foundation & Core Calculator

**Status: complete**

- Vite + React + TypeScript tooling, lint, typecheck, tests, production build
- Glassmorphism design tokens and responsive shell
- Core engine: + − × ÷, decimals, percent, sign, clear, delete, equals
- Safe parser/evaluator (no unrestricted eval)
- Keyboard, pointer, and touch input
- Accessibility: semantic buttons, focus rings, live region, reduced motion
- Divide-by-zero and invalid-expression handling
- GitHub Actions CI (lint, typecheck, test, build)

## Phase 2 — Advanced Features, History & Motion Polish

**Status: complete**

- Scientific mode: sqrt, powers, sin/cos/tan, log/ln, π, e, factorial, parentheses
- DEG/RAD toggle
- Memory MC/MR/M+/M-/MS
- History panel with reuse, clear, bounded local persistence
- Theme preference: light / dark / system, persisted
- Entrance and key interaction motion with reduced-motion disable
- Expanded unit tests for engine and session

## Phase 3 — Production Hardening & Release

**Status: complete**

- Responsive layout for mobile and desktop
- Focus-visible and screen-reader live updates
- Error recovery that does not lock the calculator
- Lean production bundle
- CI on main and phase branches
- README and roadmap updated to verified status
