import { uniqBy } from 'ramda';
/*

  Q: represent textually or not?
  A: Textual representation allows for unambiguous logic/extensibility.

  Q: do we use lambda symbols in utf?
  A: hell yeah we do!
    most functions will have a string => string format (dead simple)
    but we'll also expose parsed expressions.
*/


// God I can hardly decide whether to make arguments of type token ornot.
// Probably yes.
/* type term oneOf:
  { type: 'token', name: 'n'}
  { type: 'function', argument: 'n', body:  [expression]}
  { type: 'application', left: [expression], right: [expression]}
*/

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

// regex for name
// [a-zA-Z]

// regex for lambda
// λ[a-zA-Z]\..+

// regex for application
// rn I suck at parsing, so I don't know how to handle parens.
// So a lambda can only end an application.
// ^(λ[a-zA-Z]\..+[a-zA-Z]){2}$
// without just lambda expressions yet.

// str => Expression
export function parseTerm(str){
  if (surroundedByParens(str)) {// Is surrounded by
    return parseTerm(str.slice(1, -1));
  } else if (/^[a-zA-Z]$/.test(str)) { // looks like a token
    return {
      type: 'token',
      name: str,
    }
  } else if (/^λ[a-zA-Z]\..+/.test(str)) { // Looks like a lambda expression
    return {
      type: 'function',
      argument: str[1],
      body: parseTerm(str.slice(3)),
    };
  } else if (/^[a-zA-Z]+/.test(str)) {
    // application:
    // Either gonna start with a sequence of letters,
    // or a parens'd expression, so we can divide by that.
    // this case is with a sequence of letters
    let splitPoint = str.search(/[^a-zA-Z]/);
    if (splitPoint < 0) {
      splitPoint = str.length - 1;
    }
    return {
      type: 'application',
      left: parseTerm(str.slice(0, splitPoint)),
      right: parseTerm(str.slice(splitPoint)),
    }
  } else if(/^\(/.test(str)) {
    // application, starting with a paren.
    let depth = 0;
    let splitPoint = -1;
    for (let i = 0; i < str.length; i++){
      const cur = str[i];
      if (cur === '(') {
        depth++;
      }
      if (cur === ')') {
        depth--;
      }
      if (depth === 0) {
        splitPoint = i + 1;
        break;
      }
    }
    if (splitPoint < 0) {
      throw 'Unmatched Paren';
    }
    return {
      type: 'application',
      left: parseTerm(str.slice(0, splitPoint)),
      right: parseTerm(str.slice(splitPoint)),
    }
  }

  throw 'Syntax Error';
}

function surroundedByParens(str) {
  // first check if it starts and ends with
  if (str[0] !== '(' || str.slice(-1) !== ')') {
    return false;
  }
  const rest = str.slice(1,-1);
  let depth = 0;
  for (let i = 0; i < rest.length; i++){
    const cur = rest[i];
    if (cur === '(') {
      depth++;
    }
    if (cur === ')') {
      depth--;
    }
    if (depth < 0) {
      return false;
    }
  }
  return true;
}

// Expression -> bool
function bReducable(exp){
  return (exp.type === 'application' && exp.left.type === 'function');
}

// We don't know whether we CAN beta reduce the term
// Expression => Maybe(Expression)
function bReduce(exp) {
  if (!bReducable(exp)) {
    return undefined;
  }
}

export function renderExpression(expression){
  switch(expression.type) {
    case 'application':
      let leftSide;
      if(expression.left.type !== 'function'){
        leftSide = renderExpression(expression.left);
      } else {
        leftSide = `(${renderExpression(expression.left)})`
      }
      return `${leftSide}${renderExpression(expression.right)}`;
    case 'function':
      return `λ${expression.argument}.${renderExpression(expression.body)}`
    case 'token':
      return expression.name;
  }
}
