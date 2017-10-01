import {
  LambdaExpression as Expr,
  LambdaStatement as Statement,
  LambdaToken as Token,
} from './types';
import { tokenize } from './lexer';

// this one'll be a better entry point
// LambdaToken[] -> Statement (because the typechecker is missing vast swathes of things.)
export function parseStatement(tokenStream) : Statement {
  // could handle errors better-- this one just will say unexpected token
  // when it reaches a nonstandard assignment token.
  if (
    tokenStream.length >= 2
    && tokenStream[0].type === 'identifier'
    && tokenStream[1].type === 'assignment'
  ) {
    let lhs = tokenStream[0].value;
    let rhs = parseExpression(tokenStream.splice(2));
    return { type: 'assignment', lhs, rhs };
  }
  return parseExpression(tokenStream);
}

export function parseExpression(tokenStream : Token[]) : Expr {
  if(tokenStream.length === 0){
    throw('Syntax Error: Empty Expression');
  }
  let expression, rest;
  [expression, rest] = popExpression(tokenStream);
  let applications = [expression];
  while(rest.length !== 0){
    [expression, rest] = popExpression(rest);
    applications.push(expression);
  }
  // For right-associativity.
  return applications.reduce((prev, cur) => ({
    type: 'application',
    left: prev,
    right: cur
  }));
  // And reduce to produce the application
}

// tokenArray
function popExpression(tokenStream) : [Expr, Token[]] {
  // 3 cases. 1:
  const nextToken = tokenStream[0];
  //debugger;
  switch(nextToken.type){
    case 'identifier':
      return [
        {type: 'variable', name: nextToken.value},
        tokenStream.slice(1)
      ];
    case 'lambda':
      // scan forward to find the dot, add in arguments
      if(tokenStream.length < 2) {
        throw('Syntax Error: Unexpected end of lambda');
      }
      let dotPosition = 1;
      while(tokenStream[dotPosition].type !== 'dot') {
        if(tokenStream[dotPosition].type !== 'identifier'){
          throw('Syntax Error: non-identifier in argument stream');
        }
        dotPosition++;
        if (dotPosition >= tokenStream.length){
          throw('Syntax Error: Unexpected end of lambda');
        }
      }

      const args = tokenStream.slice(1, dotPosition);
      if(args.length === 0){
        throw('Syntax Error: Bad number of arguments');
      }
      const childExp = parseExpression(tokenStream.slice(dotPosition + 1));
      const exp = args.reduceRight((acc, cur) => ({
        type: 'function',
        argument: cur.value,
        body: acc,
      }), childExp);
      return [
        exp,
        [] //because it will always end the whole expression
      ];
    case 'openParen':
      let depth = 0;
      let splitPoint = -1;
      for (let i = 0; i < tokenStream.length; i++){
        const cur = tokenStream[i];
        if (cur.type === 'openParen') {
          depth++;
        }
        if (cur.type === 'closeParen') {
          depth--;
        }
        if (depth === 0) {
          splitPoint = i + 1;
          break;
        }
      }
      if (splitPoint < 0) {
        throw 'Syntax Error: Unmatched Paren';
      }
      return [
        parseExpression(tokenStream.slice(1, splitPoint - 1)),
        tokenStream.slice(splitPoint)
      ]
    default:
      throw('Syntax Error: Unexpected Token');
  }
}


// We should rename these to be better.
export function parseTerm(str) {
  return parseExpression(tokenize(str));
}

// This isn't understood by most helper functions, as it's an extension of the lambda calculus.
// TODO: make this more well supported.
export function parseExtendedSyntax(str){
  return parseStatement(tokenize(str));
}
