import { evaluate, formatNumber, type AngleMode } from "./engine.ts";

export type HistoryItem = { id: string; expression: string; result: string };
export type MemoryOp = "MC" | "MR" | "M+" | "M-" | "MS";
export type CalcState = {
  expression: string;
  result: string;
  error: string | null;
  justEvaluated: boolean;
  memory: number;
  history: HistoryItem[];
  angleMode: AngleMode;
};

export const MAX_HISTORY = 50;

export function initialState(overrides: Partial<CalcState> = {}): CalcState {
  return {
    expression: "",
    result: "0",
    error: null,
    justEvaluated: false,
    memory: 0,
    history: [],
    angleMode: "deg",
    ...overrides,
  };
}

function lastIsOperator(expr: string): boolean {
  return /[+\-*/^]$/.test(expr.replace(/\s+/g, ""));
}

export function inputDigit(state: CalcState, digit: string): CalcState {
  if (state.justEvaluated) {
    return { ...state, expression: digit, result: digit, error: null, justEvaluated: false };
  }
  return { ...state, expression: state.expression + digit, error: null };
}

export function inputDecimal(state: CalcState): CalcState {
  if (state.justEvaluated) {
    return { ...state, expression: "0.", result: "0.", error: null, justEvaluated: false };
  }
  const parts = state.expression.split(/[+\-*/^()%]/);
  const last = parts[parts.length - 1] ?? "";
  if (last.includes(".")) return state;
  const expression =
    state.expression === "" || lastIsOperator(state.expression) || state.expression.endsWith("(")
      ? state.expression + "0."
      : state.expression + ".";
  return { ...state, expression, error: null };
}

export function inputOperator(state: CalcState, op: string): CalcState {
  const mapped = op === "×" ? "*" : op === "÷" ? "/" : op;
  if (state.justEvaluated) {
    return { ...state, expression: state.result + mapped, justEvaluated: false, error: null };
  }
  let expression = state.expression;
  if (!expression) {
    if (mapped === "-") return { ...state, expression: "-", error: null };
    return state;
  }
  if (lastIsOperator(expression)) {
    if (mapped === "-" && !expression.endsWith("-")) expression += "-";
    else expression = expression.replace(/[+\-*/^]+$/, mapped);
  } else expression += mapped;
  return { ...state, expression, error: null };
}

export function inputParen(state: CalcState, paren: "(" | ")"): CalcState {
  if (state.justEvaluated) {
    const expression = paren === "(" ? "(" : state.result + ")";
    return { ...state, expression, justEvaluated: false, error: null };
  }
  return { ...state, expression: state.expression + paren, error: null };
}

export function inputConstant(state: CalcState, name: "pi" | "e"): CalcState {
  const token = name === "pi" ? "π" : "e";
  if (state.justEvaluated) return { ...state, expression: token, justEvaluated: false, error: null };
  return { ...state, expression: state.expression + token, error: null };
}

export function inputFunction(state: CalcState, name: string): CalcState {
  const token = `${name}(`;
  if (state.justEvaluated) return { ...state, expression: token, justEvaluated: false, error: null };
  return { ...state, expression: state.expression + token, error: null };
}

export function inputFactorial(state: CalcState): CalcState {
  const token = "!";
  if (state.justEvaluated) {
    return { ...state, expression: state.result + token, justEvaluated: false, error: null };
  }
  return { ...state, expression: state.expression + token, error: null };
}

function currentTerm(state: CalcState): string {
  if (state.justEvaluated && state.error === null) return state.result;
  const expr = state.expression.trim();
  return expr || state.result || "0";
}

function wrapExpression(state: CalcState, wrap: (term: string) => string): CalcState {
  const term = currentTerm(state);
  return { ...state, expression: wrap(term), error: null, justEvaluated: false };
}

export function inputSquare(state: CalcState): CalcState {
  return wrapExpression(state, (term) => `(${term})^2`);
}

export function inputReciprocal(state: CalcState): CalcState {
  return wrapExpression(state, (term) => `1/(${term})`);
}

export function sanitizeHistory(raw: unknown): HistoryItem[] {
  if (!Array.isArray(raw)) return [];
  const items: HistoryItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const rec = entry as Record<string, unknown>;
    if (typeof rec.id !== "string" || typeof rec.expression !== "string" || typeof rec.result !== "string") continue;
    if (!rec.id || rec.expression.length > 200 || rec.result.length > 80) continue;
    items.push({ id: rec.id, expression: rec.expression, result: rec.result });
    if (items.length >= MAX_HISTORY) break;
  }
  return items;
}

export function applyPercent(state: CalcState): CalcState {
  if (state.justEvaluated) return { ...state, expression: state.result + "%", justEvaluated: false, error: null };
  if (!state.expression) return state;
  return { ...state, expression: state.expression + "%", error: null };
}

export function toggleSign(state: CalcState): CalcState {
  if (state.justEvaluated) {
    const n = Number(state.result);
    if (!Number.isFinite(n)) return state;
    const next = formatNumber(-n);
    return { ...state, expression: next, result: next, error: null, justEvaluated: true };
  }
  const expr = state.expression;
  const match = expr.match(/(-?\d*\.?\d+)(?!.*\d)/);
  if (!match || match.index === undefined) {
    if (!expr) return { ...state, expression: "-", error: null };
    return { ...state, expression: `-(${expr})`, error: null };
  }
  const num = match[0];
  const start = match.index;
  const flipped = num.startsWith("-") ? num.slice(1) : `-${num}`;
  return { ...state, expression: expr.slice(0, start) + flipped + expr.slice(start + num.length), error: null };
}

export function backspace(state: CalcState): CalcState {
  if (state.justEvaluated) return { ...state, justEvaluated: false };
  return { ...state, expression: state.expression.slice(0, -1), error: null };
}

export function clearAll(state: CalcState): CalcState {
  return { ...state, expression: "", result: "0", error: null, justEvaluated: false };
}

export function clearEntry(state: CalcState): CalcState {
  return { ...state, expression: "", error: null, justEvaluated: false };
}

export function equals(state: CalcState): CalcState {
  const expr = state.expression.trim();
  if (!expr) return state;
  try {
    const value = evaluate(expr.replace(/π/g, "pi"), state.angleMode);
    const result = formatNumber(value);
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      expression: expr,
      result,
    };
    return { ...state, result, error: null, justEvaluated: true, history: [item, ...state.history].slice(0, MAX_HISTORY) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    return { ...state, error: message, result: message, justEvaluated: true };
  }
}

export function applyMemory(state: CalcState, op: MemoryOp): CalcState {
  const current = (() => {
    try {
      if (state.justEvaluated && state.error === null) return Number(state.result);
      if (!state.expression) return 0;
      return evaluate(state.expression.replace(/π/g, "pi"), state.angleMode);
    } catch {
      return NaN;
    }
  })();
  switch (op) {
    case "MC": return { ...state, memory: 0 };
    case "MR": {
      const mem = formatNumber(state.memory);
      if (state.justEvaluated) return { ...state, expression: mem, justEvaluated: false, error: null };
      return { ...state, expression: state.expression + mem, error: null };
    }
    case "MS":
      if (!Number.isFinite(current)) return { ...state, error: "Invalid memory" };
      return { ...state, memory: current };
    case "M+":
      if (!Number.isFinite(current)) return { ...state, error: "Invalid memory" };
      return { ...state, memory: state.memory + current };
    case "M-":
      if (!Number.isFinite(current)) return { ...state, error: "Invalid memory" };
      return { ...state, memory: state.memory - current };
  }
}

export function reuseHistory(state: CalcState, item: HistoryItem): CalcState {
  return { ...state, expression: item.result, result: item.result, error: null, justEvaluated: true };
}

export function clearHistory(state: CalcState): CalcState {
  return { ...state, history: [] };
}

export function toggleAngleMode(state: CalcState): CalcState {
  return { ...state, angleMode: state.angleMode === "deg" ? "rad" : "deg" };
}
