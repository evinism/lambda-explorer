import { replace } from "./operations";
import { cacheOnAst } from "./util";
import { LambdaExpression as Expr } from "./types";

// Deterministically renames all variables in an expression
// such that if there exists an alpha conversion between two ASTs,
// the cannonized asts are identical
function cannonizeUnmemoized(ast: Expr): Expr {
  let count = 0;
  return rCannonize(ast);

  function generateNewName() {
    count++;
    return `[_c${count}]`;
  }

  function rCannonize(a: Expr): Expr {
    switch (a.type) {
      case "variable":
        return a;
      case "application":
        return {
          type: "application",
          left: rCannonize(a.left),
          right: rCannonize(a.right),
        };
      case "function":
        let newName = generateNewName();
        return {
          type: "function",
          argument: newName,
          body: rCannonize(
            replace(a.argument, { type: "variable", name: newName }, a.body)
          ),
        };
    }
  }
}

export const cannonize = cacheOnAst(cannonizeUnmemoized);
