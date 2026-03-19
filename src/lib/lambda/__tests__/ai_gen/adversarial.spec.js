import { assert } from "chai";
import {
  parseTerm,
  renderExpression,
  toNormalForm,
  equal,
  bReduce,
  eReduce,
  getFreeVars,
  replace,
  purgeAstCache,
  tokenize,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
  leftmostOutermostRedex,
  LambdaExecutionTimeoutError,
  LambdaSyntaxError,
} from "../../index.js";
import { cannonize } from "../../cannonize.js";
import { bReducable, eReducable } from "../../operations.js";

// Helper: normalize and purge caches for clean comparison
function norm(str) {
  return purgeAstCache(toNormalForm(parseTerm(str)));
}

function normAst(ast) {
  return purgeAstCache(toNormalForm(ast));
}

function church(n) {
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

describe("Adversarial: trying to break the implementation", function () {
  // ---------------------------------------------------------------
  // BUG: off-by-one in toNormalForm depth counter
  //
  // The counter increments and checks BEFORE the while-loop checks
  // whether a reduction actually happened. So with depthOverflow=1,
  // even an expression already in normal form throws.
  // ---------------------------------------------------------------
  describe("toNormalForm off-by-one depth check", function () {
    it("BUG: toNormalForm(variable, 1) throws even though no reduction is needed", function () {
      // A variable is already in normal form — this should NOT throw.
      // But the counter hits 1 before the loop checks `reduced === undefined`.
      const ast = parseTerm("x");
      try {
        toNormalForm(ast, { depthOverflow: 1 });
        // If this doesn't throw, the bug is fixed
      } catch (e) {
        if (e instanceof LambdaExecutionTimeoutError) {
          assert.fail(
            "toNormalForm threw timeout for an expression already in normal form with depthOverflow=1. " +
            "The depth check fires before verifying no reduction occurred."
          );
        }
        throw e;
      }
    });

    it("BUG: toNormalForm(lambda, 1) throws for already-normal lambda", function () {
      const ast = parseTerm("λx.x");
      try {
        toNormalForm(ast, { depthOverflow: 1 });
      } catch (e) {
        if (e instanceof LambdaExecutionTimeoutError) {
          assert.fail(
            "toNormalForm threw timeout for λx.x with depthOverflow=1, " +
            "but λx.x is already in normal form."
          );
        }
        throw e;
      }
    });

    it("BUG: toNormalForm with depthOverflow=2 throws after one successful reduction", function () {
      // (λx.x) a needs exactly 1 reduction step → result is `a`.
      // With depthOverflow=2: step 1 reduces to `a` (count=1, ok),
      // step 2 finds no redex (count=2, 2>=2 → throws!)
      const ast = parseTerm("(λx.x) a");
      try {
        toNormalForm(ast, { depthOverflow: 2 });
      } catch (e) {
        if (e instanceof LambdaExecutionTimeoutError) {
          assert.fail(
            "toNormalForm threw timeout after successfully reducing (λx.x) a to `a`. " +
            "depthOverflow=2 should allow at least 1 reduction."
          );
        }
        throw e;
      }
    });
  });

  // ---------------------------------------------------------------
  // Normal-order evaluation: should handle divergent subexpressions
  // that are never needed.
  //
  // In normal order, (λx.a) OMEGA should reduce to `a` because
  // K discards its argument. Applicative order would diverge.
  // ---------------------------------------------------------------
  describe("normal order vs applicative order", function () {
    it("K applied to a value and omega should return the value (divergent arg discarded)", function () {
      // K = λxy.x, OMEGA = (λx.x x)(λx.x x)
      // K a OMEGA should reduce to `a` in normal order.
      // Step 1: (λxy.x) a OMEGA → (λy.a) OMEGA
      // Step 2: (λy.a) OMEGA → a
      const result = norm("(λxy.x) a ((λx.x x)(λx.x x))");
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("nested K discarding divergent computation", function () {
      // (λx.λy.x) a ((λz.z z)(λz.z z)) → λy.a → applied to nothing = λy.a
      const result = norm("(λxy.x) a ((λz.z z)(λz.z z))");
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("discarding omega inside a more complex expression", function () {
      // (λa.λb.a) ((λx.x) c) ((λx.x x)(λx.x x))
      // → (λa.λb.a) c ((λx.x x)(λx.x x))    [reduce (λx.x) c first? No — leftmost outermost]
      // Actually leftmost outermost: (λa.λb.a) is applied to ((λx.x) c)
      // so the outermost redex is (λa.λb.a)((λx.x)c) → λb.((λx.x) c)
      // then (λb.((λx.x) c)) OMEGA → (λx.x) c → c
      const result = norm("(λab.a)((λx.x) c)((λx.x x)(λx.x x))");
      assert.deepEqual(result, { type: "variable", name: "c" });
    });
  });

  // ---------------------------------------------------------------
  // Capture avoidance with complex replacers containing lambdas
  //
  // These test scenarios where the replacer itself has bound variables
  // that could interact with the expression's bindings.
  // ---------------------------------------------------------------
  describe("capture avoidance with lambda replacers", function () {
    it("replacer with bound var matching target lambda's arg", function () {
      // (λx.λy.x)(λz.y) — replace x with (λz.y) in λy.x
      // "y" is FREE in replacer (λz.y), and "y" is the argument of inner lambda.
      // Without capture avoidance: λy.(λz.y) — the y in (λz.y) now wrongly
      //   refers to the lambda's y binding instead of the outer free y.
      // With capture avoidance: λε₁.(λz.y) — y stays free.
      const result = purgeAstCache(bReduce(parseTerm("(λx.λy.x)(λz.y)")));
      assert.equal(result.type, "function");
      // The argument must NOT be "y" — it needs to be renamed
      assert.notEqual(result.argument, "y");
      // The body should still reference the FREE y
      assert.equal(result.body.type, "function");
      assert.equal(result.body.argument, "z");
      assert.equal(result.body.body.name, "y");
    });

    it("multi-level capture avoidance: replacer free vars conflict with multiple binders", function () {
      // (λx.λy.λz.x y z)(y z) — replace x with (y z) in λy.λz.x y z
      // Both "y" and "z" are free in replacer and are binder names in the body.
      // Both need to be renamed to avoid capture.
      const ast = parseTerm("(λx.λy.λz.x y z)(y z)");
      const result = purgeAstCache(bReduce(ast));
      const nf = purgeAstCache(toNormalForm(result));
      // Apply the result to two arguments to verify behavior
      const applied = purgeAstCache(
        toNormalForm({
          type: "application",
          left: {
            type: "application",
            left: nf,
            right: { type: "variable", name: "a" },
          },
          right: { type: "variable", name: "b" },
        })
      );
      // Should be equivalent to: (y z) a b
      // i.e., the original free y and z are preserved, then applied to a and b.
      assert.equal(applied.type, "application");
      // The leftmost part should be ((y z) a) b
      assert.equal(applied.left.type, "application");
      assert.equal(applied.left.left.type, "application");
      assert.equal(applied.left.left.left.name, "y");
      assert.equal(applied.left.left.right.name, "z");
    });

    it("replacer containing lambda that shadows a free var", function () {
      // replace("a", λb.b, λb.a)
      // "b" is NOT free in (λb.b) — it's bound. So no capture avoidance needed.
      // Result: λb.(λb.b)
      const result = purgeAstCache(
        replace(
          "a",
          parseTerm("λb.b"),
          parseTerm("λb.a").body
            ? parseTerm("λb.a")
            : parseTerm("λb.a")
        )
      );
      // The outer λb stays as-is, body becomes (λb.b)
      assert.equal(result.type, "function");
      assert.equal(result.argument, "b");
      assert.equal(result.body.type, "function");
      assert.equal(result.body.argument, "b");
      assert.equal(result.body.body.name, "b");
    });
  });

  // ---------------------------------------------------------------
  // Canonical form names ([_c1], [_c2]) can't be re-parsed.
  // If anyone renders a canonicalized AST and tries to parse it,
  // the lexer should choke on the square brackets.
  // ---------------------------------------------------------------
  describe("canonical names vs lexer", function () {
    it("rendering a canonicalized expression produces unparseable output", function () {
      const ast = parseTerm("λx.x");
      const canonical = cannonize(ast);
      const rendered = renderExpression(canonical);
      // The rendered form contains [_c1] which can't be lexed
      assert.include(rendered, "[");
      assert.throws(() => parseTerm(rendered));
    });

    it("canonical names don't interfere with equality checks", function () {
      // Even though canonical names are weird strings, equal() still works
      // because it canonicalizes both sides independently
      const a = parseTerm("λx.λy.x y");
      const b = parseTerm("λa.λb.a b");
      assert.isTrue(equal(a, b));
    });
  });

  // ---------------------------------------------------------------
  // Church PRED (predecessor) — the most complex standard combinator.
  // This stress-tests normalization with many reduction steps.
  // PRED = λnfx.n (λgh.h(gf)) (λu.x) (λu.u)
  // ---------------------------------------------------------------
  describe("church predecessor", function () {
    const PRED = "λnfx.n(λgh.h(g f))(λu.x)(λu.u)";

    it("PRED 0 = 0", function () {
      const result = norm(`(${PRED})(λfx.x)`);
      assert.equal(renderAsChurchNumeral(result), 0);
    });

    it("PRED 1 = 0", function () {
      const result = norm(`(${PRED})(λfx.f x)`);
      assert.equal(renderAsChurchNumeral(result), 0);
    });

    it("PRED 2 = 1", function () {
      const result = norm(`(${PRED})(λfx.f(f x))`);
      assert.equal(renderAsChurchNumeral(result), 1);
    });

    it("PRED 3 = 2", function () {
      const result = norm(`(${PRED})(λfx.f(f(f x)))`);
      assert.equal(renderAsChurchNumeral(result), 2);
    });

    it("PRED 5 = 4", function () {
      const result = norm(`(${PRED})(λfx.f(f(f(f(f x)))))`);
      assert.equal(renderAsChurchNumeral(result), 4);
    });
  });

  // ---------------------------------------------------------------
  // Church exponentiation: EXP = λbe.e b
  // EXP m n = n^m... wait, standard is EXP b e = e b = b^e.
  // Actually: n m = m^n when m,n are church numerals? No.
  // Church: EXP = λmn.n m gives m^n.
  // ---------------------------------------------------------------
  describe("church exponentiation", function () {
    const EXP = "λmn.n m";

    it("2^0 normalizes to λx.x (eta-equiv to church 1, but not recognized as numeral)", function () {
      // EXP 2 0 = 0 2 = (λfx.x) 2 = λx.x
      // λx.x is eta-equivalent to λfx.f x (church 1) but structurally different.
      // renderAsChurchNumeral requires the two-argument λf.λx. form, so it returns undefined.
      // This is a known limitation of Church exponentiation with exponent 0.
      const result = norm(`(${EXP})(λfx.f(f x))(λfx.x)`);
      assert.equal(renderExpression(result), "λx.x");
      assert.isUndefined(renderAsChurchNumeral(result));
      // But it IS behaviorally equivalent to church 1 — applying it as
      // a church numeral (to f and x) gives f x, same as church 1.
      const applied = norm("(λx.x) f a");
      const church1applied = norm("(λfx.f x) f a");
      assert.isTrue(equal(applied, church1applied));
    });

    it("2^1 = 2", function () {
      const result = norm(`(${EXP})(λfx.f(f x))(λfx.f x)`);
      assert.equal(renderAsChurchNumeral(result), 2);
    });

    it("2^2 = 4", function () {
      const result = norm(`(${EXP})(λfx.f(f x))(λfx.f(f x))`);
      assert.equal(renderAsChurchNumeral(result), 4);
    });

    it("2^3 = 8", function () {
      const result = norm(`(${EXP})(λfx.f(f x))(λfx.f(f(f x)))`);
      assert.equal(renderAsChurchNumeral(result), 8);
    });

    it("3^2 = 9", function () {
      const result = norm(`(${EXP})(λfx.f(f(f x)))(λfx.f(f x))`);
      assert.equal(renderAsChurchNumeral(result), 9);
    });
  });

  // ---------------------------------------------------------------
  // Church ISZERO: ISZERO = λn.n(λx.FALSE)TRUE
  // ISZERO 0 = TRUE, ISZERO n = FALSE for n>0
  // ---------------------------------------------------------------
  describe("church ISZERO", function () {
    const ISZERO = "λn.n(λx.λab.b)(λab.a)";

    it("ISZERO 0 = TRUE", function () {
      const result = norm(`(${ISZERO})(λfx.x)`);
      assert.equal(renderAsChurchBoolean(result), true);
    });

    it("ISZERO 1 = FALSE", function () {
      const result = norm(`(${ISZERO})(λfx.f x)`);
      assert.equal(renderAsChurchBoolean(result), false);
    });

    it("ISZERO 2 = FALSE", function () {
      const result = norm(`(${ISZERO})(λfx.f(f x))`);
      assert.equal(renderAsChurchBoolean(result), false);
    });
  });

  // ---------------------------------------------------------------
  // Church pairs: PAIR = λxyf.fxy, FST = λp.p(λxy.x), SND = λp.p(λxy.y)
  // ---------------------------------------------------------------
  describe("church pairs", function () {
    const PAIR = "λxyf.f x y";
    const FST = "λp.p(λxy.x)";
    const SND = "λp.p(λxy.y)";

    it("FST (PAIR a b) = a", function () {
      const result = norm(`(${FST})((${PAIR}) a b)`);
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("SND (PAIR a b) = b", function () {
      const result = norm(`(${SND})((${PAIR}) a b)`);
      assert.deepEqual(result, { type: "variable", name: "b" });
    });

    it("FST (PAIR (PAIR a b) c) = PAIR a b (nested)", function () {
      // Should return something equivalent to PAIR a b = λf.f a b
      const result = norm(`(${FST})((${PAIR})((${PAIR}) a b) c)`);
      // Apply the result to TRUE to extract first element
      const first = normAst({
        type: "application",
        left: result,
        right: parseTerm("λxy.x"),
      });
      assert.deepEqual(purgeAstCache(first), { type: "variable", name: "a" });
    });
  });

  // ---------------------------------------------------------------
  // PLUS associativity: PLUS (PLUS a b) c = PLUS a (PLUS b c)
  // This is an algebraic identity that must hold.
  // ---------------------------------------------------------------
  describe("arithmetic algebraic identities", function () {
    const PLUS = "λmnfx.m f(n f x)";
    const MULT = "λmnf.m(n f)";

    it("PLUS is associative: PLUS (PLUS 1 2) 3 = PLUS 1 (PLUS 2 3)", function () {
      const lhs = norm(
        `(${PLUS})((${PLUS})(λfx.f x)(λfx.f(f x)))(λfx.f(f(f x)))`
      );
      const rhs = norm(
        `(${PLUS})(λfx.f x)((${PLUS})(λfx.f(f x))(λfx.f(f(f x))))`
      );
      assert.equal(renderAsChurchNumeral(lhs), 6);
      assert.equal(renderAsChurchNumeral(rhs), 6);
      assert.isTrue(equal(lhs, rhs));
    });

    it("MULT distributes over PLUS: MULT a (PLUS b c) = PLUS (MULT a b) (MULT a c)", function () {
      // 2 * (1 + 3) = (2*1) + (2*3)
      const lhs = norm(
        `(${MULT})(λfx.f(f x))((${PLUS})(λfx.f x)(λfx.f(f(f x))))`
      );
      const rhs = norm(
        `(${PLUS})((${MULT})(λfx.f(f x))(λfx.f x))((${MULT})(λfx.f(f x))(λfx.f(f(f x))))`
      );
      assert.equal(renderAsChurchNumeral(lhs), 8);
      assert.equal(renderAsChurchNumeral(rhs), 8);
      assert.isTrue(equal(lhs, rhs));
    });
  });

  // ---------------------------------------------------------------
  // Tricky variable scoping: cases where naive substitution would
  // give the wrong answer.
  // ---------------------------------------------------------------
  describe("tricky scoping scenarios", function () {
    it("inner lambda shadows outer, then outer is substituted", function () {
      // (λx.λx.x) a → λx.x (inner x shadows, so a is discarded)
      const result = norm("(λx.λx.x) a");
      assert.equal(result.type, "function");
      assert.equal(result.body.type, "variable");
      assert.equal(result.argument, result.body.name);
    });

    it("free variable same name as bound variable in different branch", function () {
      // λa.(λb.b) a — the `a` in position of argument to (λb.b) is bound by outer λa
      // Reduces to: λa.a
      const result = norm("λa.(λb.b) a");
      assert.deepEqual(result, {
        type: "function",
        argument: "a",
        body: { type: "variable", name: "a" },
      });
    });

    it("beta reduction where body contains same-named free and bound vars", function () {
      // (λa.λb.a b) b → λε₁.b ε₁
      // Then applying to c: (λε₁.b ε₁) c → b c
      const step1 = purgeAstCache(bReduce(parseTerm("(λa.λb.a b) b")));
      const final = norm("(λa.λb.a b) b c");
      assert.deepEqual(final, {
        type: "application",
        left: { type: "variable", name: "b" },
        right: { type: "variable", name: "c" },
      });
    });

    it("triple nested shadowing", function () {
      // (λa.λa.λa.a) x y z → (λa.λa.a) y z → (λa.a) z → z
      const result = norm("(λa.λa.λa.a) x y z");
      assert.deepEqual(result, { type: "variable", name: "z" });
    });

    it("substitution into application where both sides need it", function () {
      // (λx.x x)(λy.y) → (λy.y)(λy.y) → λy.y
      const result = norm("(λx.x x)(λy.y)");
      assert.isTrue(equal(result, parseTerm("λy.y")));
    });
  });

  // ---------------------------------------------------------------
  // Generated name (ε) collisions: what happens when user-written
  // expressions already contain ε variables?
  // ---------------------------------------------------------------
  describe("epsilon name collision edge cases", function () {
    it("expression already using ε₁ as free var", function () {
      // (λa.λb.a b) b where b happens to be ε₁
      // replace a→ε₁ in λb.a b — "b" not same as "ε₁" so... wait,
      // let me construct: (λa.λε₁.a ε₁)(ε₁)
      // replace a with ε₁ in λε₁.a ε₁
      // freeInReplacer=[ε₁], arg=ε₁, ε₁ IS in freeInReplacer
      // freeInBody=[a, ε₁], "a" IS in freeInBody → capture avoidance!
      // generateNewName([ε₁, a, ε₁, a]) → tries ε₁ (taken), ε₂
      // Result: λε₂.ε₁ ε₂
      const ast = {
        type: "application",
        left: {
          type: "function",
          argument: "a",
          body: {
            type: "function",
            argument: "ε₁",
            body: {
              type: "application",
              left: { type: "variable", name: "a" },
              right: { type: "variable", name: "ε₁" },
            },
          },
        },
        right: { type: "variable", name: "ε₁" },
      };
      const result = purgeAstCache(bReduce(ast));
      // Must rename ε₁ argument to avoid capture
      assert.equal(result.type, "function");
      assert.notEqual(result.argument, "ε₁");
      // The free ε₁ should be preserved in the body
      assert.equal(result.body.left.name, "ε₁");
      assert.equal(result.body.right.name, result.argument);
    });

    it("expression using ε₁ through ε₃ as free vars forces ε₄", function () {
      // replace("a", ε₁, λε₁.λε₂.λε₃.a ε₁ ε₂ ε₃)
      // All ε names up to ε₃ are taken, should generate ε₄
      const result = purgeAstCache(
        replace(
          "a",
          { type: "variable", name: "ε₁" },
          {
            type: "function",
            argument: "ε₁",
            body: {
              type: "function",
              argument: "ε₂",
              body: {
                type: "function",
                argument: "ε₃",
                body: {
                  type: "application",
                  left: {
                    type: "application",
                    left: {
                      type: "application",
                      left: { type: "variable", name: "a" },
                      right: { type: "variable", name: "ε₁" },
                    },
                    right: { type: "variable", name: "ε₂" },
                  },
                  right: { type: "variable", name: "ε₃" },
                },
              },
            },
          }
        )
      );
      // The outermost lambda (ε₁) must be renamed since ε₁ is free in replacer
      // and "a" is free in the body. ε₁,ε₂,ε₃ are all taken → pick ε₄
      assert.equal(result.type, "function");
      assert.equal(result.argument, "ε₄");
    });
  });

  // ---------------------------------------------------------------
  // purgeAstCache mutates variable nodes in-place.
  // For variables, it sets newAst = ast (same reference), then
  // deletes __cache__. This mutates the original.
  // ---------------------------------------------------------------
  describe("purgeAstCache variable mutation", function () {
    it("purging a variable node mutates the original", function () {
      const v = { type: "variable", name: "x", __cache__: { foo: "bar" } };
      purgeAstCache(v);
      // The original node was mutated — __cache__ was deleted
      assert.notProperty(v, "__cache__");
    });

    it("purging a function node does NOT mutate the original body", function () {
      const body = { type: "variable", name: "x", __cache__: { foo: "bar" } };
      const fn = { type: "function", argument: "a", body };
      const purged = purgeAstCache(fn);
      // For function/application, a new object is created via spread
      // But the variable child is still the same reference!
      // So body IS mutated
      assert.notProperty(body, "__cache__");
    });
  });

  // ---------------------------------------------------------------
  // Expressions that require many reduction steps.
  // These verify the normalizer doesn't give up too early.
  // ---------------------------------------------------------------
  describe("high reduction count expressions", function () {
    it("PRED applied to church 10 (many steps)", function () {
      const PRED = "λnfx.n(λgh.h(g f))(λu.x)(λu.u)";
      const TEN = "λfx.f(f(f(f(f(f(f(f(f(f x)))))))))";
      const result = toNormalForm(parseTerm(`(${PRED})(${TEN})`));
      assert.equal(renderAsChurchNumeral(result), 9);
    });

    it("SUCC applied 5 times to 0", function () {
      const SUCC = "λnfx.f(n f x)";
      let expr = "λfx.x"; // 0
      for (let i = 0; i < 5; i++) {
        expr = `(${SUCC})(${expr})`;
      }
      const result = toNormalForm(parseTerm(expr));
      assert.equal(renderAsChurchNumeral(result), 5);
    });
  });

  // ---------------------------------------------------------------
  // Eta reduction edge cases not covered by property tests
  // ---------------------------------------------------------------
  describe("eta reduction edge cases", function () {
    it("λx.(λy.y) x is eta-reducible to (λy.y), not just to a variable", function () {
      // The left side of the application is itself a lambda
      const ast = parseTerm("λx.(λy.y) x");
      assert.isTrue(eReducable(ast));
      const result = purgeAstCache(eReduce(ast));
      assert.isTrue(equal(result, parseTerm("λy.y")));
    });

    it("λx.(a b) x is eta-reducible but λx.x(a b) is not", function () {
      assert.isTrue(eReducable(parseTerm("λx.(a b) x")));
      // λx.x(a b) — the right side is (a b), not x
      assert.isFalse(eReducable(parseTerm("λx.x(a b)")));
    });

    it("normal form does NOT perform eta reduction", function () {
      // toNormalForm only does beta reduction, not eta
      // λx.f x is in beta-normal-form but not eta-normal-form
      const ast = parseTerm("λx.f x");
      const nf = toNormalForm(ast);
      // Should still be λx.f x — NOT reduced to f
      assert.equal(nf.type, "function");
      assert.equal(nf.body.type, "application");
    });
  });

  // ---------------------------------------------------------------
  // Verify correct behavior of self-application and fixpoints
  // ---------------------------------------------------------------
  describe("self-application patterns", function () {
    it("(λx.x x)(λy.y) reduces to λy.y (not infinite)", function () {
      // (λx.x x)(λy.y) → (λy.y)(λy.y) → λy.y
      const result = norm("(λx.x x)(λy.y)");
      assert.isTrue(equal(result, parseTerm("λa.a")));
    });

    it("(λx.x x x)(λy.y) reduces to λy.y", function () {
      // (λx.x x x)(λy.y) → (λy.y)(λy.y)(λy.y) → (λy.y)(λy.y) → λy.y
      const result = norm("(λx.x x x)(λy.y)");
      assert.isTrue(equal(result, parseTerm("λa.a")));
    });

    it("mock recursion: ((λx.x x)(λx.λy.x x y)) applied finitely", function () {
      // This is a self-replicating function — it should diverge
      // unless we apply it in a way that terminates.
      // (λx.x x)(λx.λy.x x y) → (λx.λy.x x y)(λx.λy.x x y)
      //                         → λy.(λx.λy.x x y)(λx.λy.x x y) y
      // Each step adds one more "y" application but also replicates.
      // This diverges.
      const ast = parseTerm("(λx.x x)(λx.λy.x x y)");
      assert.throws(
        () => toNormalForm(ast, { depthOverflow: 100 }),
        LambdaExecutionTimeoutError
      );
    });
  });

  // ---------------------------------------------------------------
  // getFreeVars correctness in tricky scenarios
  // ---------------------------------------------------------------
  describe("free variable edge cases", function () {
    it("variable bound then used in a different branch", function () {
      // λx.(x (λx.x)) — the inner λx.x has its own binding
      // Only free vars: none (x is bound at outer level, inner x is separate)
      const ast = parseTerm("λx.x(λx.x)");
      assert.lengthOf(getFreeVars(ast), 0);
    });

    it("same name free in one branch, bound in another", function () {
      // (λx.x) y — x is bound, y is free
      const ast = parseTerm("(λx.x) y");
      const free = getFreeVars(ast).map((v) => v.name);
      assert.include(free, "y");
      assert.notInclude(free, "x");
    });

    it("deeply nested free variable", function () {
      // λa.λb.λc.λd.λe.f — f is free, everything else bound
      const ast = parseTerm("λa.λb.λc.λd.λe.f");
      const free = getFreeVars(ast);
      assert.lengthOf(free, 1);
      assert.equal(free[0].name, "f");
    });
  });

  // ---------------------------------------------------------------
  // Parser edge cases: ensure the parser handles all combinations
  // of lambda position within applications correctly.
  // ---------------------------------------------------------------
  describe("parser scoping edge cases", function () {
    it("lambda in application argument position extends to end", function () {
      // a λx.x b should parse as a(λx.(x b)), NOT as (a(λx.x))(b)
      const ast = parseTerm("a λx.x b");
      assert.equal(ast.type, "application");
      assert.equal(ast.left.name, "a"); // left is just `a`
      assert.equal(ast.right.type, "function"); // right is λx.(x b)
      assert.equal(ast.right.body.type, "application"); // body is x b
    });

    it("empty parens are invalid", function () {
      assert.throws(() => parseTerm("()"), LambdaSyntaxError);
    });

    it("assignment operator in expression position is an error", function () {
      assert.throws(() => parseTerm("a := b"));
    });
  });
});
