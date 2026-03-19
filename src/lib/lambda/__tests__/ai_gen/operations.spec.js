import { assert } from "chai";
import { bReducable, bReduce, eReducable, eReduce, replace } from "../../operations.js";
import { purgeAstCache } from "../../util.js";
import { parseTerm } from "../../parser.js";

describe("Operations (comprehensive)", function () {
  describe("bReducable", function () {
    it("returns true for application with function on left", function () {
      assert.isTrue(
        bReducable({
          type: "application",
          left: {
            type: "function",
            argument: "x",
            body: { type: "variable", name: "x" },
          },
          right: { type: "variable", name: "y" },
        })
      );
    });

    it("returns false for application with variable on left", function () {
      assert.isFalse(
        bReducable({
          type: "application",
          left: { type: "variable", name: "f" },
          right: { type: "variable", name: "x" },
        })
      );
    });

    it("returns false for application with application on left", function () {
      assert.isFalse(
        bReducable({
          type: "application",
          left: {
            type: "application",
            left: { type: "variable", name: "a" },
            right: { type: "variable", name: "b" },
          },
          right: { type: "variable", name: "c" },
        })
      );
    });

    it("returns false for a function expression", function () {
      assert.isFalse(
        bReducable({
          type: "function",
          argument: "x",
          body: { type: "variable", name: "x" },
        })
      );
    });

    it("returns false for a variable expression", function () {
      assert.isFalse(bReducable({ type: "variable", name: "x" }));
    });
  });

  describe("bReduce", function () {
    it("reduces identity applied to a variable", function () {
      // (λx.x) y → y
      const ast = parseTerm("(λx.x) y");
      const result = purgeAstCache(bReduce(ast));
      assert.deepEqual(result, { type: "variable", name: "y" });
    });

    it("returns undefined for non-reducible expression", function () {
      assert.isUndefined(bReduce({ type: "variable", name: "x" }));
    });

    it("returns undefined for application of variables", function () {
      assert.isUndefined(
        bReduce({
          type: "application",
          left: { type: "variable", name: "a" },
          right: { type: "variable", name: "b" },
        })
      );
    });

    it("reduces constant function: (λx.y) z → y", function () {
      const ast = {
        type: "application",
        left: {
          type: "function",
          argument: "x",
          body: { type: "variable", name: "y" },
        },
        right: { type: "variable", name: "z" },
      };
      const result = purgeAstCache(bReduce(ast));
      assert.deepEqual(result, { type: "variable", name: "y" });
    });

    it("reduces with application body: (λx.x a) b → b a", function () {
      const ast = {
        type: "application",
        left: {
          type: "function",
          argument: "x",
          body: {
            type: "application",
            left: { type: "variable", name: "x" },
            right: { type: "variable", name: "a" },
          },
        },
        right: { type: "variable", name: "b" },
      };
      const result = purgeAstCache(bReduce(ast));
      assert.deepEqual(result, {
        type: "application",
        left: { type: "variable", name: "b" },
        right: { type: "variable", name: "a" },
      });
    });

    it("reduces when argument appears multiple times", function () {
      // (λx.x x) a → a a
      const ast = {
        type: "application",
        left: {
          type: "function",
          argument: "x",
          body: {
            type: "application",
            left: { type: "variable", name: "x" },
            right: { type: "variable", name: "x" },
          },
        },
        right: { type: "variable", name: "a" },
      };
      const result = purgeAstCache(bReduce(ast));
      assert.deepEqual(result, {
        type: "application",
        left: { type: "variable", name: "a" },
        right: { type: "variable", name: "a" },
      });
    });

    it("handles shadowing correctly", function () {
      // (λx.λx.x) a → λx.x (inner x shadows)
      const ast = {
        type: "application",
        left: {
          type: "function",
          argument: "x",
          body: {
            type: "function",
            argument: "x",
            body: { type: "variable", name: "x" },
          },
        },
        right: { type: "variable", name: "a" },
      };
      const result = purgeAstCache(bReduce(ast));
      assert.deepEqual(result, {
        type: "function",
        argument: "x",
        body: { type: "variable", name: "x" },
      });
    });

    it("performs capture avoidance", function () {
      // (λa.λb.a b) b → λε₁.b ε₁ (renames b to avoid capture)
      const ast = {
        type: "application",
        left: {
          type: "function",
          argument: "a",
          body: {
            type: "function",
            argument: "b",
            body: {
              type: "application",
              left: { type: "variable", name: "a" },
              right: { type: "variable", name: "b" },
            },
          },
        },
        right: { type: "variable", name: "b" },
      };
      const result = purgeAstCache(bReduce(ast));
      // The inner lambda should be renamed to avoid capturing 'b'
      assert.equal(result.type, "function");
      assert.notEqual(result.argument, "b");
      assert.equal(result.body.left.name, "b");
      assert.equal(result.body.right.name, result.argument);
    });

    it("reduces when replacing with a complex expression", function () {
      // (λx.x) (λy.y) → λy.y
      const ast = {
        type: "application",
        left: {
          type: "function",
          argument: "x",
          body: { type: "variable", name: "x" },
        },
        right: {
          type: "function",
          argument: "y",
          body: { type: "variable", name: "y" },
        },
      };
      const result = purgeAstCache(bReduce(ast));
      assert.deepEqual(result, {
        type: "function",
        argument: "y",
        body: { type: "variable", name: "y" },
      });
    });
  });

  describe("eReducable", function () {
    it("returns true for η-reducible expression: λx.f x", function () {
      assert.isTrue(
        eReducable({
          type: "function",
          argument: "x",
          body: {
            type: "application",
            left: { type: "variable", name: "f" },
            right: { type: "variable", name: "x" },
          },
        })
      );
    });

    it("returns false when right side doesn't match argument", function () {
      assert.isFalse(
        eReducable({
          type: "function",
          argument: "x",
          body: {
            type: "application",
            left: { type: "variable", name: "f" },
            right: { type: "variable", name: "y" },
          },
        })
      );
    });

    it("returns false when argument is free in function part", function () {
      // λx.x x — x is free in the left side
      assert.isFalse(
        eReducable({
          type: "function",
          argument: "x",
          body: {
            type: "application",
            left: { type: "variable", name: "x" },
            right: { type: "variable", name: "x" },
          },
        })
      );
    });

    it("returns false for non-function expression", function () {
      assert.isFalse(eReducable({ type: "variable", name: "x" }));
    });

    it("returns false for function with non-application body", function () {
      assert.isFalse(
        eReducable({
          type: "function",
          argument: "x",
          body: { type: "variable", name: "x" },
        })
      );
    });

    it("returns false when body right is not a variable", function () {
      assert.isFalse(
        eReducable({
          type: "function",
          argument: "x",
          body: {
            type: "application",
            left: { type: "variable", name: "f" },
            right: {
              type: "application",
              left: { type: "variable", name: "a" },
              right: { type: "variable", name: "b" },
            },
          },
        })
      );
    });

    it("returns true for complex left side without free argument", function () {
      // λx.(a b) x — x not free in (a b)
      assert.isTrue(
        eReducable({
          type: "function",
          argument: "x",
          body: {
            type: "application",
            left: {
              type: "application",
              left: { type: "variable", name: "a" },
              right: { type: "variable", name: "b" },
            },
            right: { type: "variable", name: "x" },
          },
        })
      );
    });
  });

  describe("eReduce", function () {
    it("η-reduces λx.f x to f", function () {
      const result = purgeAstCache(eReduce({
        type: "function",
        argument: "x",
        body: {
          type: "application",
          left: { type: "variable", name: "f" },
          right: { type: "variable", name: "x" },
        },
      }));
      assert.deepEqual(result, { type: "variable", name: "f" });
    });

    it("η-reduces λx.(a b) x to (a b)", function () {
      const result = purgeAstCache(eReduce({
        type: "function",
        argument: "x",
        body: {
          type: "application",
          left: {
            type: "application",
            left: { type: "variable", name: "a" },
            right: { type: "variable", name: "b" },
          },
          right: { type: "variable", name: "x" },
        },
      }));
      assert.deepEqual(result, {
        type: "application",
        left: { type: "variable", name: "a" },
        right: { type: "variable", name: "b" },
      });
    });

    it("returns undefined for non-η-reducible expression", function () {
      assert.isUndefined(eReduce({ type: "variable", name: "x" }));
    });

    it("returns undefined when argument is free in left side", function () {
      assert.isUndefined(
        eReduce({
          type: "function",
          argument: "x",
          body: {
            type: "application",
            left: { type: "variable", name: "x" },
            right: { type: "variable", name: "x" },
          },
        })
      );
    });
  });

  describe("replace", function () {
    it("replaces a variable with matching name", function () {
      const result = replace(
        "x",
        { type: "variable", name: "y" },
        { type: "variable", name: "x" }
      );
      assert.deepEqual(result, { type: "variable", name: "y" });
    });

    it("does not replace a variable with non-matching name", function () {
      const expr = { type: "variable", name: "z" };
      const result = replace("x", { type: "variable", name: "y" }, expr);
      assert.equal(result, expr); // same reference
    });

    it("replaces inside application", function () {
      const result = purgeAstCache(
        replace(
          "x",
          { type: "variable", name: "y" },
          {
            type: "application",
            left: { type: "variable", name: "x" },
            right: { type: "variable", name: "x" },
          }
        )
      );
      assert.deepEqual(result, {
        type: "application",
        left: { type: "variable", name: "y" },
        right: { type: "variable", name: "y" },
      });
    });

    it("respects shadowing in lambda", function () {
      // replace x with y in λx.x → λx.x (x is bound, not replaced)
      const expr = {
        type: "function",
        argument: "x",
        body: { type: "variable", name: "x" },
      };
      const result = replace("x", { type: "variable", name: "y" }, expr);
      assert.equal(result, expr); // same reference — shadowed
    });

    it("replaces inside lambda body when not shadowed", function () {
      const result = purgeAstCache(
        replace(
          "x",
          { type: "variable", name: "y" },
          {
            type: "function",
            argument: "a",
            body: { type: "variable", name: "x" },
          }
        )
      );
      assert.deepEqual(result, {
        type: "function",
        argument: "a",
        body: { type: "variable", name: "y" },
      });
    });

    it("performs capture avoidance when needed (case 1)", function () {
      // Case 1: "b" free in replacer, "a" free in body → RENAME
      // replace a with b in λb.a b → λε₁.b ε₁
      const result = purgeAstCache(
        replace(
          "a",
          { type: "variable", name: "b" },
          {
            type: "function",
            argument: "b",
            body: {
              type: "application",
              left: { type: "variable", name: "a" },
              right: { type: "variable", name: "b" },
            },
          }
        )
      );
      assert.equal(result.type, "function");
      assert.notEqual(result.argument, "b");
      assert.notEqual(result.argument, "a");
      assert.equal(result.body.left.name, "b");
      assert.equal(result.body.right.name, result.argument);
    });

    it("does not capture-avoid when no conflict exists (case 3)", function () {
      // Case 3: "b" NOT free in replacer, "a" free in body → NO RENAME
      // replace a with c in λb.a b → λb.c b
      const result = purgeAstCache(
        replace(
          "a",
          { type: "variable", name: "c" },
          {
            type: "function",
            argument: "b",
            body: {
              type: "application",
              left: { type: "variable", name: "a" },
              right: { type: "variable", name: "b" },
            },
          }
        )
      );
      assert.deepEqual(result, {
        type: "function",
        argument: "b",
        body: {
          type: "application",
          left: { type: "variable", name: "c" },
          right: { type: "variable", name: "b" },
        },
      });
    });

    it("replaces with a complex expression", function () {
      const result = purgeAstCache(
        replace(
          "x",
          {
            type: "application",
            left: { type: "variable", name: "a" },
            right: { type: "variable", name: "b" },
          },
          { type: "variable", name: "x" }
        )
      );
      assert.deepEqual(result, {
        type: "application",
        left: { type: "variable", name: "a" },
        right: { type: "variable", name: "b" },
      });
    });

    it("does not rename when nameToReplace is not free in body (case 2)", function () {
      // Case 2: "b" free in replacer, "a" NOT free in body → NO RENAME
      // replace a with b in λb.c → λb.c
      const result = purgeAstCache(
        replace(
          "a",
          { type: "variable", name: "b" },
          {
            type: "function",
            argument: "b",
            body: { type: "variable", name: "c" },
          }
        )
      );
      assert.deepEqual(result, {
        type: "function",
        argument: "b",
        body: { type: "variable", name: "c" },
      });
    });

    it("no rename when neither condition holds (case 4)", function () {
      // replace("a", (c d), λb. c) — "b" NOT free in replacer, "a" NOT free in body
      const result = purgeAstCache(
        replace(
          "a",
          {
            type: "application",
            left: { type: "variable", name: "c" },
            right: { type: "variable", name: "d" },
          },
          {
            type: "function",
            argument: "b",
            body: { type: "variable", name: "c" },
          }
        )
      );
      assert.deepEqual(result, {
        type: "function",
        argument: "b",
        body: { type: "variable", name: "c" },
      });
    });
  });
});
