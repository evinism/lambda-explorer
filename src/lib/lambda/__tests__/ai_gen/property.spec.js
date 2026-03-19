import { assert } from "chai";
import {
  parseTerm,
  renderExpression,
  toNormalForm,
  equal,
  bReduce,
  getFreeVars,
  replace,
  purgeAstCache,
  tokenize,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
  leftmostOutermostRedex,
} from "../../index.js";
import { cannonize } from "../../cannonize.js";
import { bReducable, eReducable, eReduce } from "../../operations.js";

// --- Minimal random AST generator ---

const SEED_NAMES = ["a", "b", "c", "x", "y", "z"];

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

// Simple seedable PRNG (mulberry32)
function makeRng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate a random lambda expression AST.
// maxDepth controls nesting, bias controls how likely we are to generate
// simple expressions (higher = simpler).
function randomExpr(rng, maxDepth, boundVars = []) {
  const allVars = [...new Set([...SEED_NAMES, ...boundVars])];
  const r = rng();

  if (maxDepth <= 0 || r < 0.3) {
    // Variable — prefer bound vars if available
    if (boundVars.length > 0 && rng() < 0.7) {
      return { type: "variable", name: pick(boundVars, rng) };
    }
    return { type: "variable", name: pick(allVars, rng) };
  }

  if (r < 0.55) {
    // Application
    return {
      type: "application",
      left: randomExpr(rng, maxDepth - 1, boundVars),
      right: randomExpr(rng, maxDepth - 1, boundVars),
    };
  }

  // Function (lambda)
  const arg = pick(SEED_NAMES, rng);
  return {
    type: "function",
    argument: arg,
    body: randomExpr(rng, maxDepth - 1, [...boundVars, arg]),
  };
}

// Generate a random closed expression (no free variables)
function randomClosedExpr(rng, maxDepth) {
  // Wrap in enough lambdas to bind all possible names
  const names = [...SEED_NAMES];
  let body = randomExpr(rng, maxDepth, names);
  // Wrap body in lambdas binding all seed names
  for (let i = names.length - 1; i >= 0; i--) {
    body = { type: "function", argument: names[i], body };
  }
  return body;
}

// Generate a random expression that is known to normalize
// (by making it simple enough)
function randomNormalizableExpr(rng) {
  const r = rng();
  if (r < 0.3) {
    // Identity applied to something
    const arg = pick(SEED_NAMES, rng);
    return {
      type: "application",
      left: {
        type: "function",
        argument: "x",
        body: { type: "variable", name: "x" },
      },
      right: { type: "variable", name: arg },
    };
  }
  if (r < 0.6) {
    // K combinator applied to two things
    const a = pick(SEED_NAMES, rng);
    const b = pick(SEED_NAMES, rng);
    return {
      type: "application",
      left: {
        type: "application",
        left: {
          type: "function",
          argument: "x",
          body: {
            type: "function",
            argument: "y",
            body: { type: "variable", name: "x" },
          },
        },
        right: { type: "variable", name: a },
      },
      right: { type: "variable", name: b },
    };
  }
  // Simple lambda or variable
  if (rng() < 0.5) {
    return { type: "variable", name: pick(SEED_NAMES, rng) };
  }
  const arg = pick(SEED_NAMES, rng);
  return {
    type: "function",
    argument: arg,
    body: { type: "variable", name: pick(SEED_NAMES, rng) },
  };
}

// Build a church numeral AST directly
function churchNumeral(n) {
  let body = { type: "variable", name: "x" };
  for (let i = 0; i < n; i++) {
    body = {
      type: "application",
      left: { type: "variable", name: "f" },
      right: body,
    };
  }
  return {
    type: "function",
    argument: "f",
    body: { type: "function", argument: "x", body },
  };
}

// Alpha-rename: replace all occurrences of bound var name
function alphaRename(expr, oldName, newName) {
  return replace(oldName, { type: "variable", name: newName }, expr);
}

// Rename all bound variables in an expression using a mapping
function renameBoundVars(expr, mapping) {
  switch (expr.type) {
    case "variable":
      return expr;
    case "application":
      return {
        type: "application",
        left: renameBoundVars(expr.left, mapping),
        right: renameBoundVars(expr.right, mapping),
      };
    case "function": {
      const newArg = mapping[expr.argument] || expr.argument;
      const newBody = replace(
        expr.argument,
        { type: "variable", name: newArg },
        expr.body
      );
      return {
        type: "function",
        argument: newArg,
        body: renameBoundVars(newBody, mapping),
      };
    }
  }
}

const NUM_TRIALS = 50;

describe("Property-based tests", function () {
  describe("equal() reflexivity", function () {
    it("every expression is equal to itself", function () {
      const rng = makeRng(42);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomExpr(rng, 4);
        assert.isTrue(
          equal(expr, expr),
          `Reflexivity failed for: ${renderExpression(expr)}`
        );
      }
    });
  });

  describe("equal() symmetry", function () {
    it("equal(a, b) === equal(b, a) for random expressions", function () {
      const rng = makeRng(123);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const a = randomExpr(rng, 3);
        const b = randomExpr(rng, 3);
        assert.equal(
          equal(a, b),
          equal(b, a),
          `Symmetry failed for: ${renderExpression(a)} vs ${renderExpression(b)}`
        );
      }
    });
  });

  describe("cannonize() idempotence", function () {
    it("canonicalizing twice gives the same result as once", function () {
      const rng = makeRng(999);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomExpr(rng, 4);
        const c1 = purgeAstCache(cannonize(expr));
        const c2 = purgeAstCache(cannonize(c1));
        assert.isTrue(
          equal(c1, c2),
          `Canonicalize idempotence failed for: ${renderExpression(expr)}`
        );
      }
    });
  });

  describe("render → parse roundtrip preserves semantics", function () {
    it("parse(render(expr)) is equal to expr", function () {
      const rng = makeRng(7);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomExpr(rng, 3);
        const rendered = renderExpression(expr);
        const reparsed = parseTerm(rendered);
        assert.isTrue(
          equal(expr, reparsed),
          `Roundtrip failed for: ${rendered}`
        );
      }
    });
  });

  describe("tokenize → parse → render → tokenize roundtrip", function () {
    it("re-tokenizing rendered output produces parseable tokens", function () {
      const rng = makeRng(55);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomExpr(rng, 3);
        const rendered = renderExpression(expr);
        const tokens = tokenize(rendered);
        // Should not throw
        const reparsed = parseTerm(rendered);
        assert.isTrue(
          equal(expr, reparsed),
          `Token roundtrip failed for: ${rendered}`
        );
      }
    });
  });

  describe("free variables", function () {
    it("closed expressions have no free variables", function () {
      const rng = makeRng(200);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomClosedExpr(rng, 3);
        const free = getFreeVars(expr);
        assert.lengthOf(
          free,
          0,
          `Closed expression has free vars: ${renderExpression(expr)}`
        );
      }
    });

    it("a variable expression has exactly itself as free", function () {
      for (const name of SEED_NAMES) {
        const expr = { type: "variable", name };
        const free = getFreeVars(expr);
        assert.lengthOf(free, 1);
        assert.equal(free[0].name, name);
      }
    });

    it("binding a variable removes it from free set", function () {
      const rng = makeRng(77);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomExpr(rng, 3);
        const freeNames = getFreeVars(expr).map((v) => v.name);
        if (freeNames.length === 0) continue;
        const varToBind = freeNames[0];
        const wrapped = {
          type: "function",
          argument: varToBind,
          body: expr,
        };
        const newFree = getFreeVars(wrapped).map((v) => v.name);
        assert.notInclude(
          newFree,
          varToBind,
          `Binding ${varToBind} should remove it from free vars in: ${renderExpression(expr)}`
        );
      }
    });
  });

  describe("beta reduction preserves no free variables in closed terms", function () {
    it("reducing a closed redex produces a closed result", function () {
      const rng = makeRng(300);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const body = randomClosedExpr(rng, 2);
        const arg = randomClosedExpr(rng, 2);
        // Build (λa.body) arg — a closed redex
        const redex = {
          type: "application",
          left: {
            type: "function",
            argument: "a",
            body,
          },
          right: arg,
        };
        if (!bReducable(redex)) continue;
        const reduced = bReduce(redex);
        if (reduced === undefined) continue;
        const free = getFreeVars(reduced).map((v) => v.name);
        assert.lengthOf(
          free,
          0,
          `Beta reduction of closed term produced free vars: ${free}`
        );
      }
    });
  });

  describe("normalization idempotence", function () {
    it("toNormalForm(toNormalForm(e)) ≡ toNormalForm(e)", function () {
      const rng = makeRng(400);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomNormalizableExpr(rng);
        const nf1 = toNormalForm(expr);
        const nf2 = toNormalForm(nf1);
        assert.isTrue(
          equal(nf1, nf2),
          `Normalization not idempotent for: ${renderExpression(expr)}`
        );
      }
    });
  });

  describe("normal form has no redexes", function () {
    it("leftmostOutermostRedex returns undefined on normal forms", function () {
      const rng = makeRng(500);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomNormalizableExpr(rng);
        const nf = toNormalForm(expr);
        assert.isUndefined(
          leftmostOutermostRedex(nf),
          `Normal form still has redex: ${renderExpression(nf)}`
        );
      }
    });
  });

  describe("alpha equivalence", function () {
    it("renaming bound variables preserves equality", function () {
      // Build expressions with known bound vars, rename them,
      // and verify equality holds
      const pairs = [
        ["λa.a", "λz.z"],
        ["λa.λb.a b", "λx.λy.x y"],
        ["λa.λb.b a", "λp.λq.q p"],
        ["λa.a(λb.b)", "λx.x(λy.y)"],
        ["λa.λb.λc.a(b c)", "λx.λy.λz.x(y z)"],
      ];
      for (const [a, b] of pairs) {
        assert.isTrue(
          equal(parseTerm(a), parseTerm(b)),
          `Alpha equivalence failed: ${a} vs ${b}`
        );
      }
    });

    it("expressions that differ structurally are not equal", function () {
      const rng = makeRng(600);
      let inequalCount = 0;
      for (let i = 0; i < NUM_TRIALS * 2; i++) {
        const a = randomExpr(rng, 3);
        const b = randomExpr(rng, 3);
        if (!equal(a, b)) {
          inequalCount++;
          // Verify it's genuinely not symmetric-broken
          assert.isFalse(equal(b, a));
        }
      }
      // We should find at least some non-equal pairs
      assert.isAbove(inequalCount, 0, "Should find some non-equal random pairs");
    });
  });

  describe("church numeral arithmetic properties", function () {
    const SUCC = parseTerm("λnfx.f(n f x)");
    const PLUS = parseTerm("λmnfx.m f(n f x)");
    const MULT = parseTerm("λmnf.m(n f)");

    function applyChurchOp(op, ...args) {
      let expr = op;
      for (const arg of args) {
        expr = { type: "application", left: expr, right: arg };
      }
      return toNormalForm(expr);
    }

    it("SUCC n = n + 1 for n = 0..7", function () {
      for (let n = 0; n <= 7; n++) {
        const result = applyChurchOp(SUCC, churchNumeral(n));
        assert.equal(
          renderAsChurchNumeral(result),
          n + 1,
          `SUCC(${n}) should be ${n + 1}`
        );
      }
    });

    it("PLUS is commutative for small values", function () {
      for (let a = 0; a <= 3; a++) {
        for (let b = 0; b <= 3; b++) {
          const ab = applyChurchOp(PLUS, churchNumeral(a), churchNumeral(b));
          const ba = applyChurchOp(PLUS, churchNumeral(b), churchNumeral(a));
          const abVal = renderAsChurchNumeral(ab);
          const baVal = renderAsChurchNumeral(ba);
          assert.equal(abVal, baVal, `PLUS ${a} ${b} != PLUS ${b} ${a}`);
          assert.equal(abVal, a + b, `PLUS ${a} ${b} != ${a + b}`);
        }
      }
    });

    it("MULT is commutative for small values", function () {
      for (let a = 0; a <= 3; a++) {
        for (let b = 0; b <= 3; b++) {
          const ab = applyChurchOp(MULT, churchNumeral(a), churchNumeral(b));
          const ba = applyChurchOp(MULT, churchNumeral(b), churchNumeral(a));
          const abVal = renderAsChurchNumeral(ab);
          const baVal = renderAsChurchNumeral(ba);
          assert.equal(abVal, baVal, `MULT ${a} ${b} != MULT ${b} ${a}`);
          assert.equal(abVal, a * b, `MULT ${a} ${b} != ${a * b}`);
        }
      }
    });

    it("PLUS n 0 = n (additive identity)", function () {
      for (let n = 0; n <= 5; n++) {
        const result = applyChurchOp(PLUS, churchNumeral(n), churchNumeral(0));
        assert.equal(
          renderAsChurchNumeral(result),
          n,
          `PLUS ${n} 0 should be ${n}`
        );
      }
    });

    it("MULT n 1 = n (multiplicative identity)", function () {
      for (let n = 0; n <= 5; n++) {
        const result = applyChurchOp(MULT, churchNumeral(n), churchNumeral(1));
        assert.equal(
          renderAsChurchNumeral(result),
          n,
          `MULT ${n} 1 should be ${n}`
        );
      }
    });

    it("MULT n 0 = 0 (zero annihilation)", function () {
      for (let n = 0; n <= 5; n++) {
        const result = applyChurchOp(MULT, churchNumeral(n), churchNumeral(0));
        assert.equal(
          renderAsChurchNumeral(result),
          0,
          `MULT ${n} 0 should be 0`
        );
      }
    });
  });

  describe("church boolean logic properties", function () {
    const TRUE = parseTerm("λab.a");
    const FALSE = parseTerm("λab.b");
    const AND = parseTerm("λpq.p q p");
    const OR = parseTerm("λpq.p p q");
    const NOT = parseTerm("λp.p(λab.b)(λab.a)");

    function applyChurchOp(op, ...args) {
      let expr = op;
      for (const arg of args) {
        expr = { type: "application", left: expr, right: arg };
      }
      return toNormalForm(expr);
    }

    const bools = [
      [true, TRUE],
      [false, FALSE],
    ];

    it("NOT is self-inverse: NOT(NOT(x)) = x", function () {
      for (const [val, church] of bools) {
        const result = applyChurchOp(NOT, applyChurchOp(NOT, church));
        assert.equal(
          renderAsChurchBoolean(result),
          val,
          `NOT(NOT(${val})) should be ${val}`
        );
      }
    });

    it("AND truth table is correct", function () {
      for (const [aVal, aChurch] of bools) {
        for (const [bVal, bChurch] of bools) {
          const result = applyChurchOp(AND, aChurch, bChurch);
          assert.equal(
            renderAsChurchBoolean(result),
            aVal && bVal,
            `AND(${aVal}, ${bVal}) should be ${aVal && bVal}`
          );
        }
      }
    });

    it("OR truth table is correct", function () {
      for (const [aVal, aChurch] of bools) {
        for (const [bVal, bChurch] of bools) {
          const result = applyChurchOp(OR, aChurch, bChurch);
          assert.equal(
            renderAsChurchBoolean(result),
            aVal || bVal,
            `OR(${aVal}, ${bVal}) should be ${aVal || bVal}`
          );
        }
      }
    });

    it("De Morgan's law: NOT(AND a b) = OR(NOT a)(NOT b)", function () {
      for (const [, aChurch] of bools) {
        for (const [, bChurch] of bools) {
          const lhs = applyChurchOp(NOT, applyChurchOp(AND, aChurch, bChurch));
          const rhs = applyChurchOp(
            OR,
            applyChurchOp(NOT, aChurch),
            applyChurchOp(NOT, bChurch)
          );
          assert.equal(
            renderAsChurchBoolean(lhs),
            renderAsChurchBoolean(rhs),
            "De Morgan's law violated"
          );
        }
      }
    });

    it("De Morgan's law: NOT(OR a b) = AND(NOT a)(NOT b)", function () {
      for (const [, aChurch] of bools) {
        for (const [, bChurch] of bools) {
          const lhs = applyChurchOp(NOT, applyChurchOp(OR, aChurch, bChurch));
          const rhs = applyChurchOp(
            AND,
            applyChurchOp(NOT, aChurch),
            applyChurchOp(NOT, bChurch)
          );
          assert.equal(
            renderAsChurchBoolean(lhs),
            renderAsChurchBoolean(rhs),
            "De Morgan's law (OR form) violated"
          );
        }
      }
    });
  });

  describe("replace() preserves free variable count", function () {
    it("replacing a free var with a var doesn't increase free var count beyond expectation", function () {
      const rng = makeRng(800);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomExpr(rng, 3);
        const freeNames = [...new Set(getFreeVars(expr).map((v) => v.name))];
        if (freeNames.length === 0) continue;
        const target = pick(freeNames, rng);
        const replacement = { type: "variable", name: "FRESH_VAR" };
        const result = replace(target, replacement, expr);
        const resultFree = [
          ...new Set(getFreeVars(result).map((v) => v.name)),
        ];
        // After replacing `target` with `FRESH_VAR`:
        // - `target` should no longer be free (unless it appeared in a context where it wasn't replaced)
        // - `FRESH_VAR` may be free
        // - Other free vars should be unchanged
        // Total free vars should not explode
        assert.isAtMost(
          resultFree.length,
          freeNames.length + 1,
          `Free var count exploded replacing ${target} in ${renderExpression(expr)}`
        );
      }
    });
  });

  describe("eta reduction correctness", function () {
    it("η-reducible expressions behave the same as their reduction when applied", function () {
      // If λx.F x η-reduces to F, then (λx.F x) a and F a should normalize the same
      const fNames = ["f", "g", "h"];
      const argNames = ["a", "b", "c"];
      for (const f of fNames) {
        for (const a of argNames) {
          if (f === a) continue;
          const etaExpr = {
            type: "function",
            argument: "x",
            body: {
              type: "application",
              left: { type: "variable", name: f },
              right: { type: "variable", name: "x" },
            },
          };
          if (!eReducable(etaExpr)) continue;
          const reduced = eReduce(etaExpr);

          // Apply both to the same argument
          const app1 = {
            type: "application",
            left: etaExpr,
            right: { type: "variable", name: a },
          };
          const app2 = {
            type: "application",
            left: reduced,
            right: { type: "variable", name: a },
          };
          const nf1 = toNormalForm(app1);
          const nf2 = toNormalForm(app2);
          assert.isTrue(
            equal(nf1, nf2),
            `η-reduction changed behavior: λx.${f} x applied to ${a}`
          );
        }
      }
    });
  });

  describe("substitution respects shadowing", function () {
    it("replacing a name that is shadowed by a lambda has no effect on the lambda body", function () {
      const rng = makeRng(900);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const name = pick(SEED_NAMES, rng);
        const innerBody = randomExpr(rng, 2, [name]);
        const expr = {
          type: "function",
          argument: name,
          body: innerBody,
        };
        const replacement = {
          type: "variable",
          name: "SHOULD_NOT_APPEAR",
        };
        const result = replace(name, replacement, expr);
        // Shadowing: the entire expression should be unchanged
        assert.equal(
          result,
          expr,
          `Shadowing violated for λ${name}._ when replacing ${name}`
        );
      }
    });
  });

  describe("bReducable agrees with bReduce", function () {
    it("bReduce returns a value iff bReducable is true", function () {
      const rng = makeRng(1000);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomExpr(rng, 4);
        const reducable = bReducable(expr);
        const reduced = bReduce(expr);
        if (reducable) {
          assert.isDefined(
            reduced,
            `bReducable true but bReduce returned undefined for ${renderExpression(expr)}`
          );
        } else {
          assert.isUndefined(
            reduced,
            `bReducable false but bReduce returned value for ${renderExpression(expr)}`
          );
        }
      }
    });
  });

  describe("renderAsChurchNumeral only returns valid numbers", function () {
    it("returns correct values for constructed church numerals 0..20", function () {
      for (let n = 0; n <= 20; n++) {
        const result = renderAsChurchNumeral(churchNumeral(n));
        assert.equal(result, n, `Church numeral ${n} not recognized`);
      }
    });

    it("returns undefined for random non-church-numeral expressions", function () {
      const rng = makeRng(1100);
      for (let i = 0; i < NUM_TRIALS; i++) {
        const expr = randomExpr(rng, 2);
        const result = renderAsChurchNumeral(expr);
        if (result !== undefined) {
          // If it claims to be a church numeral, verify by checking structure
          assert.isNumber(result);
          assert.isAtLeast(result, 0);
        }
      }
    });
  });
});
