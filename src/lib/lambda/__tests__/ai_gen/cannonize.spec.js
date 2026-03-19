import { assert } from "chai";
import { cannonize } from "../../cannonize.js";
import { purgeAstCache } from "../../util.js";
import { parseTerm } from "../../parser.js";

describe("Cannonize (comprehensive)", function () {
  describe("basic canonicalization", function () {
    it("canonicalizes identity function", function () {
      const result = purgeAstCache(cannonize(parseTerm("λx.x")));
      assert.equal(result.type, "function");
      assert.equal(result.argument, "[_c1]");
      assert.equal(result.body.name, "[_c1]");
    });

    it("canonicalizes two-argument lambda", function () {
      const result = purgeAstCache(cannonize(parseTerm("λab.a")));
      assert.equal(result.argument, "[_c1]");
      assert.equal(result.body.argument, "[_c2]");
      assert.equal(result.body.body.name, "[_c1]");
    });

    it("leaves free variables unchanged", function () {
      const result = purgeAstCache(cannonize(parseTerm("λx.x y")));
      assert.equal(result.argument, "[_c1]");
      assert.equal(result.body.left.name, "[_c1]");
      assert.equal(result.body.right.name, "y"); // free var preserved
    });

    it("canonicalizes variable expression (no-op)", function () {
      const result = purgeAstCache(cannonize({ type: "variable", name: "x" }));
      assert.deepEqual(result, { type: "variable", name: "x" });
    });

    it("canonicalizes application of free variables (no-op)", function () {
      const result = purgeAstCache(cannonize(parseTerm("a b")));
      assert.deepEqual(result, {
        type: "application",
        left: { type: "variable", name: "a" },
        right: { type: "variable", name: "b" },
      });
    });
  });

  describe("alpha-equivalent expressions canonicalize identically", function () {
    it("identity: λx.x and λy.y", function () {
      const a = purgeAstCache(cannonize(parseTerm("λx.x")));
      const b = purgeAstCache(cannonize(parseTerm("λy.y")));
      assert.deepEqual(a, b);
    });

    it("church TRUE: λab.a and λxy.x", function () {
      const a = purgeAstCache(cannonize(parseTerm("λab.a")));
      const b = purgeAstCache(cannonize(parseTerm("λxy.x")));
      assert.deepEqual(a, b);
    });

    it("church FALSE: λab.b and λpq.q", function () {
      const a = purgeAstCache(cannonize(parseTerm("λab.b")));
      const b = purgeAstCache(cannonize(parseTerm("λpq.q")));
      assert.deepEqual(a, b);
    });

    it("church 2: λfx.f(fx) and λab.a(ab)", function () {
      const a = purgeAstCache(cannonize(parseTerm("λfx.f(f x)")));
      const b = purgeAstCache(cannonize(parseTerm("λab.a(a b)")));
      assert.deepEqual(a, b);
    });

    it("nested lambdas: λa.λb.λc.a b c and λx.λy.λz.x y z", function () {
      const a = purgeAstCache(cannonize(parseTerm("λa.λb.λc.a b c")));
      const b = purgeAstCache(cannonize(parseTerm("λx.λy.λz.x y z")));
      assert.deepEqual(a, b);
    });
  });

  describe("non-alpha-equivalent expressions canonicalize differently", function () {
    it("λab.a and λab.b produce different canonical forms", function () {
      const a = purgeAstCache(cannonize(parseTerm("λab.a")));
      const b = purgeAstCache(cannonize(parseTerm("λab.b")));
      assert.notDeepEqual(a, b);
    });

    it("λx.x and λxy.x produce different canonical forms", function () {
      const a = purgeAstCache(cannonize(parseTerm("λx.x")));
      const b = purgeAstCache(cannonize(parseTerm("λxy.x")));
      assert.notDeepEqual(a, b);
    });

    it("church 0 and church 1 produce different canonical forms", function () {
      const a = purgeAstCache(cannonize(parseTerm("λfx.x")));
      const b = purgeAstCache(cannonize(parseTerm("λfx.f x")));
      assert.notDeepEqual(a, b);
    });
  });

  describe("memoization", function () {
    it("returns same result for same AST object", function () {
      const ast = parseTerm("λx.x");
      const a = cannonize(ast);
      const b = cannonize(ast);
      assert.equal(a, b); // same reference due to cache
    });
  });

  describe("naming scheme", function () {
    it("uses sequential [_cN] naming", function () {
      const result = purgeAstCache(cannonize(parseTerm("λabc.a b c")));
      assert.equal(result.argument, "[_c1]");
      assert.equal(result.body.argument, "[_c2]");
      assert.equal(result.body.body.argument, "[_c3]");
    });

    it("numbers in-order of lambda nesting", function () {
      // λa.λb.b a should become λ[_c1].λ[_c2].[_c2] [_c1]
      const result = purgeAstCache(cannonize(parseTerm("λa.λb.b a")));
      assert.equal(result.argument, "[_c1]");
      assert.equal(result.body.argument, "[_c2]");
      assert.equal(result.body.body.left.name, "[_c2]");
      assert.equal(result.body.body.right.name, "[_c1]");
    });
  });
});
