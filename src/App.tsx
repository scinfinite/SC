import {
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
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
  inputFactorial,
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
    return raw
      ? { theme: "system", scientific: false, ...JSON.parse(raw) }
      : { theme: "system", scientific: false };
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
  | { type: "fact" }
  | { type: "paren"; v: "(" | ")" }
  | { type: "fn"; v: string }
  | { type: "const"; v: "pi" | "e" }
  | { type: "mem"; v: "MC" | "MR" | "M+" | "M-" | "MS" }
  | { type: "hist"; id: string }
  | { type: "clearHist" }
  | { type: "angle" };

function reducer(state: CalcState, action: Action): CalcState {
  switch (action.type) {
    case "digit":
      return inputDigit(state, action.v);
    case "op":
      return inputOperator(state, action.v);
    case "dot":
      return inputDecimal(state);
    case "eq":
      return equals(state);
    case "ac":
      return clearAll(state);
    case "ce":
      return clearEntry(state);
    case "del":
      return backspace(state);
    case "sign":
      return toggleSign(state);
    case "pct":
      return applyPercent(state);
    case "fact":
      return inputFactorial(state);
    case "paren":
      return inputParen(state, action.v);
    case "fn":
      return inputFunction(state, action.v);
    case "const":
      return inputConstant(state, action.v);
    case "mem":
      return applyMemory(state, action.v);
    case "hist": {
      const item = state.history.find((h) => h.id === action.id);
      return item ? reuseHistory(state, item) : state;
    }
    case "clearHist":
      return clearHistory(state);
    case "angle":
      return toggleAngleMode(state);
    default:
      return state;
  }
}

type Toast = { id: number; message: string };
let toastSeq = 0;

export default function App() {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => initialState({ history: loadHistory() }),
  );
  const [prefs, setPrefs] = useReducer(
    (p: Prefs, n: Partial<Prefs>) => ({ ...p, ...n }),
    undefined,
    loadPrefs,
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const resolvedTheme = useMemo(() => {
    if (prefs.theme !== "system") return prefs.theme;
    if (typeof window === "undefined") return "dark";
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }, [prefs.theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  useEffect(() => {
    try {
      localStorage.setItem(HIST_KEY, JSON.stringify(state.history));
    } catch {
      /* ignore */
    }
  }, [state.history]);

  const showToast = (message: string) => {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  };

  const act = (action: Action) => {
    dispatch(action);
    if (action.type === "clearHist") showToast("History cleared");
    else if (action.type === "mem") {
      const labels: Record<string, string> = {
        MS: "Stored to memory",
        "M+": "Added to memory",
        "M-": "Subtracted from memory",
        MC: "Memory cleared",
        MR: "Recalled memory",
      };
      showToast(labels[action.v] ?? "Memory updated");
    }
  };

  useEffect(() => {
    const onKeydown = (e: globalThis.KeyboardEvent) => {
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
      else if (k === "Delete") dispatch({ type: "ce" });
      else if (k === "Escape") dispatch({ type: "ac" });
      else if (k === "%") dispatch({ type: "pct" });
      else if (k === "(" || k === ")") dispatch({ type: "paren", v: k });
      else if (k === "!") dispatch({ type: "fact" });
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  const live =
    state.error ??
    (state.justEvaluated ? state.result : state.expression || "0");

  const nextTheme = (prefs.theme === "system"
    ? "dark"
    : prefs.theme === "dark"
      ? "light"
      : "system") as Prefs["theme"];
  const themeLabel = { system: "System", light: "Light", dark: "Dark" }[prefs.theme];

  const sciButtons = [
    { label: "√", fn: "sqrt", aria: "Square root" },
    { label: "xʸ", fn: "pow", aria: "Power" },
    { label: "x!", fn: "fact", aria: "Factorial" },
    { label: "|x|", fn: "abs", aria: "Absolute value" },
    { label: "sin", fn: "sin", aria: "Sine" },
    { label: "cos", fn: "cos", aria: "Cosine" },
    { label: "tan", fn: "tan", aria: "Tangent" },
    { label: "asin", fn: "asin", aria: "Arcsine" },
    { label: "acos", fn: "acos", aria: "Arccosine" },
    { label: "atan", fn: "atan", aria: "Arctangent" },
    { label: "log", fn: "log", aria: "Base-10 logarithm" },
    { label: "ln", fn: "ln", aria: "Natural logarithm" },
  ];

  return (
    <div className="app" data-theme={resolvedTheme}>
      <div className="bg" />
      <div className="shell" role="application" aria-label="SC Calculator">
        <header className="brand">
          <div>
            <h1>SC Calculator</h1>
            <p>Glassmorphism scientific calculator</p>
          </div>
          <div className="toolbar">
            <button
              className="key subtle"
              type="button"
              aria-pressed={prefs.scientific}
              onClick={() => setPrefs({ scientific: !prefs.scientific })}
            >
              {prefs.scientific ? "Basic" : "Scientific"}
            </button>
            <button
              className="key subtle"
              type="button"
              aria-label={`Theme: ${themeLabel}. Toggle theme`}
              title="Toggle theme"
              onClick={() => setPrefs({ theme: nextTheme })}
            >
              <span aria-hidden="true">{resolvedTheme === "dark" ? "🌙" : "☀️"}</span>{" "}
              {themeLabel}
            </button>
          </div>
        </header>

        <main className="calculator glass">
          <section>
            <div
              className="display glass"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="expression" aria-label="Expression">
                {state.expression || "\u00A0"}
              </div>
              <div
                className={`result${state.error ? " error" : ""}`}
                aria-label={state.error ? "Error" : "Result"}
              >
                {state.result}
              </div>
              <span className="sr-only">{live}</span>
            </div>

            <div className="pad">
              <div className="row mem">
                {(["MC", "MR", "M+", "M-", "MS"] as const).map((m) => (
                  <button
                    key={m}
                    className="key mem"
                    type="button"
                    aria-label={m}
                    onClick={() => dispatch({ type: "mem", v: m })}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="row util">
                <button
                  className="key action"
                  type="button"
                  aria-label="Clear all"
                  onClick={() => dispatch({ type: "ac" })}
                >
                  AC
                </button>
                <button
                  className="key action"
                  type="button"
                  aria-label="Clear entry"
                  onClick={() => dispatch({ type: "ce" })}
                >
                  CE
                </button>
                <button
                  className="key action"
                  type="button"
                  aria-label="Delete"
                  onClick={() => dispatch({ type: "del" })}
                >
                  ⌫
                </button>
                <button
                  className="key op"
                  type="button"
                  aria-label="Divide"
                  onClick={() => dispatch({ type: "op", v: "÷" })}
                >
                  ÷
                </button>
              </div>

              {prefs.scientific && (
                <div className="sci" aria-label="Scientific functions">
                  <button
                    className="key subtle"
                    type="button"
                    aria-label="Toggle angle mode"
                    onClick={() => dispatch({ type: "angle" })}
                  >
                    {state.angleMode.toUpperCase()}
                  </button>
                  <button
                    className="key"
                    type="button"
                    aria-label="Open parenthesis"
                    onClick={() => dispatch({ type: "paren", v: "(" })}
                  >
                    (
                  </button>
                  <button
                    className="key"
                    type="button"
                    aria-label="Close parenthesis"
                    onClick={() => dispatch({ type: "paren", v: ")" })}
                  >
                    )
                  </button>
                  <button
                    className="key fn"
                    type="button"
                    aria-label="π (pi)"
                    onClick={() => dispatch({ type: "const", v: "pi" })}
                  >
                    π
                  </button>
                  <button
                    className="key fn"
                    type="button"
                    aria-label="e (Euler's number)"
                    onClick={() => dispatch({ type: "const", v: "e" })}
                  >
                    e
                  </button>
                  {sciButtons.map((b) => (
                    <button
                      key={b.fn}
                      className="key fn"
                      type="button"
                      aria-label={b.aria}
                      onClick={() =>
                        b.fn === "fact"
                          ? dispatch({ type: "fact" })
                          : b.fn === "pow"
                            ? dispatch({ type: "op", v: "^" })
                            : dispatch({ type: "fn", v: b.fn })
                      }
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="keys">
                {["7", "8", "9"].map((d) => (
                  <button
                    key={d}
                    className="key"
                    type="button"
                    aria-label={d}
                    onClick={() => dispatch({ type: "digit", v: d })}
                  >
                    {d}
                  </button>
                ))}
                <button
                  className="key op"
                  type="button"
                  aria-label="Multiply"
                  onClick={() => dispatch({ type: "op", v: "×" })}
                >
                  ×
                </button>
                {["4", "5", "6"].map((d) => (
                  <button
                    key={d}
                    className="key"
                    type="button"
                    aria-label={d}
                    onClick={() => dispatch({ type: "digit", v: d })}
                  >
                    {d}
                  </button>
                ))}
                <button
                  className="key op"
                  type="button"
                  aria-label="Subtract"
                  onClick={() => dispatch({ type: "op", v: "-" })}
                >
                  −
                </button>
                {["1", "2", "3"].map((d) => (
                  <button
                    key={d}
                    className="key"
                    type="button"
                    aria-label={d}
                    onClick={() => dispatch({ type: "digit", v: d })}
                  >
                    {d}
                  </button>
                ))}
                <button
                  className="key op"
                  type="button"
                  aria-label="Add"
                  onClick={() => dispatch({ type: "op", v: "+" })}
                >
                  +
                </button>
                <button
                  className="key action"
                  type="button"
                  aria-label="Toggle sign"
                  onClick={() => dispatch({ type: "sign" })}
                >
                  ±
                </button>
                <button
                  className="key"
                  type="button"
                  aria-label="0"
                  onClick={() => dispatch({ type: "digit", v: "0" })}
                >
                  0
                </button>
                <button
                  className="key"
                  type="button"
                  aria-label="Decimal point"
                  onClick={() => dispatch({ type: "dot" })}
                >
                  .
                </button>
                <button
                  className="key pct"
                  type="button"
                  aria-label="Percent"
                  onClick={() => dispatch({ type: "pct" })}
                >
                  %
                </button>
                <button
                  className="key equals"
                  type="button"
                  aria-label="Equals"
                  onClick={() => dispatch({ type: "eq" })}
                >
                  =
                </button>
              </div>
            </div>
          </section>

          <aside className="side">
            <section className="panel glass history-panel">
              <h2>History</h2>
              {state.history.length === 0 ? (
                <p className="empty">No calculations yet.</p>
              ) : (
                <>
                  <div className="history">
                    {state.history.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="hist-item"
                        onClick={() => dispatch({ type: "hist", id: item.id })}
                      >
                        <span className="expr" aria-label="Expression">
                          {item.expression}
                        </span>
                        <span className="res" aria-label="Result">
                          {item.result}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="key subtle"
                    type="button"
                    onClick={() => act({ type: "clearHist" })}
                  >
                    Clear history
                  </button>
                </>
              )}
            </section>

            <section className="panel glass memory-panel">
              <h2>Memory</h2>
              <p className="empty">M = {formatMemory(state.memory)}</p>
            </section>

            <footer className="meta">
              <p>
                Keyboard: <kbd>1</kbd>–<kbd>9</kbd>, <kbd>.</kbd>,{" "}
                <kbd>+</kbd> <kbd>−</kbd> <kbd>×</kbd> <kbd>÷</kbd>,{" "}
                <kbd>Enter</kbd>=, <kbd>Esc</kbd>, <kbd>Del</kbd>,{" "}
                <kbd>Backspace</kbd>.
              </p>
            </footer>
          </aside>
        </main>
      </div>

      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatMemory(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  if (Object.is(n, -0)) return "0";
  return Number(n.toPrecision(12)).toString();
}
