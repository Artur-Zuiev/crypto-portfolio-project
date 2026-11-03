import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function functionsFrom(path, ending, names) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const start = source.indexOf(names[0]);
  const end = source.indexOf(ending, start);
  assert.ok(start >= 0 && end > start, "Money formatter source missing");
  const ctx = vm.createContext({ Intl, Number, Math });
  vm.runInContext(source.slice(start, end), ctx);
  return ctx;
}

test("dashboard shows two decimals for ordinary monetary values", () => {
  const ctx = functionsFrom("../js/dashboard.js", "function formatNumber(", ["function formatEuro("]);
  assert.equal(ctx.formatEuro(208.09), "208,09 €");
  assert.equal(ctx.formatEuro(207.79), "207,79 €");
  assert.equal(ctx.formatEuro(0), "0,00 €");
  assert.equal(ctx.formatEuro(0.00195), "0,00 €");
  assert.equal(ctx.formatEuro(1234.567), "1.234,57 €");
});

test("P&L never hides small real gains or losses", () => {
  const ctx = functionsFrom("../js/dashboard.js", "function formatNumber(", ["function formatEuro("]);
  assert.equal(ctx.formatProfitEuro(0.00195), "0,00195 €");
  assert.equal(ctx.formatProfitEuro(-0.00195), "-0,00195 €");
  assert.equal(ctx.formatProfitEuro(0.3), "0,30 €");
  assert.equal(ctx.formatProfitEuro(0), "0,00 €");
  assert.equal(ctx.formatProfitEuro(0.00000001), "<0,000001 €");
});

test("3D monetary and P&L display follow same precision policy", () => {
  const ctx = functionsFrom("../js/scene.js", "function setStatus(", ["function formatCurrency("]);
  assert.equal(ctx.formatCurrency(208.09), "208,09 €");
  assert.equal(ctx.formatCurrency(0.00195), "0,00 €");
  assert.equal(ctx.formatProfitCurrency(0.00195), "0,00195 €");
  assert.equal(ctx.formatProfitCurrency(-0.02), "-0,02 €");
});
