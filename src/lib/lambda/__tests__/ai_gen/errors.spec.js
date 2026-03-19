import { assert } from "chai";
import {
  LambdaSyntaxError,
  LambdaLexingError,
  LambdaExecutionTimeoutError,
} from "../../errors.js";

describe("Errors (comprehensive)", function () {
  describe("LambdaSyntaxError", function () {
    it("is an instance of Error", function () {
      assert.instanceOf(new LambdaSyntaxError("test"), Error);
    });

    it("has name LambdaSyntaxError", function () {
      assert.equal(new LambdaSyntaxError("test").name, "LambdaSyntaxError");
    });

    it("prefixes message with 'Syntax Error: '", function () {
      assert.equal(
        new LambdaSyntaxError("bad token").message,
        "Syntax Error: bad token"
      );
    });

    it("can be caught as Error", function () {
      assert.throws(() => {
        throw new LambdaSyntaxError("oops");
      }, Error);
    });
  });

  describe("LambdaLexingError", function () {
    it("is an instance of Error", function () {
      assert.instanceOf(new LambdaLexingError("test"), Error);
    });

    it("has name LambdaLexingError", function () {
      assert.equal(new LambdaLexingError("test").name, "LambdaLexingError");
    });

    it("prefixes message with 'Lexing Error: '", function () {
      assert.equal(
        new LambdaLexingError("bad char").message,
        "Lexing Error: bad char"
      );
    });
  });

  describe("LambdaExecutionTimeoutError", function () {
    it("is an instance of Error", function () {
      assert.instanceOf(new LambdaExecutionTimeoutError("test"), Error);
    });

    it("has name LambdaExecutionTimeoutError", function () {
      assert.equal(
        new LambdaExecutionTimeoutError("test").name,
        "LambdaExecutionTimeoutError"
      );
    });

    it("uses message directly (no prefix)", function () {
      assert.equal(
        new LambdaExecutionTimeoutError("timed out").message,
        "timed out"
      );
    });
  });
});
