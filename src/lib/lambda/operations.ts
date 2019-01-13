import { getFreeVars } from './util';
import { LambdaExpression as Expr, Name, Maybe } from './types';

// Expression -> bool
function bReducable(exp : Expr) : boolean {
  return (exp.type === 'application' && exp.left.type === 'function');
}

// We don't know whether we CAN beta reduce the term
// Expression => Maybe(Expression)
function bReduce(expression) : Maybe<Expr> {
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
function eReducable(expression : Expr) : boolean {
  if (
    expression.type !== 'function' ||
    expression.body.type !== 'application' ||
    expression.body.right.type !== 'variable'
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

// Expr -> Maybe(Expr)
function eReduce(expression) : Maybe<Expr> {
  if (!eReducable(expression)) {
    return undefined;
  }
  return expression.body.left;
}


// Total garbage implementation
const replacementMapping = {
  0: '₀',
  1: '₁',
  2: '₂',
  3: '₃',
  4: '₄',
  5: '₅',
  6: '₆',
  7: '₇',
  8: '₈',
  9: '₉',
  'L': 'λ',
};

const replaceAll = str => str.split('').map(
  letter => (replacementMapping[letter] || letter)
).join('');

// For some reason typescript doesn't think arrays have includes on them
function generateNewName(freeVars) : string {
  let counter = 0;
  let nextName : string;
  do {
    counter++;
    nextName = replaceAll('ε' + counter);
  } while(freeVars.includes(nextName));
  return nextName;
}

// Replaces everything named name in expression with replacer
// Follows the rules for capture-avoiding substitutions
function replace(nameToReplace : Name, replacer : Expr, expression : Expr) : Expr {
  switch(expression.type) {
    case 'application':
      return {
        type: 'application',
        left: replace(nameToReplace, replacer, expression.left),
        right: replace(nameToReplace, replacer, expression.right)
      };
    case 'function':
      // shadowing
      if (nameToReplace === expression.argument) {
        return expression;
      }

      // capture avoidance 
      const freeInReplacer = getFreeVars(replacer).map(node => node.name);
      let alphaSafeExpression = expression;
      if (freeInReplacer.includes(expression.argument)) {

        // Then we pick a new name that
        //  1: isn't free in the replacer
        //  2: isn't free in the expression body
        const freeInExpressionBody = getFreeVars(expression.body).map(node => node.name);
        let newName = generateNewName(freeInReplacer.concat(freeInExpressionBody));

        // And make that the new function arg name
        alphaSafeExpression = {
          type: 'function',
          argument: newName,
          body: replace(
            expression.argument,
            { type: 'variable', name: newName },
            expression.body
          ),
        };
      }
      return {
        type: 'function',
        argument: alphaSafeExpression.argument,
        body: replace(
          nameToReplace,
          replacer,
          alphaSafeExpression.body,
        )
      };
    case 'variable':
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
