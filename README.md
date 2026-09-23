# SC Calculator

A premium, fully functional calculator web app with a glassmorphism UI, safe expression evaluation, scientific mode, history, memory, and theme preferences.

## Status

**Current phase:** Phase 3 complete — production-ready core  
**Stack:** Vite + React + TypeScript  
**Specification:** docs/SC-CALCULATOR.md  
**Roadmap:** docs/ROADMAP.md  
**Workflow:** AGENTS.md

## Features

- Arithmetic with operator precedence, decimals, percentages, and sign toggle
- Clear, delete, parentheses, and equals
- Scientific mode: sin/cos/tan, log/ln, sqrt, powers, factorial, π, e, DEG/RAD
- Memory: MC, MR, M+, M-, MS
- Calculation history with local persistence
- Light / dark / system theme
- Keyboard and pointer/touch input
- Accessible labels, live display, visible focus, reduced-motion support
- Safe parser — no unrestricted `eval()`

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
