import { tokenize } from './lexer';


/*
  types:

  [name] a character followed by a bunch of subscripts

  [expression] one of:
    {
      type: 'application',
      left: [expression],
      right: [expression]
    },
    {
      type: 'function'
      argument: [name],
      body: [expression],
    },
    {
      type: 'token',
      value: [name],
    }

  [statement] one of:
    [expression],
    {
      type: 'assignment'
      left: [name],
      right: [expression],
    }

*/

let item;

// this one'll be a better entry point
function parseStatement(tokenStream){
  // stub for right now.
  throw 'not implemented';
}

function parseStream(tokenStream){
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

function popExpression(tokenStream){
  // 3 cases. 1:
  const nextToken = tokenStream[0];
  //debugger;
  switch(nextToken.type){
    case 'identifier':
      return [
        {type: 'token', name: nextToken.value},
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
      // right now I'm not handling multiple arguments, but in the future I will!
      const args = tokenStream.slice(1, dotPosition);
      if(args.length !== 1){
        throw('Syntax Error: Bad number of arguments');
      }
      return [{
          type: 'function',
          argument: args[0].value,
          body: parseStream(tokenStream.slice(dotPosition + 1)),
        },
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
        parseStream(tokenStream.slice(1, splitPoint - 1)),
        tokenStream.slice(splitPoint)
      ]
    default:
      throw('Syntax Error: Unexpected Token');
  }
}

export function parseTerm(str){
  return parseStream(tokenize(str));
}
