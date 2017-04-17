import { getFreeVars } from './util';

// Expression -> bool
function bReducable(exp){
  return (exp.type === 'application' && exp.left.type === 'function');
}

// We don't know whether we CAN beta reduce the term
// Expression => Maybe(Expression)
function bReduce(expression) {
  if (!bReducable(expression)) {
    return undefined;
  }
  return replace(
    expression.left.argument,
    expression.right,
    expression.left.body
  );
}

// Expression => bool
function eReducable(expression){
  if (
    expression.type !== 'function' ||
    expression.body.type !== 'application' ||
    expression.body.right.type !== 'token'
  ) {
    return false;
  }
  // --
  if (expression.body.right.name !== expression.argument) {
    return false;
  }

  const freeInF = getFreeVars(expression.body.left).map(token => token.name);
  if (freeInF.includes(expression.argument)) {
    return false;
  }
  return true;
}

function eReduce(expression){
  if (!eReducable(expression)) {
    return undefined;
  }
  return expression.body.left;
}

// name => Expression => Expression => Expression
// Replaces everything named name in expression with replacer
function replace(nameToReplace, replacer, expression) {
  switch(expression.type) {
    case 'application':
      return {
        type: 'application',
        left: replace(nameToReplace, replacer, expression.left),
        right: replace(nameToReplace, replacer, expression.right)
      };
    case 'function':
      if (nameToReplace === expression.argument) {
        // We ignore overwritten vars for right now.
        return expression;
      }
      return {
        type: 'function',
        argument: expression.argument,
        body: replace(nameToReplace, replacer, expression.body)
      };
    case 'token':
      return expression.name === nameToReplace ? replacer : expression;
  }
};

export {
  bReducable,
  bReduce,
  eReducable,
  eReduce,
  replace
}
