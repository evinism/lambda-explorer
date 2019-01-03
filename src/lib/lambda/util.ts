import { uniqBy, pickBy, map } from 'ramda';

function cacheOnAst(fn){
  const cacheSymbol = `__cache__${fn.name}_${Math.random().toString().slice(2)}`;
  return ast => {
    if (ast[cacheSymbol] && (ast[cacheSymbol].computedWith === ast)) {
      return ast[cacheSymbol].value;
    } else {
      const result = fn(ast);
      ast[cacheSymbol] = {
        // if the property accidentally gets included on the wrong node (like
        // via the splat operator), this invalidates it.
        computedWith: ast,
        value: result,
      };
      return result;
    }
  }
}

// returns a new AST without the caches
function purgeAstCache(ast){
  const shallowWithoutCache = pickBy(
    (value, key) =>
      key.slice(0, 9) != '__cache__',
    ast
  );
  return map(
    value =>
      (value instanceof Object) ? purgeAstCache(value) : value,
    shallowWithoutCache
  );
}

// TODO: Should for consistensy change to [name]
// Expression => [VariableNode, ...]
const getFreeVars = cacheOnAst(function getFreeVarsUnmemoized(expression){
  switch(expression.type){
    case 'variable':
      return [expression];
    case 'function':
      return getFreeVars(expression.body).filter(
        token => token.name !== expression.argument
      );
    case 'application':
      const leftFree = getFreeVars(expression.left);
      const rightFree = getFreeVars(expression.right);
      return uniqBy(
        term => term.name,
        leftFree.concat(rightFree)
      );
  }
});

const emptyContext = {};

export {
  emptyContext,
  getFreeVars,
  cacheOnAst,
  purgeAstCache,
};
