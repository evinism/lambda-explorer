import { assert } from "chai";
import { parseExpression, parseStatement, parseTerm, parseExtendedSyntax } from "../../parser.js";
import { LambdaSyntaxError } from "../../errors.js";

describe("Parser (comprehensive)", function () {
  describe("parseExpression", function () {
    it("parses a single variable", function () {
      const tokens = [{ type: "identifier", value: "x" }];
      assert.deepEqual(parseExpression(tokens), {
        type: "variable",
        name: "x",
      });
    });

    it("throws on empty token stream", function () {
      assert.throws(() => parseExpression([]), LambdaSyntaxError, "Empty Expression");
    });

    it("parses simple lambda", function () {
      const tokens = [
        { type: "lambda" },
        { type: "identifier", value: "x" },
        { type: "dot" },
        { type: "identifier", value: "x" },
      ];
      assert.deepEqual(parseExpression(tokens), {
        type: "function",
        argument: "x",
        body: { type: "variable", name: "x" },
      });
    });

    it("parses application of two variables", function () {
      const tokens = [
        { type: "identifier", value: "a" },
        { type: "identifier", value: "b" },
      ];
      assert.deepEqual(parseExpression(tokens), {
        type: "application",
        left: { type: "variable", name: "a" },
        right: { type: "variable", name: "b" },
      });
    });

    it("is left-associative: a b c = (a b) c", function () {
      const tokens = [
        { type: "identifier", value: "a" },
        { type: "identifier", value: "b" },
        { type: "identifier", value: "c" },
      ];
      assert.deepEqual(parseExpression(tokens), {
        type: "application",
        left: {
          type: "application",
          left: { type: "variable", name: "a" },
          right: { type: "variable", name: "b" },
        },
        right: { type: "variable", name: "c" },
      });
    });

    it("parses four applications left-associatively", function () {
      const tokens = [
        { type: "identifier", value: "a" },
        { type: "identifier", value: "b" },
        { type: "identifier", value: "c" },
        { type: "identifier", value: "d" },
      ];
      const result = parseExpression(tokens);
      // ((a b) c) d
      assert.equal(result.type, "application");
      assert.equal(result.right.name, "d");
      assert.equal(result.left.type, "application");
      assert.equal(result.left.right.name, "c");
      assert.equal(result.left.left.type, "application");
    });

    it("parses parenthesized expression", function () {
      const tokens = [
        { type: "openParen" },
        { type: "identifier", value: "a" },
        { type: "closeParen" },
      ];
      assert.deepEqual(parseExpression(tokens), {
        type: "variable",
        name: "a",
      });
    });

    it("parses nested parentheses", function () {
      const tokens = [
        { type: "openParen" },
        { type: "openParen" },
        { type: "identifier", value: "a" },
        { type: "closeParen" },
        { type: "closeParen" },
      ];
      assert.deepEqual(parseExpression(tokens), {
        type: "variable",
        name: "a",
      });
    });

    it("uses parens to change associativity: a (b c)", function () {
      const tokens = [
        { type: "identifier", value: "a" },
        { type: "openParen" },
        { type: "identifier", value: "b" },
        { type: "identifier", value: "c" },
        { type: "closeParen" },
      ];
      assert.deepEqual(parseExpression(tokens), {
        type: "application",
        left: { type: "variable", name: "a" },
        right: {
          type: "application",
          left: { type: "variable", name: "b" },
          right: { type: "variable", name: "c" },
        },
      });
    });

    it("parses multi-argument lambda: λab.c becomes λa.λb.c", function () {
      const tokens = [
        { type: "lambda" },
        { type: "identifier", value: "a" },
        { type: "identifier", value: "b" },
        { type: "dot" },
        { type: "identifier", value: "c" },
      ];
      assert.deepEqual(parseExpression(tokens), {
        type: "function",
        argument: "a",
        body: {
          type: "function",
          argument: "b",
          body: { type: "variable", name: "c" },
        },
      });
    });

    it("parses three-argument lambda: λabc.d", function () {
      const tokens = [
        { type: "lambda" },
        { type: "identifier", value: "a" },
        { type: "identifier", value: "b" },
        { type: "identifier", value: "c" },
        { type: "dot" },
        { type: "identifier", value: "d" },
      ];
      const result = parseExpression(tokens);
      assert.equal(result.type, "function");
      assert.equal(result.argument, "a");
      assert.equal(result.body.type, "function");
      assert.equal(result.body.argument, "b");
      assert.equal(result.body.body.type, "function");
      assert.equal(result.body.body.argument, "c");
      assert.equal(result.body.body.body.name, "d");
    });

    it("lambda body extends to end of expression", function () {
      // λa.b c should parse as λa.(b c)
      const tokens = [
        { type: "lambda" },
        { type: "identifier", value: "a" },
        { type: "dot" },
        { type: "identifier", value: "b" },
        { type: "identifier", value: "c" },
      ];
      const result = parseExpression(tokens);
      assert.equal(result.type, "function");
      assert.equal(result.body.type, "application");
    });

    it("parses lambda applied to argument: (λx.x) y", function () {
      const tokens = [
        { type: "openParen" },
        { type: "lambda" },
        { type: "identifier", value: "x" },
        { type: "dot" },
        { type: "identifier", value: "x" },
        { type: "closeParen" },
        { type: "identifier", value: "y" },
      ];
      const result = parseExpression(tokens);
      assert.equal(result.type, "application");
      assert.equal(result.left.type, "function");
      assert.equal(result.right.name, "y");
    });
  });

  describe("parseExpression error cases", function () {
    it("throws on unmatched open paren", function () {
      const tokens = [
        { type: "openParen" },
        { type: "identifier", value: "a" },
      ];
      assert.throws(() => parseExpression(tokens), LambdaSyntaxError, "Unmatched Paren");
    });

    it("throws on lambda with no arguments", function () {
      const tokens = [
        { type: "lambda" },
        { type: "dot" },
        { type: "identifier", value: "a" },
      ];
      assert.throws(() => parseExpression(tokens), LambdaSyntaxError, "Bad number of arguments");
    });

    it("throws on lambda with no body", function () {
      const tokens = [
        { type: "lambda" },
        { type: "identifier", value: "a" },
      ];
      assert.throws(() => parseExpression(tokens), LambdaSyntaxError, "Unexpected end of lambda");
    });

    it("throws on unexpected token type", function () {
      const tokens = [{ type: "closeParen" }];
      assert.throws(() => parseExpression(tokens), LambdaSyntaxError, "Unexpected Token");
    });

    it("throws on non-identifier in lambda argument stream", function () {
      const tokens = [
        { type: "lambda" },
        { type: "openParen" },
        { type: "dot" },
        { type: "identifier", value: "a" },
      ];
      assert.throws(() => parseExpression(tokens), LambdaSyntaxError, "Non-identifier in argument stream");
    });

    it("error has correct name property", function () {
      try {
        parseExpression([]);
      } catch (e) {
        assert.equal(e.name, "LambdaSyntaxError");
      }
    });
  });

  describe("parseStatement", function () {
    it("returns undefined for empty token stream", function () {
      assert.isUndefined(parseStatement([]));
    });

    it("parses an assignment", function () {
      const tokens = [
        { type: "identifier", value: "X" },
        { type: "assignment" },
        { type: "identifier", value: "y" },
      ];
      assert.deepEqual(parseStatement(tokens), {
        type: "assignment",
        lhs: "X",
        rhs: { type: "variable", name: "y" },
      });
    });

    it("parses assignment with lambda body", function () {
      const tokens = [
        { type: "identifier", value: "ID" },
        { type: "assignment" },
        { type: "lambda" },
        { type: "identifier", value: "x" },
        { type: "dot" },
        { type: "identifier", value: "x" },
      ];
      const result = parseStatement(tokens);
      assert.equal(result.type, "assignment");
      assert.equal(result.lhs, "ID");
      assert.equal(result.rhs.type, "function");
    });

    it("falls back to expression for non-assignment", function () {
      const tokens = [
        { type: "identifier", value: "a" },
        { type: "identifier", value: "b" },
      ];
      const result = parseStatement(tokens);
      assert.equal(result.type, "application");
    });

    it("treats single identifier as expression, not assignment", function () {
      const tokens = [{ type: "identifier", value: "x" }];
      const result = parseStatement(tokens);
      assert.deepEqual(result, { type: "variable", name: "x" });
    });
  });

  describe("parseTerm (string → AST)", function () {
    it("parses identity function", function () {
      const result = parseTerm("λx.x");
      assert.equal(result.type, "function");
      assert.equal(result.argument, "x");
      assert.equal(result.body.name, "x");
    });

    it("parses application", function () {
      const result = parseTerm("a b");
      assert.equal(result.type, "application");
    });

    it("parses nested lambdas", function () {
      const result = parseTerm("λa.λb.a");
      assert.equal(result.type, "function");
      assert.equal(result.body.type, "function");
      assert.equal(result.body.body.name, "a");
    });

    it("parses complex church numeral", function () {
      const result = parseTerm("λfx.f(f(fx))");
      assert.equal(result.type, "function");
      assert.equal(result.argument, "f");
    });

    it("parses omega combinator", function () {
      const result = parseTerm("(λx.x x)(λx.x x)");
      assert.equal(result.type, "application");
      assert.equal(result.left.type, "function");
      assert.equal(result.right.type, "function");
    });

    it("parses S combinator", function () {
      const result = parseTerm("λxyz.x z(y z)");
      assert.equal(result.type, "function");
      assert.equal(result.argument, "x");
      assert.equal(result.body.argument, "y");
      assert.equal(result.body.body.argument, "z");
    });

    it("parses K combinator", function () {
      const result = parseTerm("λxy.x");
      assert.equal(result.type, "function");
      assert.equal(result.argument, "x");
      assert.equal(result.body.type, "function");
      assert.equal(result.body.body.name, "x");
    });
  });

  describe("parseExtendedSyntax", function () {
    it("returns undefined for empty string", function () {
      assert.isUndefined(parseExtendedSyntax(""));
    });

    it("parses assignment from string", function () {
      const result = parseExtendedSyntax("ID := λx.x");
      assert.equal(result.type, "assignment");
      assert.equal(result.lhs, "ID");
    });

    it("parses expression from string", function () {
      const result = parseExtendedSyntax("λx.x");
      assert.equal(result.type, "function");
    });

    it("returns undefined for comment-only input", function () {
      assert.isUndefined(parseExtendedSyntax("# comment"));
    });
  });
});
