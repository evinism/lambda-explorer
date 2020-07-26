import { uniqBy, map } from "ramda";
import { LambdaExpression as Expr, VariableExpression } from "./types";

function cacheOnAst<T>(fn: (input: Expr) => T) {
  const cacheSymbol = `${fn.name}_${Math.random().toString().slice(2)}`;
  return (ast: Expr) => {
    if (!ast.__cache__) {
      ast.__cache__ = {};
    }
    if (
      ast.__cache__[cacheSymbol] &&
      ast.__cache__[cacheSymbol].computedWith === ast
    ) {
      return ast.__cache__[cacheSymbol].value as T;
    } else {
      const result = fn(ast);
      ast.__cache__[cacheSymbol] = {
        // if the property accidentally gets included on the wrong node (like
        // via the splat operator), this invalidates it.
        computedWith: ast,
        value: result,
      };
      return result;
    }
  };
}

// returns a new AST without the caches
function purgeAstCache(ast: Expr): Expr {
  let newAst: Expr;

  switch (ast.type) {
    case "variable":
      newAst = ast;
      break;
    case "function":
      newAst = {
        ...ast,
        body: purgeAstCache(ast.body),
      };
      break;
    case "application":
      newAst = {
        ...ast,
        left: purgeAstCache(ast.left),
        right: purgeAstCache(ast.right),
      };
      break;
  }

  delete newAst.__cache__;
  return newAst;
}

// TODO: Should for consistensy change to [name]
const getFreeVars = cacheOnAst(function getFreeVarsUnmemoized(
  expression: Expr
): VariableExpression[] {
  switch (expression.type) {
    case "variable":
      return [expression];
    case "function":
      return getFreeVars(expression.body).filter(
        (token) => token.name !== expression.argument
      );
    case "application":
      const leftFree = getFreeVars(expression.left);
      const rightFree = getFreeVars(expression.right);
      return uniqBy(
        (term: VariableExpression) => term.name,
        leftFree.concat(rightFree)
      );
  }
});

export { getFreeVars, cacheOnAst, purgeAstCache };
