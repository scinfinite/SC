# SC

Let's start working.

## Projects

### Glassmorphism Calculator

A modern calculator with frosted-glass UI, animated background, keyboard support, and tested engine logic.

**Use it:** open [`calculator/index.html`](calculator/index.html) in a browser.

**Files**
- `calculator/index.html` — markup
- `calculator/styles.css` — glass UI
- `calculator/calc.js` — calculation engine (browser + Node)
- `calculator/app.js` — UI wiring and keyboard
- `calculator/calc.test.js` — unit tests

**Tests / CI**

```bash
node calculator/calc.test.js
```

GitHub Actions runs these tests on every push and pull request to `main` (`.github/workflows/ci.yml`).

**Keyboard**
- Digits and `.` to enter numbers
- `+ - * /` operators
- `Enter` or `=` to evaluate
- `Escape` or `C` to clear
- `Backspace` to delete a digit
- `%` for percent
