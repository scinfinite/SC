export type AngleMode = "deg" | "rad";

export class CalcError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalcError";
  }
}

const FUNCTIONS = new Set([
  "sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt", "abs", "fact",
]);

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

type Tok =
  | { t: "num"; v: number }
  | { t: "op"; v: string }
  | { t: "lparen" }
  | { t: "rparen" }
  | { t: "fn"; v: string }
  | { t: "const"; v: string }
  | { t: "pct" }
  | { t: "pow" }
  | { t: "fact" }
  | { t: "unary"; v: "+" | "-" };

function factorial(n: number): number {
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) throw new CalcError("Invalid factorial");
  if (n > 170) throw new CalcError("Overflow");
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function toRad(x: number, mode: AngleMode): number {
  return mode === "deg" ? (x * Math.PI) / 180 : x;
}

function fromRad(x: number, mode: AngleMode): number {
  return mode === "deg" ? (x * 180) / Math.PI : x;
}

function applyFn(name: string, x: number, mode: AngleMode): number {
  switch (name) {
    case "sin": return Math.sin(toRad(x, mode));
    case "cos": return Math.cos(toRad(x, mode));
    case "tan": {
      const r = Math.tan(toRad(x, mode));
      if (!Number.isFinite(r)) throw new CalcError("Undefined");
      return r;
    }
    case "asin":
      if (x < -1 || x > 1) throw new CalcError("Invalid input");
      return fromRad(Math.asin(x), mode);
    case "acos":
      if (x < -1 || x > 1) throw new CalcError("Invalid input");
      return fromRad(Math.acos(x), mode);
    case "atan": return fromRad(Math.atan(x), mode);
    case "log":
      if (x <= 0) throw new CalcError("Invalid input");
      return Math.log10(x);
    case "ln":
      if (x <= 0) throw new CalcError("Invalid input");
      return Math.log(x);
    case "sqrt":
      if (x < 0) throw new CalcError("Invalid input");
      return Math.sqrt(x);
    case "abs": return Math.abs(x);
    case "fact": return factorial(x);
    default: throw new CalcError("Unknown function");
  }
}

function tokenize(input: string): Tok[] {
  const s = input.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/π/g, "pi");
  const tokens: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      let dots = 0;
      while (j < s.length && /[0-9.]/.test(s[j])) {
        if (s[j] === ".") dots++;
        j++;
      }
      if (dots > 1) throw new CalcError("Invalid number");
      const raw = s.slice(i, j);
      if (raw === "." || raw === "") throw new CalcError("Invalid number");
      tokens.push({ t: "num", v: Number(raw) });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      const name = s.slice(i, j).toLowerCase();
      if (FUNCTIONS.has(name)) tokens.push({ t: "fn", v: name });
      else if (name in CONSTANTS) tokens.push({ t: "const", v: name });
      else throw new CalcError("Unknown symbol");
      i = j;
      continue;
    }
    if (c === "(") { tokens.push({ t: "lparen" }); i++; continue; }
    if (c === ")") { tokens.push({ t: "rparen" }); i++; continue; }
    if (c === "%") { tokens.push({ t: "pct" }); i++; continue; }
    if (c === "^") { tokens.push({ t: "pow" }); i++; continue; }
    if (c === "!") { tokens.push({ t: "fact" }); i++; continue; }
    if ("+-*/".includes(c)) { tokens.push({ t: "op", v: c }); i++; continue; }
    throw new CalcError("Invalid character");
  }
  return tokens;
}

function withUnary(tokens: Tok[]): Tok[] {
  const out: Tok[] = [];
  for (const tok of tokens) {
    if (tok.t === "op" && (tok.v === "+" || tok.v === "-")) {
      const prev = out[out.length - 1];
      const unary = !prev || prev.t === "op" || prev.t === "lparen" || prev.t === "fn" || prev.t === "pow";
      if (unary) out.push({ t: "unary", v: tok.v });
      else out.push(tok);
    } else out.push(tok);
  }
  return out;
}

function evaluateTokens(tokens: Tok[], mode: AngleMode): number {
  let pos = 0;
  const peek = () => tokens[pos];
  const take = () => {
    const t = tokens[pos++];
    if (!t) throw new CalcError("Invalid expression");
    return t;
  };

  function parseAdd(): number {
    let left = parseMul();
    while (peek()?.t === "op" && "+-".includes((peek() as { v: string }).v)) {
      const op = take() as { t: "op"; v: string };
      const right = parseMul();
      left = op.v === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseMul(): number {
    let left = parsePow();
    while (true) {
      const p = peek();
      if (p?.t === "op" && (p.v === "*" || p.v === "/")) {
        take();
        const right = parsePow();
        if (p.v === "/") {
          if (right === 0) throw new CalcError("Cannot divide by zero");
          left = left / right;
        } else left = left * right;
        continue;
      }
      if (p && (p.t === "lparen" || p.t === "const" || p.t === "fn" || p.t === "num")) {
        const prev = tokens[pos - 1];
        if (prev && (prev.t === "num" || prev.t === "const" || prev.t === "rparen" || prev.t === "pct" || prev.t === "fact")) {
          left *= parsePow();
          continue;
        }
      }
      break;
    }
    return left;
  }

  function parsePow(): number {
    const left = parseUnary();
    if (peek()?.t === "pow") {
      take();
      const right = parsePow();
      const r = left ** right;
      if (!Number.isFinite(r)) throw new CalcError("Overflow");
      return r;
    }
    return left;
  }

  function parseUnary(): number {
    const p = peek();
    if (p?.t === "unary") {
      take();
      const v = parseUnary();
      return p.v === "-" ? -v : v;
    }
    return parsePostfix();
  }

  function parsePostfix(): number {
    let v = parsePrimary();
    while (true) {
      const p = peek();
      if (p?.t === "pct") { take(); v = v / 100; continue; }
      if (p?.t === "fact") { take(); v = factorial(v); continue; }
      break;
    }
    return v;
  }

  function parsePrimary(): number {
    const p = peek();
    if (!p) throw new CalcError("Invalid expression");
    if (p.t === "num") { take(); return p.v; }
    if (p.t === "const") { take(); return CONSTANTS[p.v]; }
    if (p.t === "fn") {
      take();
      if (peek()?.t !== "lparen") throw new CalcError("Expected (");
      take();
      const arg = parseAdd();
      if (peek()?.t !== "rparen") throw new CalcError("Unbalanced parentheses");
      take();
      return applyFn(p.v, arg, mode);
    }
    if (p.t === "lparen") {
      take();
      const v = parseAdd();
      if (peek()?.t !== "rparen") throw new CalcError("Unbalanced parentheses");
      take();
      return v;
    }
    throw new CalcError("Invalid expression");
  }

  const result = parseAdd();
  if (pos !== tokens.length) throw new CalcError("Invalid expression");
  if (!Number.isFinite(result)) throw new CalcError("Overflow");
  return result;
}

export function evaluate(expression: string, mode: AngleMode = "deg"): number {
  const trimmed = expression.trim();
  if (!trimmed) throw new CalcError("Empty expression");
  return evaluateTokens(withUnary(tokenize(trimmed)), mode);
}

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  if (Object.is(n, -0)) return "0";
  const abs = Math.abs(n);
  if ((abs !== 0 && abs < 1e-9) || abs >= 1e12) {
    return n.toExponential(8).replace(/\.?0+e/, "e").replace(/e\+/, "e+");
  }
  return Number(n.toPrecision(12)).toString();
}
