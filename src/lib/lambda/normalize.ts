import { bReducable, bReduce, eReducable, eReduce } from './operations';

// Call by name eval strategy
// Expression -> Expression (with a depth overflow)
function toNormalForm(expression, depthOverflow = 1000) {
  let count = 0;
  let current;
  let reduced = expression;
  do {
    current = reduced;
    reduced = leftmostOutermostRedex(current);
    count++;
    if (count >= depthOverflow) {
      throw 'Runtime error: normal form execution exceeded';
    }
  } while (reduced !== undefined);
  return current;
}

// Expression => Maybe(Expression)
function leftmostOutermostRedex(expression){
  if(bReducable(expression)) {
    return bReduce(expression);
  }
  if (eReducable(expression)) {
    eReduce(expression);
  }
  if (expression.type === 'function'){
    const res = leftmostOutermostRedex(expression.body);
    if (res === undefined) {
      return undefined;
    } else {
      return {
        type: 'function',
        argument: expression.argument,
        body: res,
      }
    }
  }
  if (expression.type === 'variable') {
    return undefined;
  }
  if (expression.type === 'application'){
    const leftReduced = leftmostOutermostRedex(expression.left);
    if (leftReduced !== undefined) {
      return {
        type: 'application',
        left: leftReduced,
        right: expression.right
      };
    }
    const rightReduced = leftmostOutermostRedex(expression.right);
    if (rightReduced !== undefined) {
      return {
        type: 'application',
        left: expression.left,
        right: rightReduced,
      };
    }
    return undefined;
  }
}

export {
  toNormalForm,
  leftmostOutermostRedex
};
