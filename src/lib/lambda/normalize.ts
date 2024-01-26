import { LambdaExpression as Expr, Maybe } from "./types";
import { bReducable, bReduce } from "./operations";
import { LambdaExecutionTimeoutError } from "./errors";

function toNormalForm(expression: Expr, depthOverflow: number = 1000): Expr {
  let count = 0;
  let current: Maybe<Expr>;
  let reduced: Maybe<Expr> = expression;
  do {
    current = reduced;
    reduced = leftmostOutermostRedex(current);
    count++;
    if (count >= depthOverflow) {
      throw new LambdaExecutionTimeoutError(
        "Normal form execution exceeded. This expression may not have a normal form."
      );
    }
  } while (reduced !== undefined);
  return current;
}

function leftmostOutermostRedex(expression: Expr): Maybe<Expr> {
  if (bReducable(expression)) {
    return bReduce(expression);
  }
  if (expression.type === "function") {
    const res = leftmostOutermostRedex(expression.body);
    if (res === undefined) {
      return undefined;
    } else {
      return {
        type: "function",
        argument: expression.argument,
        body: res,
      };
    }
  }
  if (expression.type === "variable") {
    return undefined;
  }
  if (expression.type === "application") {
    const leftReduced = leftmostOutermostRedex(expression.left);
    if (leftReduced !== undefined) {
      return {
        type: "application",
        left: leftReduced,
        right: expression.right,
      };
    }
    const rightReduced = leftmostOutermostRedex(expression.right);
    if (rightReduced !== undefined) {
      return {
        type: "application",
        left: expression.left,
        right: rightReduced,
      };
    }
    return undefined;
  }
}

export { toNormalForm, leftmostOutermostRedex };
