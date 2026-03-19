import { assert } from "chai";
import { renderExpression } from "../../renderer.js";
import { parseTerm } from "../../parser.js";

describe("Renderer (comprehensive)", function () {
  describe("variables", function () {
    it("renders a single variable", function () {
      assert.equal(
        renderExpression({ type: "variable", name: "x" }),
        "x"
      );
    });

    it("renders a multi-char variable name", function () {
      assert.equal(
        renderExpression({ type: "variable", name: "ABC" }),
        "ABC"
      );
    });

    it("renders a variable with subscript", function () {
      assert.equal(
        renderExpression({ type: "variable", name: "x₁" }),
        "x₁"
      );
    });
  });

  describe("functions", function () {
    it("renders identity function", function () {
      assert.equal(
        renderExpression({
          type: "function",
          argument: "x",
          body: { type: "variable", name: "x" },
        }),
        "λx.x"
      );
    });

    it("renders nested lambda", function () {
      assert.equal(
        renderExpression({
          type: "function",
          argument: "a",
          body: {
            type: "function",
            argument: "b",
            body: { type: "variable", name: "a" },
          },
        }),
        "λa.λb.a"
      );
    });

    it("renders lambda with application body", function () {
      assert.equal(
        renderExpression({
          type: "function",
          argument: "f",
          body: {
            type: "application",
            left: { type: "variable", name: "f" },
            right: { type: "variable", name: "x" },
          },
        }),
        "λf.fx"
      );
    });
  });

  describe("applications", function () {
    it("renders simple application", function () {
      assert.equal(
        renderExpression({
          type: "application",
          left: { type: "variable", name: "a" },
          right: { type: "variable", name: "b" },
        }),
        "ab"
      );
    });

    it("wraps function on left side in parens", function () {
      assert.equal(
        renderExpression({
          type: "application",
          left: {
            type: "function",
            argument: "x",
            body: { type: "variable", name: "x" },
          },
          right: { type: "variable", name: "y" },
        }),
        "(λx.x)y"
      );
    });

    it("wraps application on right side in parens", function () {
      assert.equal(
        renderExpression({
          type: "application",
          left: { type: "variable", name: "a" },
          right: {
            type: "application",
            left: { type: "variable", name: "b" },
            right: { type: "variable", name: "c" },
          },
        }),
        "a(bc)"
      );
    });

    it("wraps function on right side in parens", function () {
      assert.equal(
        renderExpression({
          type: "application",
          left: { type: "variable", name: "a" },
          right: {
            type: "function",
            argument: "x",
            body: { type: "variable", name: "x" },
          },
        }),
        "a(λx.x)"
      );
    });

    it("does not wrap variable on left in parens", function () {
      const result = renderExpression({
        type: "application",
        left: { type: "variable", name: "f" },
        right: { type: "variable", name: "x" },
      });
      assert.equal(result, "fx");
    });

    it("does not wrap application on left in parens", function () {
      const result = renderExpression({
        type: "application",
        left: {
          type: "application",
          left: { type: "variable", name: "a" },
          right: { type: "variable", name: "b" },
        },
        right: { type: "variable", name: "c" },
      });
      assert.equal(result, "abc");
    });
  });

  describe("complex expressions", function () {
    it("renders church numeral 2", function () {
      const ast = parseTerm("λfx.f(fx)");
      const rendered = renderExpression(ast);
      assert.equal(rendered, "λf.λx.f(fx)");
    });

    it("renders church numeral 0", function () {
      const ast = parseTerm("λfx.x");
      assert.equal(renderExpression(ast), "λf.λx.x");
    });

    it("renders S combinator", function () {
      const ast = parseTerm("λxyz.x z(y z)");
      const rendered = renderExpression(ast);
      assert.include(rendered, "λx.");
    });

    it("renders applied identity", function () {
      const ast = parseTerm("(λx.x) a");
      assert.equal(renderExpression(ast), "(λx.x)a");
    });

    it("renders double application with lambda", function () {
      const ast = parseTerm("(λx.x)(λy.y)");
      assert.equal(renderExpression(ast), "(λx.x)(λy.y)");
    });
  });

  describe("roundtrip (parse then render)", function () {
    const cases = [
      ["λx.x", "λx.x"],
      ["(λx.x)y", "(λx.x)y"],
      ["a b", "ab"],
    ];

    cases.forEach(([input, expected]) => {
      it(`parseTerm("${input}") renders as "${expected}"`, function () {
        assert.equal(renderExpression(parseTerm(input)), expected);
      });
    });
  });
});
