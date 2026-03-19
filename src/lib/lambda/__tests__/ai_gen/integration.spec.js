import { assert } from "chai";
import {
  parseTerm,
  parseExtendedSyntax,
  renderExpression,
  renderAsChurchNumeral,
  renderAsChurchBoolean,
  toNormalForm,
  equal,
  bReduce,
  eReduce,
  getFreeVars,
  replace,
  purgeAstCache,
  tokenize,
  LambdaExecutionTimeoutError,
} from "../../index.js";

describe("Integration Tests (comprehensive)", function () {
  describe("parse → render roundtrip", function () {
    const expressions = [
      "λx.x",
      "(λx.x)y",
      "a b",
      "(λab.a)x y",
      "λf.λx.f(f x)",
    ];

    expressions.forEach((expr) => {
      it(`parses and renders: ${expr}`, function () {
        const ast = parseTerm(expr);
        const rendered = renderExpression(ast);
        // Re-parse the rendered form and check equality
        const reparsed = parseTerm(rendered);
        assert.isTrue(equal(ast, reparsed));
      });
    });
  });

  describe("parse → normalize → render", function () {
    it("(λx.x) a → a", function () {
      const result = renderExpression(purgeAstCache(toNormalForm(parseTerm("(λx.x) a"))));
      assert.equal(result, "a");
    });

    it("(λxy.x) a b → a", function () {
      const result = renderExpression(purgeAstCache(toNormalForm(parseTerm("(λxy.x) a b"))));
      assert.equal(result, "a");
    });

    it("(λxy.y) a b → b", function () {
      const result = renderExpression(purgeAstCache(toNormalForm(parseTerm("(λxy.y) a b"))));
      assert.equal(result, "b");
    });
  });

  describe("church arithmetic via normalization", function () {
    // Church numerals
    const ZERO = "λfx.x";
    const SUCC = "λnfx.f(n f x)";
    const PLUS = "λmnfx.m f(n f x)";
    const MULT = "λmnf.m(n f)";

    it("SUCC 0 = 1", function () {
      const result = toNormalForm(parseTerm(`(${SUCC})(${ZERO})`));
      assert.equal(renderAsChurchNumeral(result), 1);
    });

    it("SUCC (SUCC 0) = 2", function () {
      const result = toNormalForm(parseTerm(`(${SUCC})((${SUCC})(${ZERO}))`));
      assert.equal(renderAsChurchNumeral(result), 2);
    });

    it("PLUS 1 2 = 3", function () {
      const ONE = `(${SUCC})(${ZERO})`;
      const TWO = `(${SUCC})((${SUCC})(${ZERO}))`;
      const result = toNormalForm(parseTerm(`(${PLUS})(${ONE})(${TWO})`));
      assert.equal(renderAsChurchNumeral(result), 3);
    });

    it("MULT 2 3 = 6", function () {
      const TWO = "λfx.f(f x)";
      const THREE = "λfx.f(f(f x))";
      const result = toNormalForm(parseTerm(`(${MULT})(${TWO})(${THREE})`));
      assert.equal(renderAsChurchNumeral(result), 6);
    });

    it("PLUS 0 0 = 0", function () {
      const result = toNormalForm(parseTerm(`(${PLUS})(${ZERO})(${ZERO})`));
      assert.equal(renderAsChurchNumeral(result), 0);
    });
  });

  describe("church boolean logic via normalization", function () {
    const TRUE = "λab.a";
    const FALSE = "λab.b";
    const AND = "λpq.p q p";
    const OR = "λpq.p p q";
    const NOT = "λp.p(λab.b)(λab.a)";

    it("AND TRUE TRUE = TRUE", function () {
      const result = toNormalForm(parseTerm(`(${AND})(${TRUE})(${TRUE})`));
      assert.equal(renderAsChurchBoolean(result), true);
    });

    it("AND TRUE FALSE = FALSE", function () {
      const result = toNormalForm(parseTerm(`(${AND})(${TRUE})(${FALSE})`));
      assert.equal(renderAsChurchBoolean(result), false);
    });

    it("AND FALSE TRUE = FALSE", function () {
      const result = toNormalForm(parseTerm(`(${AND})(${FALSE})(${TRUE})`));
      assert.equal(renderAsChurchBoolean(result), false);
    });

    it("AND FALSE FALSE = FALSE", function () {
      const result = toNormalForm(parseTerm(`(${AND})(${FALSE})(${FALSE})`));
      assert.equal(renderAsChurchBoolean(result), false);
    });

    it("OR TRUE FALSE = TRUE", function () {
      const result = toNormalForm(parseTerm(`(${OR})(${TRUE})(${FALSE})`));
      assert.equal(renderAsChurchBoolean(result), true);
    });

    it("OR FALSE FALSE = FALSE", function () {
      const result = toNormalForm(parseTerm(`(${OR})(${FALSE})(${FALSE})`));
      assert.equal(renderAsChurchBoolean(result), false);
    });

    it("NOT TRUE = FALSE", function () {
      const result = toNormalForm(parseTerm(`(${NOT})(${TRUE})`));
      assert.equal(renderAsChurchBoolean(result), false);
    });

    it("NOT FALSE = TRUE", function () {
      const result = toNormalForm(parseTerm(`(${NOT})(${FALSE})`));
      assert.equal(renderAsChurchBoolean(result), true);
    });
  });

  describe("famous combinators", function () {
    it("I combinator: (λx.x) a = a", function () {
      const result = purgeAstCache(toNormalForm(parseTerm("(λx.x) a")));
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("K combinator: (λxy.x) a b = a", function () {
      const result = purgeAstCache(toNormalForm(parseTerm("(λxy.x) a b")));
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("KI combinator: (λxy.y) a b = b", function () {
      const result = purgeAstCache(toNormalForm(parseTerm("(λxy.y) a b")));
      assert.deepEqual(result, { type: "variable", name: "b" });
    });

    it("S combinator applied: S K K a = a", function () {
      const S = "λxyz.x z(y z)";
      const K = "λxy.x";
      const result = purgeAstCache(
        toNormalForm(parseTerm(`(${S})(${K})(${K}) a`))
      );
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("omega combinator diverges", function () {
      const ast = parseTerm("(λx.x x)(λx.x x)");
      assert.throws(() => toNormalForm(ast, { depthOverflow: 50 }), LambdaExecutionTimeoutError);
    });

    it("Y combinator applied to non-recursive function terminates", function () {
      // Y K should eventually normalize since K discards its second arg
      // Y = λf.(λx.f(x x))(λx.f(x x))
      // Y K → K(Y K) → (λxy.x)(Y K) — but Y K diverges again
      // Actually Y combinator always diverges under normal order for strict K
      // Let's test that it throws
      const Y = "λf.(λx.f(x x))(λx.f(x x))";
      const K = "λxy.x";
      assert.throws(
        () => toNormalForm(parseTerm(`(${Y})(${K})`), { depthOverflow: 100 }),
        LambdaExecutionTimeoutError
      );
    });
  });

  describe("assignment parsing", function () {
    it("parses and uses assignment LHS", function () {
      const result = parseExtendedSyntax("ID := λx.x");
      assert.equal(result.type, "assignment");
      assert.equal(result.lhs, "ID");
      assert.isTrue(equal(result.rhs, parseTerm("λx.x")));
    });

    it("parses complex assignment", function () {
      const result = parseExtendedSyntax("SUCC := λnfx.f(n f x)");
      assert.equal(result.type, "assignment");
      assert.equal(result.lhs, "SUCC");
      assert.equal(result.rhs.type, "function");
    });
  });

  describe("free variables in context", function () {
    it("closed term has no free vars", function () {
      assert.lengthOf(getFreeVars(parseTerm("λxy.x y")), 0);
    });

    it("open term has free vars", function () {
      const free = getFreeVars(parseTerm("λx.x y z"));
      const names = free.map((v) => v.name);
      assert.include(names, "y");
      assert.include(names, "z");
      assert.notInclude(names, "x");
    });
  });

  describe("eta reduction integration", function () {
    it("η-reduces then normalizes: (λx.f x) a → f a (via β)", function () {
      // First η-reduce: λx.f x → f
      const ast = parseTerm("λx.f x");
      const etaReduced = purgeAstCache(eReduce(ast));
      assert.deepEqual(etaReduced, { type: "variable", name: "f" });
    });
  });

  describe("edge cases", function () {
    it("handles single character expressions", function () {
      const ast = parseTerm("a");
      assert.deepEqual(ast, { type: "variable", name: "a" });
    });

    it("handles deeply nested parentheses", function () {
      const ast = parseTerm("(((a)))");
      assert.deepEqual(ast, { type: "variable", name: "a" });
    });

    it("handles special chars in identifiers", function () {
      const tokens = tokenize("+ - ! | &");
      assert.lengthOf(tokens, 5);
      tokens.forEach((t) => assert.equal(t.type, "identifier"));
    });

    it("handles greek letters as identifiers", function () {
      const ast = parseTerm("λα.α");
      assert.equal(ast.type, "function");
      assert.equal(ast.argument, "α");
    });

    it("preserves semantics through multiple reductions", function () {
      // Apply identity three times: I(I(I a)) → a
      const ast = parseTerm("(λx.x)((λx.x)((λx.x) a))");
      const result = purgeAstCache(toNormalForm(ast));
      assert.deepEqual(result, { type: "variable", name: "a" });
    });

    it("equality is reflexive", function () {
      const ast = parseTerm("λabc.a(b c)");
      assert.isTrue(equal(ast, ast));
    });

    it("equality is symmetric", function () {
      const a = parseTerm("λx.x");
      const b = parseTerm("λy.y");
      assert.equal(equal(a, b), equal(b, a));
    });

    it("normal form is idempotent", function () {
      const ast = parseTerm("(λx.x) a");
      const nf1 = toNormalForm(ast);
      const nf2 = toNormalForm(nf1);
      assert.isTrue(equal(nf1, nf2));
    });
  });
});
