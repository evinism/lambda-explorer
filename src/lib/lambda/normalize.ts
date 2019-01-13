import { LambdaExpression as Expr, Maybe, Closure } from './types';
import { bReducable, bReduce } from './operations';
import { addToClosure } from './closure';

function toNormalForm(
    expression : Expr,
    depthOverflow : Number = 1000,
    closure : Closure = {}
  ) : Expr {
  let count = 0;
  let current;
  let reduced : Maybe<Expr> = expression;
  do {
    current = reduced;
    reduced = leftmostOutermostRedex(current, closure);
    count++;
    if (count >= depthOverflow) {
      throw { message: 'Runtime error: normal form execution exceeded' };
    }
  } while (reduced !== undefined);
  return current;
}

function leftmostOutermostRedex(expression: Expr, closure : Closure) : Maybe<Expr> {
  if(bReducable(expression)) {
    return bReduce(expression, closure);
  }
  if (expression.type === 'function'){
    const res = leftmostOutermostRedex(
      expression.body,
      addToClosure(closure, expression.argument)
    );
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
    const leftReduced = leftmostOutermostRedex(
      expression.left,
      closure
    );
    if (leftReduced !== undefined) {
      return {
        type: 'application',
        left: leftReduced,
        right: expression.right
      };
    }
    const rightReduced = leftmostOutermostRedex(
      expression.right,
      closure
    );
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
