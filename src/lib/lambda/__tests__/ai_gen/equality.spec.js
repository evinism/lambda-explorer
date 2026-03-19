import { assert } from "chai";
import { equal } from "../../equality.js";
import { parseTerm } from "../../parser.js";

describe("Equality (comprehensive)", function () {
  describe("identical expressions", function () {
    it("variables with same name are equal", function () {
      assert.isTrue(
        equal(
          { type: "variable", name: "x" },
          { type: "variable", name: "x" }
        )
      );
    });

    it("variables with different names are not equal", function () {
      assert.isFalse(
        equal(
          { type: "variable", name: "x" },
          { type: "variable", name: "y" }
        )
      );
    });

    it("same function is equal to itself", function () {
      const f = parseTerm("λx.x");
      assert.isTrue(equal(f, f));
    });

    it("same application is equal to itself", function () {
      const app = parseTerm("a b");
      assert.isTrue(equal(app, app));
    });
  });

  describe("alpha equivalence", function () {
    it("λx.x equals λy.y (identity with different arg names)", function () {
      assert.isTrue(equal(parseTerm("λx.x"), parseTerm("λy.y")));
    });

    it("λab.a equals λcd.c", function () {
      assert.isTrue(equal(parseTerm("λab.a"), parseTerm("λcd.c")));
    });

    it("λab.b equals λxy.y", function () {
      assert.isTrue(equal(parseTerm("λab.b"), parseTerm("λxy.y")));
    });

    it("λab.a b equals λxy.x y", function () {
      assert.isTrue(equal(parseTerm("λab.a b"), parseTerm("λxy.x y")));
    });

    it("nested lambdas with renamed vars are equal", function () {
      assert.isTrue(
        equal(parseTerm("λa.λb.λc.a b c"), parseTerm("λx.λy.λz.x y z"))
      );
    });
  });

  describe("structural inequality", function () {
    it("λx.x is not equal to λxy.x", function () {
      assert.isFalse(equal(parseTerm("λx.x"), parseTerm("λxy.x")));
    });

    it("λab.a is not equal to λab.b", function () {
      assert.isFalse(equal(parseTerm("λab.a"), parseTerm("λab.b")));
    });

    it("variable is not equal to function", function () {
      assert.isFalse(
        equal(
          { type: "variable", name: "x" },
          parseTerm("λx.x")
        )
      );
    });

    it("variable is not equal to application", function () {
      assert.isFalse(
        equal(
          { type: "variable", name: "x" },
          parseTerm("a b")
        )
      );
    });

    it("function is not equal to application", function () {
      assert.isFalse(equal(parseTerm("λx.x"), parseTerm("a b")));
    });

    it("different application structure", function () {
      // a (b c) vs (a b) c
      assert.isFalse(
        equal(parseTerm("a (b c)"), parseTerm("(a b) c"))
      );
    });
  });

  describe("church encodings equality", function () {
    it("church 0 with different var names", function () {
      assert.isTrue(equal(parseTerm("λfx.x"), parseTerm("λab.b")));
    });

    it("church 1 with different var names", function () {
      assert.isTrue(equal(parseTerm("λfx.f x"), parseTerm("λab.a b")));
    });

    it("church 2 with different var names", function () {
      assert.isTrue(
        equal(parseTerm("λfx.f(f x)"), parseTerm("λab.a(a b)"))
      );
    });

    it("church 0 is not church 1", function () {
      assert.isFalse(equal(parseTerm("λfx.x"), parseTerm("λfx.f x")));
    });

    it("church TRUE is not church FALSE", function () {
      assert.isFalse(equal(parseTerm("λab.a"), parseTerm("λab.b")));
    });
  });

  describe("expressions with free variables", function () {
    it("same free variable is equal", function () {
      assert.isTrue(
        equal(parseTerm("λx.x a"), parseTerm("λy.y a"))
      );
    });

    it("different free variables are not equal", function () {
      assert.isFalse(
        equal(parseTerm("λx.x a"), parseTerm("λx.x b"))
      );
    });

    it("free var matching bound var name is handled correctly", function () {
      // λa.a b — 'b' is free
      // λx.x b — 'b' is free
      assert.isTrue(equal(parseTerm("λa.a b"), parseTerm("λx.x b")));
    });
  });
});
