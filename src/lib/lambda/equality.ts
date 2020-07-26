import { cannonize } from "./cannonize";
import { LambdaExpression as Expr } from "./types";

function sameType<A extends Expr>(a: A, b: Expr): b is A {
  return a.type === b.type;
}

// Equality up to alpha conversion.
function rEqual(a: Expr, b: Expr): boolean {
  switch (a.type) {
    // if it's free, we should hope they're the same.
    // if it's not free, we should hope that whatever renaming scheme already converted it
    case "variable":
      return sameType(a, b) && a.name === b.name;
    case "application":
      return (
        sameType(a, b) && rEqual(a.left, b.left) && rEqual(a.right, b.right)
      );
    case "function":
      return sameType(a, b) && rEqual(a.body, b.body);
  }
}

export function equal(a: Expr, b: Expr): boolean {
  const cA = cannonize(a);
  const cB = cannonize(b);
  return rEqual(cA, cB);
}
