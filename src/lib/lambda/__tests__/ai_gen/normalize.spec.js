import { assert } from "chai";
import { toNormalForm, leftmostOutermostRedex } from "../../normalize.js";
import { purgeAstCache } from "../../util.js";
import { parseTerm } from "../../parser.js";
import { renderExpression } from "../../renderer.js";
import { LambdaExecutionTimeoutError } from "../../errors.js";

describe("Normalize (comprehensive)", function () {
  describe("toNormalForm", function () {
    it("identity applied to a variable", function () {
      const ast = parseTerm("(λx.x) a");
      const result = purgeAstCache(toNormalForm(ast));
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("already in normal form (variable)", function () {
      const ast = parseTerm("x");
      const result = toNormalForm(ast);
      assert.deepEqual(result, { type: "variable", name: "x" });
    });

    it("already in normal form (lambda)", function () {
      const ast = parseTerm("λx.x");
      const result = toNormalForm(ast);
      assert.equal(result.type, "function");
    });

    it("already in normal form (free application)", function () {
      const ast = parseTerm("a b");
      const result = toNormalForm(ast);
      assert.equal(result.type, "application");
    });

    it("reduces church numeral application: SUCC 0 = 1", function () {
      // SUCC = λnfx.f(n f x), 0 = λfx.x
      const ast = parseTerm("(λnfx.f(n f x))(λfx.x)");
      const result = purgeAstCache(toNormalForm(ast));
      // Should be equivalent to church 1: λfx.f x
      assert.equal(result.type, "function");
      assert.equal(result.body.type, "function");
      assert.equal(result.body.body.type, "application");
    });

    it("reduces multiple redexes: (λx.x)((λy.y) a)", function () {
      const ast = parseTerm("(λx.x)((λy.y) a)");
      const result = purgeAstCache(toNormalForm(ast));
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("reduces K combinator applied to two args: K a b = a", function () {
      const ast = parseTerm("(λxy.x) a b");
      const result = purgeAstCache(toNormalForm(ast));
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("reduces nested redexes inside lambda body", function () {
      // λa.(λx.x) a → λa.a
      const ast = parseTerm("λa.(λx.x) a");
      const result = purgeAstCache(toNormalForm(ast));
      assert.deepEqual(result, {
        type: "function",
        argument: "a",
        body: { type: "variable", name: "a" },
      });
    });

    it("reduces church TRUE applied to args: (λxy.x) a b → a", function () {
      const ast = parseTerm("(λxy.x) a b");
      const result = purgeAstCache(toNormalForm(ast));
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("reduces church FALSE applied to args: (λxy.y) a b → b", function () {
      const ast = parseTerm("(λxy.y) a b");
      const result = purgeAstCache(toNormalForm(ast));
      assert.deepEqual(result, { type: "variable", name: "b" });
    });

    it("reduces self-application of identity: (λx.x)(λx.x) → λx.x", function () {
      const ast = parseTerm("(λx.x)(λx.x)");
      const result = purgeAstCache(toNormalForm(ast));
      assert.equal(result.type, "function");
      assert.equal(result.body.type, "variable");
      assert.equal(result.argument, result.body.name);
    });

    it("handles deeply nested reductions", function () {
      // ((λa.a)(λb.b)(λc.c)) d → d
      const ast = parseTerm("(λa.a)(λb.b)(λc.c) d");
      const result = purgeAstCache(toNormalForm(ast));
      assert.deepEqual(result, { type: "variable", name: "d" });
    });
  });

  describe("toNormalForm depth overflow", function () {
    it("throws LambdaExecutionTimeoutError for omega combinator", function () {
      // (λx.x x)(λx.x x) diverges
      const ast = parseTerm("(λx.x x)(λx.x x)");
      assert.throws(
        () => toNormalForm(ast),
        LambdaExecutionTimeoutError
      );
    });

    it("respects custom depth limit", function () {
      const ast = parseTerm("(λx.x x)(λx.x x)");
      assert.throws(
        () => toNormalForm(ast, 5),
        LambdaExecutionTimeoutError
      );
    });

    it("error has correct name", function () {
      const ast = parseTerm("(λx.x x)(λx.x x)");
      try {
        toNormalForm(ast, 5);
        assert.fail("should have thrown");
      } catch (e) {
        assert.equal(e.name, "LambdaExecutionTimeoutError");
      }
    });

    it("succeeds within depth limit for simple expressions", function () {
      const ast = parseTerm("(λx.x) a");
      // Should not throw even with a small limit
      const result = purgeAstCache(toNormalForm(ast, 5));
      assert.deepEqual(result, { type: "variable", name: "a" });
    });
  });

  describe("leftmostOutermostRedex", function () {
    it("reduces top-level redex", function () {
      const ast = parseTerm("(λx.x) a");
      const result = purgeAstCache(leftmostOutermostRedex(ast));
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("returns undefined for variable", function () {
      assert.isUndefined(leftmostOutermostRedex({ type: "variable", name: "x" }));
    });

    it("returns undefined for irreducible application", function () {
      const ast = parseTerm("a b");
      assert.isUndefined(leftmostOutermostRedex(ast));
    });

    it("returns undefined for irreducible lambda", function () {
      const ast = parseTerm("λx.x");
      assert.isUndefined(leftmostOutermostRedex(ast));
    });

    it("reduces inside lambda body", function () {
      // λa.(λx.x) b → λa.b
      const ast = parseTerm("λa.(λx.x) b");
      const result = purgeAstCache(leftmostOutermostRedex(ast));
      assert.deepEqual(result, {
        type: "function",
        argument: "a",
        body: { type: "variable", name: "b" },
      });
    });

    it("reduces left side of application first", function () {
      // ((λx.x) a) ((λy.y) b) → a ((λy.y) b) (left reduced first)
      const ast = parseTerm("((λx.x) a)((λy.y) b)");
      const result = purgeAstCache(leftmostOutermostRedex(ast));
      assert.equal(result.type, "application");
      assert.deepEqual(result.left, { type: "variable", name: "a" });
      // right side should still be unreduced
      assert.equal(result.right.type, "application");
      assert.equal(result.right.left.type, "function");
    });

    it("reduces right side when left is irreducible", function () {
      // a ((λx.x) b) → a b
      const ast = parseTerm("a ((λx.x) b)");
      const result = purgeAstCache(leftmostOutermostRedex(ast));
      assert.deepEqual(result, {
        type: "application",
        left: { type: "variable", name: "a" },
        right: { type: "variable", name: "b" },
      });
    });

    it("prefers outermost redex over inner redex", function () {
      // (λx.x) ((λy.y) a) → (λy.y) a (outer applied first, not inner)
      const ast = parseTerm("(λx.x)((λy.y) a)");
      const result = purgeAstCache(leftmostOutermostRedex(ast));
      // Result should be (λy.y) a — the outer redex was reduced
      assert.equal(result.type, "application");
      assert.equal(result.left.type, "function");
      assert.equal(result.right.name, "a");
    });

    it("returns undefined for deeply nested irreducible expression", function () {
      const ast = parseTerm("λa.λb.a(b c)");
      assert.isUndefined(leftmostOutermostRedex(ast));
    });
  });
});
