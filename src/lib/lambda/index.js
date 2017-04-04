import { uniqBy } from 'ramda';

// ---
// lol how do i even do named exports
import { parseTerm as pt } from './parser';
import { renderExpression as rex } from './renderer';
import { renderAsChurchNumeral as rcn, renderAsChurchBoolean as rcb } from './churchPrimitives';
export const parseTerm = pt;
export const renderExpression = rex;
export const renderAsChurchNumeral = rcn;
export const renderAsChurchBoolean = rcb;

// ---

const cacheKey = '__lambdacache';

// Should for consistensy change to [name]
// Expression => [Token, ...]
export function getFreeVars(expression){
  switch(expression.type){
    case 'token':
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
}

// Expression -> bool
function bReducable(exp){
  return (exp.type === 'application' && exp.left.type === 'function');
}

function nextAvailableName(names){
  // shit alg that works.
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  return alphabet.split('').filter(letter => names.includes(letter))[0];
}

// We don't know whether we CAN beta reduce the term
// Expression => Maybe(Expression)
export function bReduce(expression) {
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

export function eReduce(expression){
  if (!eReducable(expression)) {
    return undefined;
  }
  return expression.body.left;
}

// Call by name eval strategy
// Expression -> Expression (with a depth overflow)
export function toNormalForm(expression) {
  const depthOverflow = 10000;
  let count = 0;
  let current;
  let reduced = expression;
  do {
    current = reduced;
    reduced = leftmostOutermostRedex(current);
    count++;
    if (count >= depthOverflow) {
      console.warn('normal form depth exceeded');
      break;
    }
  } while (reduced !== undefined);
  return current;
}

// Expression => Maybe(Expression)
export function leftmostOutermostRedex(expression){
  if(bReducable(expression)) {
    return bReduce(expression);
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
  if (expression.type === 'token') {
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
