import {
  LambdaExpression as Expr,
  LambdaStatement as Statement,
  LambdaToken as Token,
  ValuedToken,
} from "./types";
import { tokenize } from "./lexer";
import { LambdaSyntaxError } from "./errors";

// this one'll be a better entry point
export function parseStatement(tokenStream: Token[]): Statement {
  // could handle errors better-- this one just will say unexpected token
  // when it reaches a nonstandard assignment token.
  if (tokenStream.length >= 2) {
    const first = tokenStream[0]; //to satisfy the typechecker
    if (first.type === "identifier" && tokenStream[1].type === "assignment") {
      let lhs = first.value;
      let rhs = parseExpression(tokenStream.splice(2));
      return { type: "assignment", lhs, rhs };
    }
  }
  return parseExpression(tokenStream);
}

export function parseExpression(tokenStream: Token[]): Expr {
  if (tokenStream.length === 0) {
    throw new LambdaSyntaxError("Empty Expression");
  }
  let [expression, rest] = popExpression(tokenStream);
  let applications = [expression];
  while (rest.length !== 0) {
    [expression, rest] = popExpression(rest);
    applications.push(expression);
  }
  // For left-associativity.
  return applications.reduce((prev, cur) => ({
    type: "application",
    left: prev,
    right: cur,
  }));
  // And reduce to produce the application
}

function popExpression(tokenStream: Token[]): [Expr, Token[]] {
  // 3 cases. 1:
  const nextToken = tokenStream[0];
  switch (nextToken.type) {
    case "identifier":
      return [
        { type: "variable", name: nextToken.value },
        tokenStream.slice(1),
      ];
    case "lambda":
      // scan forward to find the dot, add in arguments
      if (tokenStream.length < 2) {
        throw new LambdaSyntaxError("Unexpected end of lambda");
      }
      let dotPosition = 1;
      while (tokenStream[dotPosition].type !== "dot") {
        if (tokenStream[dotPosition].type !== "identifier") {
          throw new LambdaSyntaxError("Non-identifier in argument stream");
        }
        dotPosition++;
        if (dotPosition >= tokenStream.length) {
          throw new LambdaSyntaxError("Unexpected end of lambda");
        }
      }

      const args = tokenStream.slice(1, dotPosition) as ValuedToken[];
      if (args.length === 0) {
        throw new LambdaSyntaxError("Bad number of arguments");
      }
      const childExp = parseExpression(tokenStream.slice(dotPosition + 1));
      const exp: Expr = args.reduceRight(
        (acc, cur) => ({
          type: "function",
          argument: cur.value,
          body: acc,
        }),
        childExp
      );
      return [
        exp,
        [], //because it will always end the whole expression
      ];
    case "openParen":
      let depth = 0;
      let splitPoint = -1;
      for (let i = 0; i < tokenStream.length; i++) {
        const cur = tokenStream[i];
        if (cur.type === "openParen") {
          depth++;
        }
        if (cur.type === "closeParen") {
          depth--;
        }
        if (depth === 0) {
          splitPoint = i + 1;
          break;
        }
      }
      if (splitPoint < 0) {
        throw new LambdaSyntaxError("Unmatched Paren");
      }
      return [
        parseExpression(tokenStream.slice(1, splitPoint - 1)),
        tokenStream.slice(splitPoint),
      ];
    default:
      throw new LambdaSyntaxError("Unexpected Token");
  }
}

// We should rename these to be better.
export function parseTerm(str: string) {
  return parseExpression(tokenize(str));
}

// This isn't understood by most helper functions, as it's an extension of the lambda calculus.
// TODO: make this more well supported.
export function parseExtendedSyntax(str: string) {
  return parseStatement(tokenize(str));
}
