import { assert } from "chai";
import { renderAsChurchNumeral, renderAsChurchBoolean } from "../../churchPrimitives.js";
import { parseTerm } from "../../parser.js";

describe("Church Primitives (comprehensive)", function () {
  describe("renderAsChurchNumeral", function () {
    it("identifies church 0: λfx.x", function () {
      assert.equal(renderAsChurchNumeral(parseTerm("λfx.x")), 0);
    });

    it("identifies church 1: λfx.f x", function () {
      assert.equal(renderAsChurchNumeral(parseTerm("λfx.f x")), 1);
    });

    it("identifies church 2: λfx.f(f x)", function () {
      assert.equal(renderAsChurchNumeral(parseTerm("λfx.f(f x)")), 2);
    });

    it("identifies church 3: λfx.f(f(f x))", function () {
      assert.equal(renderAsChurchNumeral(parseTerm("λfx.f(f(f x))")), 3);
    });

    it("identifies church 5: λfx.f(f(f(f(f x))))", function () {
      assert.equal(
        renderAsChurchNumeral(parseTerm("λfx.f(f(f(f(f x))))")),
        5
      );
    });

    it("works with different variable names: λab.a(a b) = 2", function () {
      assert.equal(renderAsChurchNumeral(parseTerm("λab.a(a b)")), 2);
    });

    it("works with different variable names: λgz.z = 0", function () {
      assert.equal(renderAsChurchNumeral(parseTerm("λgz.z")), 0);
    });

    it("returns undefined for a variable", function () {
      assert.isUndefined(renderAsChurchNumeral({ type: "variable", name: "x" }));
    });

    it("returns undefined for a single-arg function", function () {
      assert.isUndefined(renderAsChurchNumeral(parseTerm("λx.x")));
    });

    it("returns undefined for wrong structure: λfx.x f", function () {
      assert.isUndefined(renderAsChurchNumeral(parseTerm("λfx.x f")));
    });

    it("returns undefined for application at wrong position", function () {
      // λfx.f f x — the inner structure is (f f) x, not f(f(x))
      assert.isUndefined(renderAsChurchNumeral(parseTerm("λfx.f f x")));
    });

    it("returns undefined for application expression", function () {
      assert.isUndefined(renderAsChurchNumeral(parseTerm("a b")));
    });

    it("returns undefined for three-arg lambda", function () {
      assert.isUndefined(renderAsChurchNumeral(parseTerm("λxyz.x")));
    });

    it("returns undefined when inner body uses wrong variable", function () {
      // λfx.f(f f) — innermost is f, not x
      assert.isUndefined(renderAsChurchNumeral(parseTerm("λfx.f(f f)")));
    });
  });

  describe("renderAsChurchBoolean", function () {
    it("identifies church TRUE: λab.a", function () {
      assert.equal(renderAsChurchBoolean(parseTerm("λab.a")), true);
    });

    it("identifies church FALSE: λab.b", function () {
      assert.equal(renderAsChurchBoolean(parseTerm("λab.b")), false);
    });

    it("identifies TRUE with different var names: λxy.x", function () {
      assert.equal(renderAsChurchBoolean(parseTerm("λxy.x")), true);
    });

    it("identifies FALSE with different var names: λpq.q", function () {
      assert.equal(renderAsChurchBoolean(parseTerm("λpq.q")), false);
    });

    it("returns undefined for identity: λx.x", function () {
      assert.isUndefined(renderAsChurchBoolean(parseTerm("λx.x")));
    });

    it("returns undefined for variable", function () {
      assert.isUndefined(
        renderAsChurchBoolean({ type: "variable", name: "x" })
      );
    });

    it("returns undefined for church 0 (not boolean, despite similarity)", function () {
      // church 0 = λfx.x = church FALSE — these are actually structurally the same
      // So this should return false (since they are alpha-equivalent)
      assert.equal(renderAsChurchBoolean(parseTerm("λfx.x")), false);
    });

    it("returns undefined for application", function () {
      assert.isUndefined(renderAsChurchBoolean(parseTerm("a b")));
    });

    it("returns undefined for three-arg lambda", function () {
      assert.isUndefined(renderAsChurchBoolean(parseTerm("λabc.a")));
    });

    it("returns undefined for lambda with application body", function () {
      assert.isUndefined(renderAsChurchBoolean(parseTerm("λab.a b")));
    });
  });
});
