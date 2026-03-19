import { assert } from "chai";
import { cacheOnAst, purgeAstCache, getFreeVars, getAllArgumentNames } from "../../util.js";
import { parseTerm } from "../../parser.js";

describe("Util (comprehensive)", function () {
  describe("cacheOnAst", function () {
    it("caches result on first call", function () {
      const fn = cacheOnAst((ast) => 42);
      const ast = { type: "variable", name: "x" };
      assert.equal(fn(ast), 42);
    });

    it("returns cached result on second call", function () {
      let count = 0;
      const fn = cacheOnAst(() => ++count);
      const ast = { type: "variable", name: "x" };
      fn(ast);
      fn(ast);
      assert.equal(count, 1);
    });

    it("recomputes for different AST nodes", function () {
      let count = 0;
      const fn = cacheOnAst(() => ++count);
      fn({ type: "variable", name: "x" });
      fn({ type: "variable", name: "y" });
      assert.equal(count, 2);
    });

    it("stores cache in __cache__ property", function () {
      const fn = cacheOnAst((ast) => "result");
      const ast = { type: "variable", name: "x" };
      fn(ast);
      assert.property(ast, "__cache__");
    });

    it("different cached functions use different keys", function () {
      const fn1 = cacheOnAst((ast) => "a");
      const fn2 = cacheOnAst((ast) => "b");
      const ast = { type: "variable", name: "x" };
      assert.equal(fn1(ast), "a");
      assert.equal(fn2(ast), "b");
    });

    it("invalidates cache if computedWith doesn't match", function () {
      let count = 0;
      const fn = cacheOnAst(() => ++count);
      const ast = { type: "variable", name: "x" };
      fn(ast);
      // Manually corrupt the cache
      const key = Object.keys(ast.__cache__)[0];
      ast.__cache__[key].computedWith = {};
      fn(ast);
      assert.equal(count, 2);
    });
  });

  describe("purgeAstCache", function () {
    it("returns variable as-is when no cache", function () {
      const ast = { type: "variable", name: "x" };
      assert.deepEqual(purgeAstCache(ast), ast);
    });

    it("removes cache from variable", function () {
      const fn = cacheOnAst(() => "val");
      const ast = { type: "variable", name: "x" };
      fn(ast);
      const purged = purgeAstCache(ast);
      assert.notProperty(purged, "__cache__");
    });

    it("removes cache from function body", function () {
      const fn = cacheOnAst(() => "val");
      const body = { type: "variable", name: "x" };
      fn(body);
      const ast = { type: "function", argument: "a", body };
      const purged = purgeAstCache(ast);
      assert.notProperty(purged.body, "__cache__");
    });

    it("removes cache from application children", function () {
      const fn = cacheOnAst(() => "val");
      const left = { type: "variable", name: "a" };
      const right = { type: "variable", name: "b" };
      fn(left);
      fn(right);
      const ast = { type: "application", left, right };
      const purged = purgeAstCache(ast);
      assert.notProperty(purged.left, "__cache__");
      assert.notProperty(purged.right, "__cache__");
    });

    it("recursively removes cache from nested structures", function () {
      const fn = cacheOnAst(() => "val");
      const deepVar = { type: "variable", name: "x" };
      fn(deepVar);
      const ast = {
        type: "function",
        argument: "a",
        body: {
          type: "application",
          left: deepVar,
          right: { type: "variable", name: "b" },
        },
      };
      fn(ast.body);
      const purged = purgeAstCache(ast);
      assert.notProperty(purged.body, "__cache__");
      assert.notProperty(purged.body.left, "__cache__");
    });
  });

  describe("getFreeVars", function () {
    it("returns the variable itself for a free variable", function () {
      const ast = { type: "variable", name: "x" };
      const free = getFreeVars(ast);
      assert.lengthOf(free, 1);
      assert.equal(free[0].name, "x");
    });

    it("returns empty for identity function", function () {
      const ast = parseTerm("λx.x");
      assert.lengthOf(getFreeVars(ast), 0);
    });

    it("returns free variable from lambda body", function () {
      const ast = parseTerm("λx.y");
      const free = getFreeVars(ast);
      assert.lengthOf(free, 1);
      assert.equal(free[0].name, "y");
    });

    it("returns free variables from application", function () {
      const ast = parseTerm("a b");
      const free = getFreeVars(ast);
      assert.lengthOf(free, 2);
      const names = free.map((v) => v.name);
      assert.include(names, "a");
      assert.include(names, "b");
    });

    it("deduplicates free variables", function () {
      // a a — 'a' appears twice but should be returned once
      const ast = parseTerm("a a");
      const free = getFreeVars(ast);
      assert.lengthOf(free, 1);
      assert.equal(free[0].name, "a");
    });

    it("filters out bound variables", function () {
      const ast = parseTerm("λa.a b");
      const free = getFreeVars(ast);
      assert.lengthOf(free, 1);
      assert.equal(free[0].name, "b");
    });

    it("handles nested lambdas correctly", function () {
      // λa.λb.a c — only c is free
      const ast = parseTerm("λa.λb.a c");
      const free = getFreeVars(ast);
      assert.lengthOf(free, 1);
      assert.equal(free[0].name, "c");
    });

    it("handles shadowing", function () {
      // λa.λa.a — no free vars
      const ast = parseTerm("λa.λa.a");
      assert.lengthOf(getFreeVars(ast), 0);
    });

    it("returns empty for closed expression", function () {
      const ast = parseTerm("λab.a b");
      assert.lengthOf(getFreeVars(ast), 0);
    });

    it("finds free vars in complex expression", function () {
      // λa.a b c — b and c are free
      const ast = parseTerm("λa.a b c");
      const free = getFreeVars(ast);
      assert.lengthOf(free, 2);
      const names = free.map((v) => v.name);
      assert.include(names, "b");
      assert.include(names, "c");
    });
  });

  describe("getAllArgumentNames", function () {
    it("returns empty for variable", function () {
      assert.deepEqual(
        getAllArgumentNames({ type: "variable", name: "x" }),
        []
      );
    });

    it("returns single argument for identity", function () {
      const ast = parseTerm("λx.x");
      const args = getAllArgumentNames(ast);
      assert.include(args, "x");
    });

    it("returns all arguments for multi-arg lambda", function () {
      const ast = parseTerm("λabc.a");
      const args = getAllArgumentNames(ast);
      assert.include(args, "a");
      assert.include(args, "b");
      assert.include(args, "c");
    });

    it("returns arguments from nested applications", function () {
      // (λa.a)(λb.b) — both a and b are argument names
      const ast = parseTerm("(λa.a)(λb.b)");
      const args = getAllArgumentNames(ast);
      assert.include(args, "a");
      assert.include(args, "b");
    });

    it("returns empty for application of free variables", function () {
      const ast = parseTerm("a b");
      assert.deepEqual(getAllArgumentNames(ast), []);
    });

    it("handles deeply nested lambdas", function () {
      const ast = parseTerm("λa.λb.λc.λd.a");
      const args = getAllArgumentNames(ast);
      assert.lengthOf(args, 4);
    });
  });
});
