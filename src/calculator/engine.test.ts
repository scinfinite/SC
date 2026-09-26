import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluate, formatNumber, CalcError } from "./engine.ts";

describe("evaluate", () => {
  it("adds subtracts multiplies divides", () => {
    assert.equal(evaluate("1+2"), 3);
    assert.equal(evaluate("10-4"), 6);
    assert.equal(evaluate("3*4"), 12);
    assert.equal(evaluate("12/3"), 4);
  });

  it("respects precedence", () => {
    assert.equal(evaluate("2+3*4"), 14);
    assert.equal(evaluate("(2+3)*4"), 20);
    assert.equal(evaluate("2^3^2"), 512);
  });

  it("handles decimals and negatives", () => {
    assert.equal(evaluate("1.5+2.5"), 4);
    assert.equal(evaluate("-3+5"), 2);
    assert.equal(evaluate("5*-2"), -10);
    assert.equal(evaluate("-(2+3)"), -5);
  });

  it("handles percentage", () => {
    assert.equal(evaluate("50%"), 0.5);
    assert.equal(evaluate("200*10%"), 20);
  });

  it("divides by zero", () => {
    assert.throws(() => evaluate("1/0"), CalcError);
  });

  it("rejects invalid expressions", () => {
    assert.throws(() => evaluate(""));
    assert.throws(() => evaluate("2+"));
    assert.throws(() => evaluate("(2+3"));
    assert.throws(() => evaluate("foo"));
  });

  it("scientific functions", () => {
    assert.equal(evaluate("sqrt(9)"), 3);
    assert.equal(evaluate("abs(-4)"), 4);
    assert.equal(evaluate("2^10"), 1024);
    assert.ok(Math.abs(evaluate("sin(90)", "deg") - 1) < 1e-10);
    assert.ok(Math.abs(evaluate("cos(0)", "deg") - 1) < 1e-10);
    assert.ok(Math.abs(evaluate("log(100)") - 2) < 1e-10);
    assert.ok(Math.abs(evaluate("ln(e)") - 1) < 1e-10);
    assert.ok(Math.abs(evaluate("pi") - Math.PI) < 1e-10);
    assert.equal(evaluate("5!"), 120);
  });

  it("rejects invalid function args", () => {
    assert.throws(() => evaluate("sqrt(-1)"));
    assert.throws(() => evaluate("log(0)"));
    assert.throws(() => evaluate("asin(2)"));
  });

  it("handles chained ops, large values, and inverse trig", () => {
    assert.equal(evaluate("100/4/5"), 5);
    assert.ok(evaluate("10^8") === 100_000_000);
    assert.ok(Math.abs(evaluate("asin(1)", "deg") - 90) < 1e-10);
    assert.ok(Math.abs(evaluate("atan(0)", "deg")) < 1e-10);
  });
});

describe("formatNumber", () => {
  it("formats ordinary numbers", () => {
    assert.equal(formatNumber(0), "0");
    assert.equal(formatNumber(2.5), "2.5");
    assert.equal(formatNumber(-0), "0");
  });
});
