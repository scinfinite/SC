import { useEffect, useMemo, useReducer } from "react";
import "./styles/app.css";
import {
  applyMemory,
  applyPercent,
  backspace,
  clearAll,
  clearEntry,
  clearHistory,
  equals,
  initialState,
  inputConstant,
  inputDecimal,
  inputDigit,
  inputFunction,
  inputOperator,
  inputParen,
  reuseHistory,
  toggleAngleMode,
  toggleSign,
  type CalcState,
} from "./calculator/session";

type Prefs = { theme: "system" | "light" | "dark"; scientific: boolean };
const PREF_KEY = "sc-calculator-prefs";
const HIST_KEY = "sc-calculator-history";

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? { theme: "system", scientific: false, ...JSON.parse(raw) } : { theme: "system", scientific: false };
  } catch {
    return { theme: "system", scientific: false };
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

type Action =
  | { type: "digit"; v: string }
  | { type: "op"; v: string }
  | { type: "dot" }
  | { type: "eq" }
  | { type: "ac" }
  | { type: "ce" }
  | { type: "del" }
  | { type: "sign" }
  | { type: "pct" }
  | { type: "paren"; v: "(" | ")" }
  | { type: "fn"; v: string }
  | { type: "const"; v: "pi" | "e" }
  | { type: "mem"; v: "MC" | "MR" | "M+" | "M-" | "MS" }
  | { type: "hist"; id: string }
  | { type: "clearHist" }
  | { type: "angle" };

function reducer(state: CalcState, action: Action): CalcState {
  switch (action.type) {
    case "digit": return inputDigit(state, action.v);
    case "op": return inputOperator(state, action.v);
    case "dot": return inputDecimal(state);
    case "eq": return equals(state);
    case "ac": return clearAll(state);
    case "ce": return clearEntry(state);
    case "del": return backspace(state);
    case "sign": return toggleSign(state);
    case "pct": return applyPercent(state);
    case "paren": return inputParen(state, action.v);
    case "fn": return inputFunction(state, action.v);
    case "const": return inputConstant(state, action.v);
    case "mem": return applyMemory(state, action.v);
    case "hist": {
      const item = state.history.find((h) => h.id === action.id);
      return item ? reuseHistory(state, item) : state;
    }
    case "clearHist": return clearHistory(state);
    case "angle": return toggleAngleMode(state);
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState({ history: loadHistory() }));
  const [prefs, setPrefs] = useReducer((p: Prefs, n: Partial<Prefs>) => ({ ...p, ...n }), undefined, loadPrefs);

  const resolvedTheme = useMemo(() => {
    if (prefs.theme !== "system") return prefs.theme;
    if (typeof window === "undefined") return "dark";
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }, [prefs.theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  }, [prefs]);

  useEffect(() => {
    try { localStorage.setItem(HIST_KEY, JSON.stringify(state.history)); } catch { /* ignore */ }
  }, [state.history]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) dispatch({ type: "digit", v: k });
      else if (k === ".") dispatch({ type: "dot" });
      else if (k === "+" || k === "-" || k === "*" || k === "/" || k === "^") {
        dispatch({ type: "op", v: k });
        e.preventDefault();
      } else if (k === "Enter" || k === "=") {
        dispatch({ type: "eq" });
        e.preventDefault();
      } else if (k === "Backspace") dispatch({ type: "del" });
      else if (k === "Escape") dispatch({ type: "ac" });
      else if (k === "%") dispatch({ type: "pct" });
      else if (k === "(" || k === ")") dispatch({ type: "paren", v: k });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const live = state.error ?? (state.justEvaluated ? state.result : state.expression || "0");

  return (
    <div className="app">
      <div className="shell">
        <header className="brand">
          <div>
            <h1>SC Calculator</h1>
            <p>Glassmorphism scientific calculator</p>
          </div>
          <div className="toolbar">
            <button className="key" type="button" onClick={() => setPrefs({ scientific: !prefs.scientific })}>
              {prefs.scientific ? "Basic" : "Scientific"}
            </button>
            <button
              className="key"
              type="button"
              onClick={() => setPrefs({ theme: prefs.theme === "system" ? "dark" : prefs.theme === "dark" ? "light" : "system" })}
            >
              Theme: {prefs.theme}
            </button>
          </div>
        </header>
        <main className="calculator glass">
          <section>
            <div className="display glass" aria-live="polite" aria-atomic="true">
              <div className="expression">{state.expression || "\u00A0"}</div>
              <div className={`result${state.error ? " error" : ""}`}>{state.result}</div>
              <span className="sr-only">{live}</span>
            </div>
            <div className="pad">
              <div className="row mem">
                {(["MC", "MR", "M+", "M-", "MS"] as const).map((m) => (
                  <button key={m} className="key" type="button" onClick={() => dispatch({ type: "mem", v: m })}>{m}</button>
                ))}
              </div>
              <div className="row util">
                <button className="key danger" type="button" onClick={() => dispatch({ type: "ac" })}>AC</button>
                <button className="key" type="button" onClick={() => dispatch({ type: "ce" })}>CE</button>
                <button className="key" type="button" onClick={() => dispatch({ type: "del" })} aria-label="Delete">⌫</button>
                <button className="key op" type="button" onClick={() => dispatch({ type: "op", v: "÷" })}>÷</button>
              </div>
              {prefs.scientific && (
                <div className="sci">
                  <button className="key" type="button" onClick={() => dispatch({ type: "angle" })}>{state.angleMode.toUpperCase()}</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "paren", v: "(" })}>(</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "paren", v: ")" })}>)</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "fn", v: "sqrt" })}>√</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "op", v: "^" })}>xʸ</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "fn", v: "sin" })}>sin</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "fn", v: "cos" })}>cos</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "fn", v: "tan" })}>tan</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "fn", v: "ln" })}>ln</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "fn", v: "log" })}>log</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "const", v: "pi" })}>π</button>
                  <button className="key" type="button" onClick={() => dispatch({ type: "const", v: "e" })}>e</button>
                </div>
              )}
              <div className="keys">
                {["7", "8", "9"].map((d) => (
                  <button key={d} className="key" type="button" onClick={() => dispatch({ type: "digit", v: d })}>{d}</button>
                ))}
                <button className="key op" type="button" onClick={() => dispatch({ type: "op", v: "×" })}>×</button>
                {["4", "5", "6"].map((d) => (
                  <button key={d} className="key" type="button" onClick={() => dispatch({ type: "digit", v: d })}>{d}</button>
                ))}
                <button className="key op" type="button" onClick={() => dispatch({ type: "op", v: "-" })}>−</button>
                {["1", "2", "3"].map((d) => (
                  <button key={d} className="key" type="button" onClick={() => dispatch({ type: "digit", v: d })}>{d}</button>
                ))}
                <button className="key op" type="button" onClick={() => dispatch({ type: "op", v: "+" })}>+</button>
                <button className="key" type="button" onClick={() => dispatch({ type: "sign" })} aria-label="Toggle sign">±</button>
                <button className="key" type="button" onClick={() => dispatch({ type: "digit", v: "0" })}>0</button>
                <button className="key" type="button" onClick={() => dispatch({ type: "dot" })}>.</button>
                <button className="key equals" type="button" onClick={() => dispatch({ type: "eq" })}>=</button>
                <button className="key" type="button" onClick={() => dispatch({ type: "pct" })}>%</button>
              </div>
            </div>
          </section>
          <aside className="side">
            <section className="panel glass">
              <h2>History</h2>
              {state.history.length === 0 ? (
                <p className="empty">No calculations yet.</p>
              ) : (
                <>
                  <div className="history">
                    {state.history.map((item) => (
                      <button key={item.id} type="button" onClick={() => dispatch({ type: "hist", id: item.id })}>
                        <span className="expr">{item.expression}</span>
                        <span>{item.result}</span>
                      </button>
                    ))}
                  </div>
                  <button className="key" type="button" onClick={() => dispatch({ type: "clearHist" })}>Clear history</button>
                </>
              )}
            </section>
            <section className="panel glass">
              <h2>Memory</h2>
              <p className="empty">M = {state.memory}</p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}
