import { LambdaExpression as Expr, Maybe } from "./types";
import { bReducable, bReduce, eReducable, eReduce } from "./operations";
import { LambdaExecutionTimeoutError } from "./errors";

interface NormalFormConfig {
  depthOverflow?: number;
  etaReduce?: boolean;
}

function toNormalForm(expression: Expr, config: NormalFormConfig = {}): Expr {
  const { depthOverflow = 1000, etaReduce = false } = config;
  let count = 0;
  let current: Maybe<Expr>;
  let reduced: Maybe<Expr> = expression;
  do {
    current = reduced;
    reduced = leftmostOutermostRedex(current, etaReduce);
    count++;
    if (count >= depthOverflow && reduced !== undefined) {
      throw new LambdaExecutionTimeoutError(
        "Normal form execution exceeded. This expression may not have a normal form."
      );
    }
  } while (reduced !== undefined);
  return current;
}

function leftmostOutermostRedex(expression: Expr, etaReduce: boolean = false): Maybe<Expr> {
  if (bReducable(expression)) {
    return bReduce(expression);
  }
  if (etaReduce && eReducable(expression)) {
    return eReduce(expression);
  }
  if (expression.type === "function") {
    const res = leftmostOutermostRedex(expression.body, etaReduce);
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
    const leftReduced = leftmostOutermostRedex(expression.left, etaReduce);
    if (leftReduced !== undefined) {
      return {
        type: "application",
        left: leftReduced,
        right: expression.right,
      };
    }
    const rightReduced = leftmostOutermostRedex(expression.right, etaReduce);
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
export type { NormalFormConfig };
