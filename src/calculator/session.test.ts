import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyMemory,
  applyPercent,
  backspace,
  clearAll,
  equals,
  initialState,
  inputDecimal,
  inputDigit,
  inputFactorial,
  inputOperator,
  inputParen,
  inputReciprocal,
  inputSquare,
  sanitizeHistory,
  toggleSign,
} from "./session.ts";

describe("session", () => {
  it("chains arithmetic", () => {
    let s = initialState();
    s = inputDigit(s, "2");
    s = inputOperator(s, "+");
    s = inputDigit(s, "3");
    s = inputOperator(s, "×");
    s = inputDigit(s, "4");
    s = equals(s);
    assert.equal(s.result, "14");
    assert.equal(s.history[0]?.expression, "2+3*4");
  });

  it("handles decimals and percent", () => {
    let s = initialState();
    s = inputDigit(s, "5");
    s = inputDecimal(s);
    s = inputDigit(s, "5");
    s = applyPercent(s);
    s = equals(s);
    assert.equal(s.result, "0.055");
  });

  it("toggles sign and backspaces", () => {
    let s = initialState();
    s = inputDigit(s, "8");
    s = toggleSign(s);
    assert.equal(s.expression, "-8");
    s = backspace(s);
    assert.equal(s.expression, "-");
    s = clearAll(s);
    assert.equal(s.expression, "");
    assert.equal(s.result, "0");
  });

   it("memory operations", () => {
    let s = initialState();
    s = inputDigit(s, "1");
    s = inputDigit(s, "0");
    s = applyMemory(s, "MS");
    assert.equal(s.memory, 10);
    s = applyMemory(s, "M+");
    assert.equal(s.memory, 20);
    s = applyMemory(s, "MC");
    assert.equal(s.memory, 0);
  });

  it("factorial input", () => {
    let s = initialState();
    s = inputDigit(s, "5");
    s = inputFactorial(s);
    s = equals(s);
    assert.equal(s.result, "120");
  });

  it("divide by zero surfaces error", () => {
    let s = initialState();
    s = inputDigit(s, "1");
    s = inputOperator(s, "÷");
    s = inputDigit(s, "0");
    s = equals(s);
    assert.equal(s.error, "Cannot divide by zero");
  });

  it("squares and takes reciprocal", () => {
    let s = initialState();
    s = inputDigit(s, "5");
    s = inputSquare(s);
    s = equals(s);
    assert.equal(s.result, "25");
    s = inputReciprocal(s);
    s = equals(s);
    assert.equal(s.result, "0.04");
  });

  it("supports parentheses in the session", () => {
    let s = initialState();
    s = inputParen(s, "(");
    s = inputDigit(s, "2");
    s = inputOperator(s, "+");
    s = inputDigit(s, "3");
    s = inputParen(s, ")");
    s = inputOperator(s, "×");
    s = inputDigit(s, "4");
    s = equals(s);
    assert.equal(s.result, "20");
  });

  it("sanitizes persisted history", () => {
    const clean = sanitizeHistory([
      { id: "a", expression: "1+1", result: "2" },
      { id: 1, expression: "bad" },
      { expression: "no-id", result: "0" },
      null,
      { id: "b", expression: "x".repeat(201), result: "1" },
    ]);
    assert.equal(clean.length, 1);
    assert.equal(clean[0]?.id, "a");
    assert.deepEqual(sanitizeHistory("nope"), []);
  });

});
