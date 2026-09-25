# SC Calculator

A premium, fully functional calculator web app with a layered glassmorphism UI, safe expression evaluation, scientific mode, history, memory, keyboard support, and theme/animation preferences.

## Status

**Current phase:** Phase 3 complete — production-ready core  
**Stack:** Vite + React + TypeScript  
**Specification:** docs/SC-CALCULATOR.md  
**Roadmap:** docs/ROADMAP.md  
**Workflow:** AGENTS.md

## Features

- Arithmetic with operator precedence, decimals, percentages, square, reciprocal, and sign toggle
- Clear, delete, parentheses, and equals
- Scientific mode: sin/cos/tan, asin/acos/atan, log/ln, sqrt, abs, square, reciprocal, powers, factorial, π, e, DEG/RAD
- Memory: MC, MR, M+, M-, MS with live value and toast feedback
- Calculation history with local persistence and one-tap reuse
- Light / dark / system theme with smooth transitions
- Polished glassmorphism: layered surfaces, ambient lighting, and restrained motion
- Keyboard (full), pointer, and touch input; comfortable touch targets
- Accessible labels, live region, visible focus, reduced-motion support
- Safe hand-written parser — no unrestricted `eval()`

## Commands

```bash
npm install
npm run dev
npm test
npm run lint
npm run typecheck
npm run build
```

## Evaluation notes

- `^` is right-associative (`2^3^2` = 512)
- `%` divides the preceding value by 100
- Implicit multiplication is supported (`2π`, `2(3+4)`)
- Division by zero and invalid input produce recoverable errors
