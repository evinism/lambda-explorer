import { equal } from "./equality";
import { parseTerm } from "./parser";
import { cannonize } from "./cannonize";
import { LambdaExpression as Expr, Maybe } from "./types";

// TODO: do the inverse of these -- generation of church primitives
export function renderAsChurchNumeral(uncannonized: Expr): Maybe<number> {
  const expression = cannonize(uncannonized);
  if (expression.type !== "function") {
    return undefined;
  }
  const outerName = expression.argument;
  const inner = expression.body;
  if (inner.type !== "function") {
    return undefined;
  }
  const innerName = inner.argument;

  function countLevels(
    wrapperName: string,
    targetName: string,
    piece: Expr
  ): Maybe<number> {
    if (piece.type === "variable") {
      if (piece.name !== targetName) {
        return undefined;
      } else {
        return 0;
      }
    }
    if (piece.type === "application") {
      if (piece.left.type !== "variable" || piece.left.name !== wrapperName) {
        return undefined;
      } else {
        const nextLevel = countLevels(wrapperName, targetName, piece.right);
        if (nextLevel === undefined) {
          return undefined;
        } else {
          return nextLevel + 1;
        }
      }
    }
    return undefined;
  }

  return countLevels(outerName, innerName, inner.body);
}

const churchTrue = parseTerm("λab.a");
const churchFalse = parseTerm("λab.b");

export function renderAsChurchBoolean(expression: Expr): Maybe<boolean> {
  if (equal(expression, churchTrue)) {
    return true;
  }
  if (equal(expression, churchFalse)) {
    return false;
  }
  return undefined;
}
