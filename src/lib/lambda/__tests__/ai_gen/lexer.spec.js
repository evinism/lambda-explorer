import { assert } from "chai";
import { tokenize } from "../../lexer.js";
import { LambdaLexingError } from "../../errors.js";

describe("Lexer (comprehensive)", function () {
  describe("single characters", function () {
    it("tokenizes lambda symbol", function () {
      assert.deepEqual(tokenize("λ"), [{ type: "lambda" }]);
    });

    it("tokenizes dot", function () {
      assert.deepEqual(tokenize("."), [{ type: "dot" }]);
    });

    it("tokenizes open paren", function () {
      assert.deepEqual(tokenize("("), [{ type: "openParen" }]);
    });

    it("tokenizes close paren", function () {
      assert.deepEqual(tokenize(")"), [{ type: "closeParen" }]);
    });

    it("tokenizes lowercase letter as identifier", function () {
      assert.deepEqual(tokenize("x"), [{ type: "identifier", value: "x" }]);
    });
  });

  describe("whitespace handling", function () {
    it("skips spaces", function () {
      assert.deepEqual(tokenize("a b"), [
        { type: "identifier", value: "a" },
        { type: "identifier", value: "b" },
      ]);
    });

    it("skips tabs", function () {
      assert.deepEqual(tokenize("a\tb"), [
        { type: "identifier", value: "a" },
        { type: "identifier", value: "b" },
      ]);
    });

    it("skips newlines", function () {
      assert.deepEqual(tokenize("a\nb"), [
        { type: "identifier", value: "a" },
        { type: "identifier", value: "b" },
      ]);
    });

    it("returns empty for all whitespace", function () {
      assert.deepEqual(tokenize("   \t\n  "), []);
    });

    it("returns empty for empty string", function () {
      assert.deepEqual(tokenize(""), []);
    });
  });

  describe("comments", function () {
    it("ignores everything after #", function () {
      assert.deepEqual(tokenize("a # this is a comment"), [
        { type: "identifier", value: "a" },
      ]);
    });

    it("returns empty for comment-only input", function () {
      assert.deepEqual(tokenize("# just a comment"), []);
    });

    it("handles # immediately after token", function () {
      assert.deepEqual(tokenize("a#comment"), [
        { type: "identifier", value: "a" },
      ]);
    });
  });

  describe("lowercase identifiers", function () {
    it("tokenizes each lowercase letter individually", function () {
      const tokens = tokenize("a b c x y z");
      assert.equal(tokens.length, 6);
      tokens.forEach((t) => assert.equal(t.type, "identifier"));
    });

    it("treats adjacent lowercase letters as separate tokens", function () {
      // In the context of lambda arguments (after λ), they are separate identifiers
      assert.deepEqual(tokenize("λab.c"), [
        { type: "lambda" },
        { type: "identifier", value: "a" },
        { type: "identifier", value: "b" },
        { type: "dot" },
        { type: "identifier", value: "c" },
      ]);
    });
  });

  describe("subscript numbers on identifiers", function () {
    it("attaches subscript digits to single-char identifiers", function () {
      assert.deepEqual(tokenize("a₀"), [
        { type: "identifier", value: "a₀" },
      ]);
    });

    it("attaches multiple subscript digits", function () {
      assert.deepEqual(tokenize("x₁₂₃"), [
        { type: "identifier", value: "x₁₂₃" },
      ]);
    });

    it("attaches subscript digits to multi-char identifiers", function () {
      assert.deepEqual(tokenize("ABC₅"), [
        { type: "identifier", value: "ABC₅" },
      ]);
    });

    it("handles subscript zero", function () {
      assert.deepEqual(tokenize("z₀"), [
        { type: "identifier", value: "z₀" },
      ]);
    });

    it("handles subscript nine", function () {
      assert.deepEqual(tokenize("z₉"), [
        { type: "identifier", value: "z₉" },
      ]);
    });
  });

  describe("uppercase / multi-char identifiers", function () {
    it("groups consecutive uppercase letters", function () {
      assert.deepEqual(tokenize("ABC"), [
        { type: "identifier", value: "ABC" },
      ]);
    });

    it("treats single uppercase letter as identifier", function () {
      assert.deepEqual(tokenize("X"), [{ type: "identifier", value: "X" }]);
    });

    it("includes underscore in multi-char identifiers", function () {
      assert.deepEqual(tokenize("A_B"), [
        { type: "identifier", value: "A_B" },
      ]);
    });

    it("separates uppercase group from lowercase", function () {
      assert.deepEqual(tokenize("ABc"), [
        { type: "identifier", value: "AB" },
        { type: "identifier", value: "c" },
      ]);
    });

    it("groups underscores with uppercase letters", function () {
      assert.deepEqual(tokenize("__"), [
        { type: "identifier", value: "__" },
      ]);
    });
  });

  describe("special single-char identifiers", function () {
    it("tokenizes +", function () {
      assert.deepEqual(tokenize("+"), [{ type: "identifier", value: "+" }]);
    });

    it("tokenizes !", function () {
      assert.deepEqual(tokenize("!"), [{ type: "identifier", value: "!" }]);
    });

    it("tokenizes -", function () {
      assert.deepEqual(tokenize("-"), [{ type: "identifier", value: "-" }]);
    });

    it("tokenizes |", function () {
      assert.deepEqual(tokenize("|"), [{ type: "identifier", value: "|" }]);
    });

    it("tokenizes &", function () {
      assert.deepEqual(tokenize("&"), [{ type: "identifier", value: "&" }]);
    });
  });

  describe("greek letter identifiers", function () {
    it("tokenizes alpha", function () {
      assert.deepEqual(tokenize("α"), [{ type: "identifier", value: "α" }]);
    });

    it("tokenizes beta", function () {
      assert.deepEqual(tokenize("β"), [{ type: "identifier", value: "β" }]);
    });

    it("tokenizes omega", function () {
      assert.deepEqual(tokenize("ω"), [{ type: "identifier", value: "ω" }]);
    });
  });

  describe("assignment operator", function () {
    it("tokenizes :=", function () {
      assert.deepEqual(tokenize(":="), [{ type: "assignment" }]);
    });

    it("throws on : without =", function () {
      assert.throws(() => tokenize(":x"), LambdaLexingError);
    });

    it("tokenizes assignment in context", function () {
      assert.deepEqual(tokenize("X := a"), [
        { type: "identifier", value: "X" },
        { type: "assignment" },
        { type: "identifier", value: "a" },
      ]);
    });
  });

  describe("error handling", function () {
    it("throws LambdaLexingError for invalid characters", function () {
      assert.throws(() => tokenize("@"), LambdaLexingError);
    });

    it("throws LambdaLexingError for semicolons", function () {
      assert.throws(() => tokenize(";"), LambdaLexingError);
    });

    it("error message includes position", function () {
      try {
        tokenize("a @");
        assert.fail("should have thrown");
      } catch (e) {
        assert.include(e.message, "2");
      }
    });

    it("error has correct name", function () {
      try {
        tokenize("@");
        assert.fail("should have thrown");
      } catch (e) {
        assert.equal(e.name, "LambdaLexingError");
      }
    });
  });

  describe("complex expressions", function () {
    it("tokenizes church numeral expression", function () {
      const tokens = tokenize("λfx.f(f(fx))");
      assert.equal(tokens[0].type, "lambda");
      assert.equal(tokens.length, 12);
    });

    it("tokenizes nested parentheses", function () {
      const tokens = tokenize("((a))");
      assert.deepEqual(tokens, [
        { type: "openParen" },
        { type: "openParen" },
        { type: "identifier", value: "a" },
        { type: "closeParen" },
        { type: "closeParen" },
      ]);
    });

    it("tokenizes assignment with lambda body", function () {
      const tokens = tokenize("ID := λx.x");
      assert.deepEqual(tokens, [
        { type: "identifier", value: "ID" },
        { type: "assignment" },
        { type: "lambda" },
        { type: "identifier", value: "x" },
        { type: "dot" },
        { type: "identifier", value: "x" },
      ]);
    });
  });
});
